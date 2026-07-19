import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.2 })

  /* Properly positioned leading dot — uses left% instead of broken scaleX */
  const dotLeft = useTransform(scaleX, [0, 1], ['0%', '100%'])

  return (
    <>
      {/* Main bar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
      />

      {/* Glow layer */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[79] h-[6px] origin-left bg-gradient-to-r from-indigo-500/40 via-cyan-400/40 to-purple-500/40 blur-[4px]"
      />

      {/* Leading edge dot — properly positioned */}
      <motion.div
        aria-hidden="true"
        style={{ left: dotLeft }}
        className="fixed top-[-2px] z-[81] h-[6px] w-[6px] rounded-full bg-white shadow-[0_0_8px_2px_rgba(99,102,241,0.8)] mix-blend-screen"
      />
    </>
  )
}
