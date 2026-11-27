/**
 * roots.js — procedural geometry for the About section's root system.
 *
 * Produces, for the trunk, every branch and every rootlet, both an SVG path
 * string (fallback renderer) and a sampled polyline (the WebGL ink ribbons).
 * Deterministic, so the root looks the same on every visit.
 */

const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}
const r1 = (n) => Math.round(n * 10) / 10

const bez = (a, b, c, d, t) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

/** sample a cubic [p0, c1, c2, p3] into points (skipping the first if `skipFirst`) */
function sampleCubic([p0, c1, c2, p3], steps, out, skipFirst = false) {
  for (let k = skipFirst ? 1 : 0; k <= steps; k++) {
    const t = k / steps
    out.push({ x: bez(p0.x, c1.x, c2.x, p3.x, t), y: bez(p0.y, c1.y, c2.y, p3.y, t) })
  }
  return out
}

const cubicD = ([p0, c1, c2, p3]) =>
  `M${r1(p0.x)},${r1(p0.y)} C${r1(c1.x)},${r1(c1.y)} ${r1(c2.x)},${r1(c2.y)} ${r1(p3.x)},${r1(p3.y)}`

/** Catmull-Rom → cubic Bézier segments */
function spline(pts) {
  const segs = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    segs.push([
      p1,
      { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    ])
  }
  let d = `M${r1(pts[0].x)},${r1(pts[0].y)}`
  for (const [, c1, c2, p2] of segs) d += ` C${r1(c1.x)},${r1(c1.y)} ${r1(c2.x)},${r1(c2.y)} ${r1(p2.x)},${r1(p2.y)}`
  return { d, segs }
}

/** x of the trunk at a given y (the trunk is monotonic in y). */
function xAtY(segs, y) {
  for (const [p1, c1, c2, p2] of segs) {
    if (y < p1.y || y > p2.y) continue
    let lo = 0
    let hi = 1
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) / 2
      if (bez(p1.y, c1.y, c2.y, p2.y, mid) < y) lo = mid
      else hi = mid
    }
    return bez(p1.x, c1.x, c2.x, p2.x, (lo + hi) / 2)
  }
  const last = segs[segs.length - 1]
  return last ? last[3].x : 0
}

/**
 * @param {object} o
 * @param {number} o.trunkX   x of the trunk (section coordinates)
 * @param {number} o.endY     where the trunk ends (the closing seed)
 * @param {{key:string,x:number,y:number}[]} o.anchors  branch targets
 * @param {boolean} o.mobile
 */
export function buildRoots({ trunkX, endY, anchors, mobile }) {
  const amp = mobile ? 5 : 22
  const step = mobile ? 170 : 250
  const pts = []
  for (let y = 0, i = 0; y < endY - step * 0.5; y += step, i++) {
    pts.push({ x: trunkX + (i === 0 ? 0 : amp * Math.sin(i * 1.27 + 0.5)), y })
  }
  pts.push({ x: trunkX, y: endY })
  const trunk = spline(pts)
  const trunkPts = []
  trunk.segs.forEach((s, i) => sampleCubic(s, 24, trunkPts, i > 0))

  const branches = anchors.map((a) => {
    const jy = Math.max(12, a.y - (mobile ? 64 : 150))
    const jx = xAtY(trunk.segs, jy)
    const k = a.y - jy
    const c = [
      { x: jx, y: jy },
      { x: jx, y: jy + k * 0.7 },
      { x: a.x + (jx - a.x) * 0.45, y: a.y - 3 },
      { x: a.x, y: a.y },
    ]
    return { key: a.key, d: cubicD(c), pts: sampleCubic(c, 40, []), y0: jy, span: mobile ? 76 : 150 }
  })

  const rootlets = []
  const add = (c, y0, span, w) => rootlets.push({ d: cubicD(c), pts: sampleCubic(c, 14, []), y0, span, w })
  let i = 0
  for (let y = 80; y < endY - 80; y += mobile ? 115 : 135, i++) {
    const side = mobile ? -1 : i % 2 ? 1 : -1
    const len = mobile ? 9 + rand(i, 1) * 9 : 30 + rand(i, 1) * 46
    const sx = xAtY(trunk.segs, y)
    const ex = sx + side * len
    const ey = y + len * 0.75 + rand(i, 2) * 18
    add(
      [
        { x: sx, y },
        { x: sx + side * len * 0.15, y: y + len * 0.45 },
        { x: ex - side * len * 0.35, y: ey - len * 0.15 },
        { x: ex, y: ey },
      ],
      y,
      110,
      0.8 + rand(i, 3) * 0.6,
    )
    if (!mobile && rand(i, 4) > 0.4) {
      const mx = sx + side * len * 0.55
      const my = y + len * 0.42
      const l2 = 14 + rand(i, 5) * 14
      add(
        [
          { x: mx, y: my },
          { x: mx + side * 6, y: my + l2 * 0.4 },
          { x: mx + side * l2 * 0.7, y: my + l2 * 0.7 },
          { x: mx + side * l2, y: my + l2 * 1.1 },
        ],
        my,
        80,
        0.6,
      )
    }
  }

  return { trunk: trunk.d, trunkPts, branches, rootlets }
}
