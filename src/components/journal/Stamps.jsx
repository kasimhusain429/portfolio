/**
 * Postage stamps for the journal's back pocket: perforated paper, original
 * illustrations, a gummed back with a handwritten note, and an ink postmark.
 */
import { useId, useMemo } from 'react'
import { motion } from 'framer-motion'

/** perforated-edge mask (holes punched along all four edges) */
function perfMask(w, h, r = 4.4, step = 13) {
  let holes = ''
  const hole = (cx, cy) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
  const nx = Math.round(w / step)
  const ny = Math.round(h / step)
  for (let i = 0; i <= nx; i++) {
    const x = (w / nx) * i
    holes += hole(x, 0) + hole(x, h)
  }
  for (let j = 1; j < ny; j++) {
    const y = (h / ny) * j
    holes += hole(0, y) + hole(w, y)
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><defs><clipPath id='c'><rect width='${w}' height='${h}'/></clipPath></defs><path clip-path='url(#c)' fill-rule='evenodd' d='M0 0H${w}V${h}H0Z${holes}'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/* ─── Illustrations (viewBox 100×78) ────────────────────────── */
function Art({ s }) {
  const { fg, accent } = s
  switch (s.art) {
    case 'sites':
      return (
        <>
          <rect x="18" y="20" width="64" height="46" rx="4" fill="none" stroke={fg} strokeWidth="2.6" />
          <path d="M18 31h64" stroke={fg} strokeWidth="2" />
          {[24, 30, 36].map((x) => <circle key={x} cx={x} cy="25.5" r="1.8" fill={accent} />)}
          <path d="M50 64V44" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M50 50c-9-1-13-8-12-14 7 0 12 5 12 14Z" fill={accent} />
          <path d="M50 46c7-2 10-9 9-14-6 1-10 6-9 14Z" fill={fg} />
          <path d="M8 70h84" stroke={accent} strokeWidth="1.6" strokeDasharray="2 3" />
        </>
      )
    case 'speed':
      return (
        <>
          <circle cx="54" cy="42" r="24" fill="none" stroke={fg} strokeWidth="2.6" />
          <path d="M54 18v-6M48 12h12" stroke={fg} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M54 42 66 30" stroke={fg} strokeWidth="3" strokeLinecap="round" />
          <circle cx="54" cy="42" r="3" fill={fg} />
          <path d="M30 42a24 24 0 0 1 7-17" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" />
          {[30, 40, 50].map((y, i) => (
            <path key={y} d={`M${8 + i * 3} ${y}h${14 - i * 3}`} stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          ))}
        </>
      )
    case 'users':
      return (
        <>
          {Array.from({ length: 15 }, (_, k) => {
            const x = 20 + (k % 5) * 15
            const y = 18 + Math.floor(k / 5) * 18
            const hot = k === 7
            return (
              <g key={k} fill={hot ? accent : fg} opacity={hot ? 1 : 0.85}>
                <circle cx={x} cy={y} r="4" />
                <path d={`M${x - 6} ${y + 12}a6 6 0 0 1 12 0Z`} />
              </g>
            )
          })}
        </>
      )
    case 'london':
      return (
        <>
          <path d="M8 66q10-4 20 0t20 0 20 0 24 0" fill="none" stroke={accent} strokeWidth="2" />
          <rect x="40" y="22" width="20" height="44" fill={fg} />
          <path d="M38 22h24L50 4Z" fill={fg} />
          <circle cx="50" cy="32" r="6.5" fill={s.bg} />
          <path d="M50 32v-4M50 32l3 2" stroke={fg} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M44 44h12M44 52h12M44 60h12" stroke={s.bg} strokeWidth="1.4" />
          <rect x="16" y="46" width="16" height="20" fill={accent} />
          <rect x="68" y="40" width="18" height="26" fill={accent} />
        </>
      )
    case 'sydney':
      return (
        <>
          <path d="M6 22q44-26 88 0" fill="none" stroke={fg} strokeWidth="2" />
          {[18, 30, 42, 54, 66, 78].map((x) => <path key={x} d={`M${x} ${x < 50 ? 18 - (x - 6) / 8 : 18 - (94 - x) / 8}v6`} stroke={fg} strokeWidth="1" />)}
          <path d="M22 62c4-18 12-26 22-30-4 10-4 20 0 30Z" fill={accent} />
          <path d="M38 62c5-22 15-32 28-36-6 12-6 24-2 36Z" fill={s.fg} />
          <path d="M58 62c4-16 11-23 20-26-4 9-4 18-1 26Z" fill={accent} />
          <path d="M8 63h84" stroke={fg} strokeWidth="2.4" />
          <path d="M14 70q8-3 16 0t16 0 16 0 16 0 16 0" fill="none" stroke={fg} strokeWidth="1.4" opacity="0.6" />
        </>
      )
    case 'ahmedabad':
    default:
      return (
        <>
          <circle cx="78" cy="18" r="8" fill={accent} opacity="0.35" />
          <g transform="rotate(-12 34 30)">
            <path d="M34 8 50 30 34 52 18 30Z" fill={accent} />
            <path d="M34 8v44M18 30h32" stroke={s.bg} strokeWidth="1.2" />
            <path d="M34 52q-4 8 2 12t-2 12" fill="none" stroke={fg} strokeWidth="1.2" />
          </g>
          <g transform="rotate(14 70 44)">
            <path d="M70 30 80 44 70 58 60 44Z" fill={fg} />
            <path d="M70 30v28M60 44h20" stroke={s.bg} strokeWidth="1" />
          </g>
          <path d="M50 74C58 66 62 60 69 58" fill="none" stroke={fg} strokeWidth="0.8" opacity="0.7" />
          <path d="M8 74c20-6 34-6 52 0" fill="none" stroke={fg} strokeWidth="0.8" opacity="0.35" />
        </>
      )
  }
}

export function Postmark({ className = '', on, place = 'AHMEDABAD', delay = 0 }) {
  const id = 'pm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <motion.svg
      viewBox="0 0 150 90"
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
      initial={false}
      animate={on ? { opacity: 0.72, scale: 1 } : { opacity: 0, scale: 1.35 }}
      transition={on ? { type: 'spring', stiffness: 520, damping: 22, delay } : { duration: 0 }}
    >
      <defs>
        <path id={`${id}c`} d="M45 45m-30 0a30 30 0 1 1 60 0a30 30 0 1 1-60 0" />
        <filter id={`${id}r`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="9" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 1 1 0.5 1 1" />
          </feComponentTransfer>
        </filter>
      </defs>
      <g filter={`url(#${id}r)`} fill="none" stroke="var(--color-ink-950)" strokeWidth="2">
        <circle cx="45" cy="45" r="38" />
        <text fill="var(--color-ink-950)" stroke="none" fontSize="9" letterSpacing="1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <textPath href={`#${id}c`}>{place} · KASIM POST ·</textPath>
        </text>
        <text x="45" y="50" textAnchor="middle" fill="var(--color-ink-950)" stroke="none" fontSize="12" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          2026
        </text>
        {[30, 40, 50, 60].map((y) => (
          <path key={y} d={`M86 ${y}q8-5 16 0t16 0 16 0 14 0`} />
        ))}
      </g>
    </motion.svg>
  )
}

/* ─── Faces ─────────────────────────────────────────────────── */
export function StampFront({ s, w, h, n }) {
  const mask = useMemo(() => perfMask(w, h), [w, h])
  const long = s.value.length > 5
  return (
    <div className="absolute inset-0 [backface-visibility:hidden] [filter:drop-shadow(0_6px_10px_color-mix(in_srgb,_var(--color-ink-950)_45%,_transparent))]">
      <div
        className="journal-paper absolute inset-0 p-[7%] [container-type:inline-size]"
        style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
      >
        <div className="relative h-full w-full overflow-hidden shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--color-ink-950)_15%,_transparent)]" style={{ background: s.bg, color: s.fg }}>
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(color-mix(in_srgb,_var(--color-paper-hi)_35%,_transparent)_0.6px,transparent_0.8px)] [background-size:4px_4px]" />
          <p className={`absolute left-[7%] top-[5%] font-display font-semibold leading-none tracking-[-0.03em] ${long ? 'text-[13cqw]' : 'text-[24cqw]'}`}>
            {s.value}
          </p>
          <p className="absolute right-[6%] top-[6%] font-mono text-[5cqw] tracking-[0.1em] opacity-90 [writing-mode:vertical-rl]">KASIM POST</p>
          <svg viewBox="0 0 100 78" className="absolute inset-x-[4%] top-[30%] w-[92%]">
            <Art s={s} />
          </svg>
          <div className="absolute inset-x-[7%] bottom-[5%] flex items-end justify-between">
            <p className="font-serif text-[9.5cqw] italic leading-[0.95]">{s.label}</p>
            <p className="font-mono text-[5cqw] opacity-90">№{String(n).padStart(2, '0')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StampBack({ s, w, h, n }) {
  const mask = useMemo(() => perfMask(w, h), [w, h])
  return (
    <div className="absolute inset-0 [backface-visibility:hidden] [filter:drop-shadow(0_6px_10px_color-mix(in_srgb,_var(--color-ink-950)_45%,_transparent))] [transform:rotateY(180deg)]">
      <div
        className="absolute inset-0 flex flex-col bg-[linear-gradient(160deg,var(--color-paper-hi),var(--color-paper-2)_60%,var(--color-paper))] p-[10%] [container-type:inline-size]"
        style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
      >
        {/* gum sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_30%,color-mix(in_srgb,_var(--color-paper-hi)_80%,_transparent)_45%,transparent_60%)] opacity-60" />
        <p className="relative font-mono text-[5.5cqw] uppercase tracking-[0.2em] text-ink-soft">
          №{String(n).padStart(2, '0')} · {s.value}
        </p>
        <p className="font-ink relative mt-[6%] text-[10.5cqw] leading-[1.08]">{s.back}</p>
        <p className="relative mt-auto font-serif text-[7cqw] italic text-hue-700">— K.H.</p>
      </div>
    </div>
  )
}
