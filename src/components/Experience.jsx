import { motion } from 'framer-motion'

const items = [
  {
    role: 'Frontend Developer',
    company: 'Freelance',
    duration: '2024 — Present',
    bullets: [
      'Built responsive React interfaces with Tailwind and design-system discipline.',
      'Implemented smooth motion patterns and scroll-based reveals for premium UX.',
      'Shipped performance-focused components (lazy loading, skeletons, optimized layouts).',
    ],
  },
  {
    role: 'UI Engineer (Intern)',
    company: 'Startup',
    duration: '2023 — 2024',
    bullets: [
      'Collaborated with product to translate Figma into reusable UI primitives.',
      'Improved accessibility and consistency across multiple feature pages.',
      'Helped maintain a clean component architecture and predictable styling patterns.',
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">EXPERIENCE</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
            Timeline <span className="text-(--muted)">Highlights</span>
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6">
          {items.map((x, idx) => (
            <motion.div
              key={x.role}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.06 }}
              className="relative rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur"
            >
              <div className="absolute left-6 top-0 bottom-0 hidden w-px bg-linear-to-b from-indigo-500/0 via-white/15 to-purple-500/0 md:block" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-(--fg)">{x.role}</div>
                  <div className="mt-1 text-sm text-(--muted)">{x.company}</div>
                </div>
                <div className="text-xs font-semibold text-(--muted)">{x.duration}</div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[18px_1fr]">
                <div className="hidden md:flex md:items-start md:justify-center">
                  <motion.div
                    className="mt-1 h-3 w-3 rounded-full bg-linear-to-r from-indigo-400 via-cyan-300 to-purple-400"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-(--muted)">
                  {x.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
