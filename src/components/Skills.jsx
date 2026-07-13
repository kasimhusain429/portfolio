import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const groups = [
  {
    title: 'Frontend',
    color: 'from-indigo-500 via-cyan-400 to-purple-500',
    items: [
      { name: 'React.js', value: 95 },
      { name: 'Next.js', value: 88 },
      { name: 'TypeScript', value: 82 },
      { name: 'Tailwind CSS', value: 93 },
      { name: 'JavaScript (ES6+)', value: 92 },
    ],
  },
  {
    title: 'State & Data',
    color: 'from-purple-500 via-pink-400 to-indigo-500',
    items: [
      { name: 'Redux', value: 84 },
      { name: 'React Query', value: 80 },
      { name: 'Context API', value: 90 },
      { name: 'REST API Integration', value: 88 },
      { name: 'Axios', value: 86 },
    ],
  },
  {
    title: 'Tools & Workflow',
    color: 'from-cyan-400 via-teal-400 to-indigo-500',
    items: [
      { name: 'Git & GitHub', value: 90 },
      { name: 'Figma → Code', value: 88 },
      { name: 'Vite / Webpack', value: 82 },
      { name: 'Framer Motion', value: 85 },
      { name: 'Node.js Basics', value: 68 },
    ],
  },
]

// Badge-style skills for a second visual layer
const badges = [
  'React.js', 'Next.js', 'TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3',
  'Tailwind CSS', 'Redux', 'Context API', 'React Hooks', 'React Query', 'Axios',
  'REST APIs', 'Framer Motion', 'Git', 'GitHub', 'Vercel', 'Vite', 'Webpack',
  'Figma-to-Code', 'Responsive Design', 'Accessibility', 'SEO', 'Node.js', 'Agile/Scrum',
]

function useInViewOnce(rootMargin = '-100px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setSeen(true); io.disconnect(); return }
        }
      },
      { root: null, threshold: 0.15, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return { ref, seen }
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const badgeVariant = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

export default function Skills() {
  const { ref, seen } = useInViewOnce()

  return (
    <section id="skills" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">SKILLS</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
            Technical <span className="text-(--muted)">Stack</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--muted)">
            Proficiency across the modern React ecosystem — from pixel-accurate UI to performance
            optimization and REST API integration.
          </p>
        </motion.div>

        {/* Skill bars */}
        <div ref={ref} className="mt-10 grid gap-4 md:grid-cols-3">
          {groups.map((g) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${g.color}`} />
                <div className="text-sm font-semibold text-(--fg)">{g.title}</div>
              </div>
              <div className="mt-5 space-y-4">
                {g.items.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs text-(--muted)">
                      <span>{s.name}</span>
                      <span className="font-medium text-(--fg)">{s.value}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--ring)">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: seen ? `${s.value}%` : 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        className={`h-1.5 rounded-full bg-gradient-to-r ${g.color} shadow-[0_4px_12px_-4px_rgba(99,102,241,0.6)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech badge cloud */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {badges.map((b) => (
            <motion.span
              key={b}
              variants={badgeVariant}
              whileHover={{ scale: 1.06, y: -2 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="cursor-default rounded-full border border-(--border) bg-(--card) px-3 py-1.5 text-xs font-medium text-(--muted) backdrop-blur transition hover:border-indigo-500/30 hover:bg-(--card-strong) hover:text-(--fg)"
            >
              {b}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
