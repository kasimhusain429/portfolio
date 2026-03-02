import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const groups = [
  {
    title: 'Frontend',
    items: [
      { name: 'React', value: 92 },
      { name: 'Tailwind CSS', value: 90 },
      { name: 'Animations (Motion)', value: 84 },
      { name: 'Accessibility', value: 78 },
    ],
  },
  {
    title: 'Backend Basics',
    items: [
      { name: 'REST APIs', value: 76 },
      { name: 'Auth Flows', value: 68 },
      { name: 'Node Fundamentals', value: 62 },
    ],
  },
  {
    title: 'Tools',
    items: [
      { name: 'Git', value: 84 },
      { name: 'Vite', value: 82 },
      { name: 'Figma', value: 72 },
    ],
  },
]

function useInViewOnce(rootMargin = '-120px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true)
            io.disconnect()
            return
          }
        }
      },
      { root: null, threshold: 0.2, rootMargin },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { ref, seen }
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
          className="flex items-end justify-between gap-6"
        >
          <div>
            <p className="text-xs font-semibold tracking-widest text-(--muted)">SKILLS</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
              Craft & <span className="text-(--muted)">Tooling</span>
            </h2>
          </div>
          <div className="hidden text-sm text-(--muted) md:block">Tasteful motion. Clean systems.</div>
        </motion.div>

        <div ref={ref} className="mt-10 grid gap-4 md:grid-cols-3">
          {groups.map((g) => (
            <div
              key={g.title}
              className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur"
            >
              <div className="text-sm font-semibold text-(--fg)">{g.title}</div>
              <div className="mt-5 space-y-4">
                {g.items.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs text-(--muted)">
                      <span>{s.name}</span>
                      <span>{s.value}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-(--ring)">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: seen ? `${s.value}%` : 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="h-2 rounded-full bg-linear-to-r from-indigo-500 via-cyan-400 to-purple-500 shadow-[0_10px_25px_-18px_rgba(99,102,241,0.8)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
