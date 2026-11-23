/**
 * motion.js: the site's single motion language.
 *
 *   EASE      out = arrivals (things settling into place), inOut = camera moves and
 *             hand-offs between states, in = exits. No other curves in components.
 *   DUR       seconds. micro for hover/press, fast for UI state, base for content,
 *             reveal for headings entering, scene for camera-scale moves.
 *   STAGGER   seconds between siblings: tight for letters, base for lines/cards, loose for sections.
 *   SPRING    for things that follow the pointer.
 *
 * CSS mirrors the same values as --ease-* and --dur-* in styles/tokens.css.
 * Reduced motion: <MotionConfig reducedMotion="user"> in App removes transform
 * animations globally; components only add bespoke fallbacks where a layout depends on motion.
 */

export const EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.7, 0, 0.3, 1],
  in: [0.7, 0, 0.84, 0],
}

export const DUR = {
  micro: 0.2,
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  reveal: 1.1,
  scene: 1.5,
}

export const STAGGER = { tight: 0.045, base: 0.08, loose: 0.12 }

export const SPRING = {
  pointer: { stiffness: 380, damping: 32, mass: 0.6 },
  tilt: { stiffness: 150, damping: 18 },
  drift: { stiffness: 60, damping: 18 },
  magnetic: { stiffness: 220, damping: 16 },
}

/** Entering the viewport: trigger once, a little before the element is fully in. */
export const VIEWPORT = { once: true, margin: '-12% 0px' }

/** Cubic in-out for mapping scroll progress (used by the pinned scenes). */
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smoothstep = (t) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Fade-and-rise for content blocks: spread onto any motion element. */
export const riseIn = (delay = 0, distance = 18) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: DUR.slow, delay, ease: EASE.out },
})
