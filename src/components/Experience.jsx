import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitText from './ui/SplitText'
import { useIsMobile } from '../hooks/useDevice'

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

/* ─── Desktop: Horizontal scroll cinematic timeline ───────── */
function ExperienceDesktop() {
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
            <DesktopExperienceCard
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
 * Desktop card with per-card reveal physics
 */
function DesktopExperienceCard({ exp, index, scrollProgress }) {
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
      <ExperienceCardContent exp={exp} index={index} />
    </div>
  )
}

/* ─── Mobile: Vertical stacked timeline ───────────────────── */
function ExperienceMobile() {
  return (
    <section id="experience" className="relative z-20 bg-[#050505] py-24 px-4 overflow-hidden">
      {/* CSS ambient effects */}
      <div className="mobile-particles" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-12">
          <h2 className="flex flex-col text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
            <SplitText mode="reveal" stagger={0.04}>Experience</SplitText>
            <SplitText mode="reveal" stagger={0.04} className="text-[#00E5FF]">Timeline</SplitText>
          </h2>
        </div>

        {/* Vertical timeline */}
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-[#00E5FF]/30 via-white/10 to-transparent" />

          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
              className="relative pl-10"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-4">
                <div className="relative grid h-[22px] w-[22px] place-items-center">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#00E5FF] blur-[8px]"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-[#00E5FF] to-cyan-300 p-0.5">
                    <div className="h-full w-full rounded-full bg-[#050505]" />
                  </div>
                </div>
              </div>

              <ExperienceCardContent exp={exp} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Shared card content ─────────────────────────────────── */
function ExperienceCardContent({ exp, index }) {
  return (
    <>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="font-mono text-[#00E5FF] font-bold text-xl tracking-tighter sm:text-2xl">0{index + 1}</span>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-30" />
      </div>
      <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-xl transition-all sm:mt-8 sm:p-8 hover:bg-white/10 hover:border-[#00E5FF]/30">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter sm:text-3xl">{exp.role}</h3>
        <div className="mt-2 flex flex-col gap-1 text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <span>{exp.company}</span>
          <span className="font-mono text-white/40">{exp.duration}</span>
        </div>
        <ul className="mt-5 space-y-3 sm:mt-8 sm:space-y-5">
          {exp.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-3 text-xs font-medium text-white/50 leading-relaxed sm:gap-4 sm:text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF]" />
              <BulletText text={bullet} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default function Experience() {
  const isMobile = useIsMobile()
  return isMobile ? <ExperienceMobile /> : <ExperienceDesktop />
}
