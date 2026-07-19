import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitText from './ui/SplitText'

export default function Hero() {
  const sectionRef = useRef(null)
  
  // Parallax the text up as we scroll down
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  
  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[120vh] flex-col items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      <motion.div 
        style={{ y, opacity, scale }}
        className="pointer-events-none sticky top-1/2 z-10 flex -translate-y-1/2 flex-col items-center text-center mix-blend-difference"
      >
        <h1 className="flex flex-col font-black uppercase leading-[0.85] tracking-tighter text-white">
          <SplitText mode="reveal" stagger={0.06} className="text-[clamp(4rem,15vw,15rem)]">
            React
          </SplitText>
          <SplitText mode="reveal" stagger={0.06} className="text-[clamp(4rem,15vw,15rem)] text-[#00E5FF]">
            Engineer
          </SplitText>
        </h1>
        
        <div className="mt-8 flex gap-8">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            Frontend
          </p>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            Developer
          </p>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            Kasim Husain
          </p>
        </div>
      </motion.div>
      
      {/* Organic Scroll Indicator — gravity-falling dot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] font-medium tracking-[0.3em] text-white/30">SCROLL</span>
        <div className="relative h-16 w-[1px]">
          {/* Track */}
          <div className="absolute inset-0 bg-white/10 rounded-full" />
          {/* Falling dot */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]"
            animate={{
              y: [0, 56],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 0.4,
              ease: [0.55, 0, 1, 0.45], // easeIn — simulates gravity
              times: [0, 0.7, 1],
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}
