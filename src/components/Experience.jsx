import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'

const items = [
  {
    role: 'React.js Developer',
    company: 'Cypherox Technologies Pvt. Ltd.',
    duration: 'Jun 2024 – Present',
    type: 'Full-time · On-site',
    url: '',
    bullets: [
      'Build and maintain a reusable React component library (20+ components) adopted across multiple internal products.',
      'Integrate REST APIs with backend teams to keep dashboards stable, responsive, and low-latency.',
      'Refactored core dashboard views using code splitting, lazy loading, and memoization — cutting initial load time by ~30%.',
      'Ship responsive internal tools used daily by 100+ active users, delivering in 2-week Agile sprints.',
    ],
    accent: 'from-indigo-500 via-cyan-400 to-purple-500',
  },
  {
    role: 'UI Engineer Intern',
    company: 'Elsner Technologies Pvt. Ltd.',
    duration: 'Jan 2024 – May 2024',
    type: 'Internship · On-site',
    url: '',
    bullets: [
      'Converted Figma designs into responsive React.js pages with consistent spacing, accessibility, and cross-browser behavior.',
      'Created reusable UI elements and supported sprint-based delivery in an Agile team using Git and GitHub.',
    ],
    accent: 'from-purple-500 via-pink-400 to-indigo-500',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
}
const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

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
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
            Work <span className="text-(--muted)">History</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--muted)">
            2+ years building production React applications at fast-moving product teams, from internship
            to full-time engineering roles.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="relative mt-10"
        >
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-indigo-500/0 via-cyan-400/40 to-purple-500/0 sm:left-[23px]" />

          <div className="grid gap-6">
            {items.map((x, idx) => (
              <motion.article
                key={x.role}
                variants={cardItem}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative pl-12 sm:pl-16"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-6 sm:left-1">
                  <div className="relative grid h-10 w-10 place-items-center">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${x.accent} opacity-25 blur-[8px]`} />
                    <div className={`relative h-5 w-5 rounded-full bg-gradient-to-r ${x.accent} p-0.5`}>
                      <div className="h-full w-full rounded-full bg-(--bg)" />
                    </div>
                  </div>
                </div>

                <div className="group rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur transition-colors duration-200 hover:bg-(--card-strong)">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-(--fg)">{x.role}</h3>
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-(--muted)">{x.company}</span>
                        <span className="text-(--border)">·</span>
                        <span className="text-xs text-(--muted)">{x.type}</span>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold text-(--muted)">
                      {x.duration}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px w-full bg-gradient-to-r from-indigo-500/0 via-white/8 to-purple-500/0" />

                  {/* Bullets */}
                  <ul className="space-y-2.5">
                    {x.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm leading-relaxed text-(--muted)">
                        <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${x.accent}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
