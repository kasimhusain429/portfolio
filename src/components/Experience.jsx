import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitText from './ui/SplitText'

const experiences = [
  {
    role: 'React.js Developer',
    company: 'Cypherox Technologies Pvt. Ltd.',
    duration: 'Jun 2024 – Present',
    bullets: [
      'Build and maintain a reusable React component library adopted across multiple internal products.',
      'Refactored core dashboard views using code splitting and lazy loading — cutting initial load time by ~<highlight>30%</highlight>.',
      'Ship responsive internal tools used daily by <highlight>100+ active users</highlight>, delivering in 2-week Agile sprints.',
    ]
  },
  {
    role: 'UI Engineer Intern',
    company: 'Elsner Technologies Pvt. Ltd.',
    duration: 'Jan 2024 – May 2024',
    bullets: [
      'Converted Figma designs into responsive React.js pages with consistent spacing and accessibility.',
      'Created reusable UI elements and supported sprint-based delivery in an Agile team using Git and GitHub.',
    ]
  }
]

/**
 * Renders bullet text with <highlight> tags converted to styled spans
 */
function BulletText({ text }) {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/<highlight>(.*?)<\/highlight>/)
        if (match) {
          return (
            <span key={i} className="text-[#00E5FF] font-black">
              {match[1]}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function Experience() {
  const targetRef = useRef(null)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  // Horizontal translation for the cinematic timeline
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"])

  // Progress line fill (0% to 100% as user scrolls)
  const progressWidth = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '100%'])

  return (
    <section ref={targetRef} id="experience" className="relative z-20 h-[250vh] bg-[#050505]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden bg-[#050505]">

        <div className="absolute left-6 top-24 z-10 md:left-20 md:top-32">
          <h2 className="flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl">
            <SplitText mode="reveal" stagger={0.04}>Experience</SplitText>
            <SplitText mode="reveal" stagger={0.04} className="text-[#00E5FF]">Timeline</SplitText>
          </h2>
        </div>


        <motion.div
          ref={containerRef}
          style={{ x }}
          className="flex items-center gap-20 px-[10vw] pt-65 md:px-[30vw]"
        >
          {experiences.map((exp, index) => (
            <ExperienceCard
              key={index}
              exp={exp}
              index={index}
              scrollProgress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/**
 * Individual card with per-card reveal physics:
 * rotateY, scale, and opacity driven by distance from viewport center
 */
function ExperienceCard({ exp, index, scrollProgress }) {
  const cardRef = useRef(null)
  const [cardProgress, setCardProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (latest) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const viewportCenter = window.innerWidth / 2
      const cardCenter = rect.left + rect.width / 2
      const distance = Math.abs(cardCenter - viewportCenter)
      const maxDistance = window.innerWidth * 0.6

      // 1 when centered, 0 when far away
      const progress = Math.max(0, 1 - distance / maxDistance)
      setCardProgress(progress)
    })
    return () => unsubscribe()
  }, [scrollProgress])

  // Physics-based transforms based on card's position relative to viewport center
  const rotateY = (1 - cardProgress) * 8 * (index % 2 === 0 ? 1 : -1)
  const cardScale = 0.92 + cardProgress * 0.08
  const cardOpacity = 0.3 + cardProgress * 0.7

  return (
    <div
      ref={cardRef}
      className="w-[85vw] max-w-[600px] shrink-0"
      style={{
        transform: `perspective(1200px) rotateY(${rotateY}deg) scale(${cardScale})`,
        opacity: cardOpacity,
        transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
      }}
    >
      <div className="flex items-center gap-4">
        <span className="font-mono text-[#00E5FF] font-bold text-2xl tracking-tighter">0{index + 1}</span>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-30" />
      </div>
      <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-[#00E5FF]/30">
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{exp.role}</h3>
        <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#00E5FF] uppercase tracking-widest">
          <span>{exp.company}</span>
          <span className="font-mono">{exp.duration}</span>
        </div>
        <ul className="mt-8 space-y-5">
          {exp.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-4 text-sm font-medium text-white/50 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF]" />
              <BulletText text={bullet} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
