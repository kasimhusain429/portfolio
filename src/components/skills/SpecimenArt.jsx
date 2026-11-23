/**
 * SpecimenArt — a small botanical ink drawing, generated per skill.
 * Four plant types (sprig, bloom, fern, pod), varied by a seed so every
 * specimen in the cabinet is different but drawn in the same hand.
 */
import { memo } from 'react'

const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const f = (n) => Math.round(n * 10) / 10

/** almond leaf anchored at (0,0), pointing up (-y) */
const leaf = (len, w) => `M0,0 Q${f(w)},${f(-len * 0.5)} 0,${f(-len)} Q${f(-w)},${f(-len * 0.5)} 0,0Z`

function stemPoint(t, bend) {
  // quadratic stem from (50,94) curving to the top
  const x0 = 50
  const y0 = 94
  const cx = 50 + bend * 26
  const cy = 55
  const x1 = 50 + bend * 10
  const y1 = 12
  const u = 1 - t
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
    a: Math.atan2(2 * u * (cy - y0) + 2 * t * (y1 - cy), 2 * u * (cx - x0) + 2 * t * (x1 - cx)),
  }
}

function SpecimenArt({ kind, seed, className = '' }) {
  const r = (n) => rand(seed, n)
  const bend = (r(1) - 0.5) * 1.2
  const top = stemPoint(1, bend)
  const stem = `M50,94 Q${f(50 + bend * 26)},55 ${f(top.x)},${f(top.y)}`
  const parts = []

  if (kind === 'sprig' || kind === 'pod') {
    const n = 5 + Math.floor(r(2) * 3)
    for (let i = 0; i < n; i++) {
      const t = 0.22 + (i / n) * 0.7
      const p = stemPoint(t, bend)
      const side = i % 2 ? 1 : -1
      const len = (kind === 'pod' ? 13 : 20) * (1 - t * 0.45) + r(10 + i) * 4
      const ang = (p.a * 180) / Math.PI + 90 + side * (48 + r(20 + i) * 18)
      parts.push(
        <g key={`l${i}`} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(ang)})`}>
          <path d={leaf(len, len * 0.32)} className="fill-hue-300/45" />
          <path d={`M0,0 L0,${f(-len * 0.85)}`} strokeWidth="0.7" />
        </g>,
      )
    }
    if (kind === 'pod') {
      for (let i = 0; i < 3; i++) {
        const p = stemPoint(0.55 + i * 0.2, bend)
        const side = i % 2 ? 1 : -1
        const cx = p.x + side * (9 + r(30 + i) * 3)
        const cy = p.y - 3
        parts.push(
          <g key={`p${i}`}>
            <path d={`M${f(p.x)},${f(p.y)} Q${f((p.x + cx) / 2)},${f(cy - 6)} ${f(cx)},${f(cy)}`} strokeWidth="0.8" />
            <circle cx={f(cx)} cy={f(cy)} r={f(4.2 + r(40 + i) * 1.6)} className="fill-hue-300/50" />
            <circle cx={f(cx - 1)} cy={f(cy - 1)} r="1.2" className="fill-hue-500" stroke="none" />
          </g>,
        )
      }
    }
  }

  if (kind === 'bloom') {
    for (let i = 0; i < 2; i++) {
      const p = stemPoint(0.35 + i * 0.22, bend)
      const side = i % 2 ? 1 : -1
      const ang = (p.a * 180) / Math.PI + 90 + side * 55
      parts.push(
        <g key={`bl${i}`} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(ang)})`}>
          <path d={leaf(22, 7)} className="fill-hue-300/45" />
          <path d="M0,0 L0,-19" strokeWidth="0.7" />
        </g>,
      )
    }
    const petals = 6 + Math.floor(r(3) * 3)
    const pl = 13 + r(4) * 4
    for (let i = 0; i < petals; i++) {
      parts.push(
        <path
          key={`pt${i}`}
          d={leaf(pl, pl * 0.34)}
          transform={`translate(${f(top.x)} ${f(top.y + 4)}) rotate(${f((360 / petals) * i + r(5) * 30)})`}
          className="fill-hue-300/55"
        />,
      )
    }
    parts.push(<circle key="c" cx={f(top.x)} cy={f(top.y + 4)} r="3.4" className="fill-hue-500" stroke="none" />)
  }

  if (kind === 'fern') {
    const n = 9
    for (let i = 0; i < n; i++) {
      const t = 0.18 + (i / n) * 0.8
      const p = stemPoint(t, bend)
      const len = 17 * (1 - t * 0.75) + 2
      const base = (p.a * 180) / Math.PI + 90
      for (const side of [-1, 1]) {
        parts.push(
          <path
            key={`f${i}${side}`}
            d={leaf(len, len * 0.22)}
            transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${f(base + side * 62)})`}
            className="fill-hue-300/40"
          />,
        )
      }
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="var(--hue-500)"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={stem} strokeWidth="1.4" />
      {parts}
      {/* tiny root tuft at the base */}
      <path d="M50,94 q-4,3 -7,4 M50,94 q3,3 6,5 M50,94 q0,3 -1,5" strokeWidth="0.6" />
    </svg>
  )
}

export default memo(SpecimenArt)
