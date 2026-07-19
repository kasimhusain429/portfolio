import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitText from './ui/SplitText'

export default function Projects() {
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  // Fade out before the section completely leaves to avoid visual overlap
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.8], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <section id="projects" ref={sectionRef} className="relative z-10 flex min-h-[250vh] flex-col pointer-events-none">
      <motion.div
        style={{ opacity, y }}
        className="sticky top-20 z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 pt-10"
      >
        <p className="text-[10px] font-bold tracking-[0.4em] text-[#00E5FF] uppercase">Selected Work</p>
        <h2 className="mt-4 flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl mix-blend-difference">
          <SplitText mode="char" stagger={0.03}>Digital</SplitText>
          <SplitText mode="char" stagger={0.03}>Experiences</SplitText>
        </h2>
      </motion.div>

      {/* The rest of the section provides the scroll height for the 3D gallery GSAP ScrollTrigger */}
      <div className="absolute inset-0 pointer-events-auto" />

      <div className="absolute bottom-10 left-6 z-10">
        {/* <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
           Keep scrolling to explore<br/>Click cards to view live
        </p> */}
      </div>
    </section>
  )
}
