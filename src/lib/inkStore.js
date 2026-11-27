/**
 * inkStore — shared, mutable state between the About section (DOM) and the
 * WebGL ink layer (InkRoots), plus the hand-off from the hero's seed.
 *
 * Mutable on purpose: the WebGL layer reads it every frame without React
 * re-renders. `subscribeInk` notifies when the geometry is rebuilt.
 */
export const ink = {
  section: null, // the About <section> element
  geom: null, // { w, h, endY, trunkX, trunkPts, branches[], rootlets[], blooms[] }
  version: 0,
  failed: false, // true if WebGL InkRoots failed to load or threw
  hover: -1, // bloom index under the pointer (0 = portrait, 1..4 = roots)
  mouse: { x: -9999, y: -9999 }, // section coordinates
  stir: 0, // 0..1, decays
  drops: [], // pigment drops: { x, y, t }
  fallT: 0, // 0..1 progress of the seed falling from the hero
  heroSeed: { x: null, y: null }, // screen position of the hero's core
}

const listeners = new Set()

export function setInkGeom(section, geom) {
  ink.section = section
  ink.geom = geom
  ink.version += 1
  listeners.forEach((l) => l())
}

export function setInkFailed() {
  if (ink.failed) return
  ink.failed = true
  listeners.forEach((l) => l())
}

export function subscribeInk(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const READ_LINE = 0.62 // the root's growing tip follows this line of the viewport

/** Where the growing tip is, in section coordinates (shared by DOM + WebGL). */
export function tipY(rect, endY, reduce) {
  if (reduce) return endY
  return Math.min(endY, Math.max(0, window.innerHeight * READ_LINE - rect.top))
}
