import { useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Scroll parallax for decorative layers: returns a motion value for `y` that
 * travels from -distance to +distance px while `ref` crosses the viewport.
 * Transform only (compositor-friendly); still when reduced motion is on.
 */
export function useParallax(ref, distance = 60) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-distance, distance])
}
