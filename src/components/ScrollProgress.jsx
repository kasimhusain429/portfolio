import { motion, useScroll, useSpring } from 'framer-motion'

/** A single cornflower hairline that tracks page progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.2 })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-spectrum"
    />
  )
}
