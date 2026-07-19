import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitText from './ui/SplitText'
import { SectionRevealGroup, revealItem } from './SectionReveal'
import { useIsMobile } from '../hooks/useDevice'

const badges = [
  'React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3',
  'Tailwind CSS', 'Redux', 'Context API', 'React Hooks', 'React Query', 'Axios',
  'REST APIs', 'Framer Motion', 'Git', 'GitHub', 'Vercel', 'Vite', 'Webpack',
  'Figma-to-Code', 'Responsive Design', 'Accessibility', 'SEO', 'Node.js', 'Agile/Scrum',
]

/* ─── Desktop: tall section with 3D constellation background ─ */
function SkillsDesktop() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <section id="skills" ref={sectionRef} className="relative flex flex-col pt-32 pointer-events-none">
      <div className="relative h-[150vh]">
        <motion.div
          style={{ opacity }}
          className="sticky top-32 mx-auto flex w-full max-w-7xl flex-col items-center text-center z-10"
        >
          <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">Interactive Node Graph</p>
          <h2 className="mt-4 flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-8xl">
            <SplitText mode="char" stagger={0.03}>Tech Stack</SplitText>
            <SplitText mode="char" stagger={0.03} className="text-[#00E5FF]">Universe</SplitText>
          </h2>
        </motion.div>

        {/* Spacer for 3D Interaction */}
        <div className="absolute inset-0 pointer-events-auto" />
      </div>

      {/* Minimal Floating badge cloud */}
      <div className="relative z-20 mx-auto w-full max-w-4xl px-6 py-20 pointer-events-auto bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <BadgeCloud />
      </div>
    </section>
  )
}

/* ─── Mobile: compact layout, no 3D scroll void ──────────── */
function SkillsMobile() {
  return (
    <section id="skills" className="relative py-24 px-4 overflow-hidden">
      {/* CSS ambient effects as 3D fallback */}
      <div className="mobile-glow" />
      <div className="mobile-particles" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <p className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">Tech Stack</p>
        <h2 className="mt-4 flex flex-col text-4xl font-black uppercase tracking-tighter text-white sm:text-6xl">
          <SplitText mode="char" stagger={0.03}>Tech Stack</SplitText>
          <SplitText mode="char" stagger={0.03} className="text-[#00E5FF]">Universe</SplitText>
        </h2>

        <div className="mt-12 w-full">
          <BadgeCloud />
        </div>
      </div>
    </section>
  )
}

/* ─── Shared badge cloud ──────────────────────────────────── */
function BadgeCloud() {
  return (
    <SectionRevealGroup stagger={0.02} delayChildren={0.05} className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {badges.map((b, i) => (
        <motion.span
          key={b}
          variants={revealItem}
          animate={{
            y: [0, Math.random() * -4 - 2, 0],
            transition: {
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1
            }
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="cursor-default rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 backdrop-blur transition hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] sm:px-4 sm:py-2 sm:text-[11px]"
        >
          {b}
        </motion.span>
      ))}
    </SectionRevealGroup>
  )
}

export default function Skills() {
  const isMobile = useIsMobile()
  return isMobile ? <SkillsMobile /> : <SkillsDesktop />
}
