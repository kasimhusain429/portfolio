import { useMemo } from 'react'
import { motion } from 'framer-motion'

const items = [
  {
    period: '2020 – 2024',
    title: 'B.Tech, Computer Engineering',
    org: 'Silver Oak University',
    meta: 'CGPA: 8.59',
    description:
      'Graduated with a strong academic record in Computer Engineering. Built a solid foundation in software development, data structures, and web technologies.',
    accent: 'from-cyan-400 to-indigo-500',
  },
  {
    period: 'Jan 2024 – May 2024',
    title: 'UI Engineer Intern',
    org: 'Elsner Technologies Pvt. Ltd.',
    meta: 'Internship',
    description:
      'Converted Figma designs into responsive React.js pages with consistent spacing, accessibility, and cross-browser behavior. Supported sprint-based delivery in an Agile team using Git and GitHub.',
    accent: 'from-purple-500 to-pink-400',
  },
  {
    period: 'Jun 2024 – Present',
    title: 'React.js Developer',
    org: 'Cypherox Technologies Pvt. Ltd.',
    meta: 'Full-time',
    description:
      'Building reusable component libraries, integrating REST APIs, and shipping performance-optimised dashboards used by 100+ users daily. Cut initial page load by ~30% through code splitting and lazy loading.',
    accent: 'from-indigo-500 via-cyan-400 to-purple-500',
    current: true,
  },
  {
    period: '2024 – Present',
    title: 'Freelance Frontend Developer',
    org: 'Independent',
    meta: 'Freelance',
    description:
      'Delivered 6+ production websites end-to-end — from Figma handoff to deployment — for clients in hospitality, e-commerce, consulting, and local services across London, Sydney, and India.',
    accent: 'from-emerald-400 to-cyan-500',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function TimelineHighlights() {
  return (
    <section id="timeline" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">TIMELINE</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
            Career <span className="text-(--muted)">Journey</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--muted)">
            From university to full-time engineering — a snapshot of education, roles, and
            client work that shaped my frontend craft.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="relative mt-10"
        >
          {/* Spine */}
          <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-indigo-500/0 via-cyan-400/50 to-purple-500/0 sm:left-[23px]" />

          <div className="grid gap-5">
            {items.map((t, idx) => (
              <motion.article
                key={`${t.org}-${idx}`}
                variants={itemVariant}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative pl-12 sm:pl-16"
              >
                {/* Dot */}
                <div className="absolute left-0 top-5 sm:left-1">
                  <div className="relative grid h-10 w-10 place-items-center">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${t.accent} opacity-20 blur-[8px]`} />
                    <div className={`relative h-5 w-5 rounded-full bg-gradient-to-r ${t.accent} p-0.5`}>
                      <div className="h-full w-full rounded-full bg-(--bg)" />
                    </div>
                  </div>
                </div>

                <div className="group rounded-2xl border border-(--border) bg-(--card) p-5 shadow-(--shadow) backdrop-blur transition-colors hover:bg-(--card-strong)">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-(--fg)">{t.title}</span>
                        {t.current && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Now
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-(--muted)">{t.org}</div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)">
                        {t.period}
                      </span>
                      {t.meta && (
                        <span className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)">
                          {t.meta}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-(--muted)">{t.description}</div>

                  <div className="mt-4 h-px w-full bg-gradient-to-r from-indigo-500/0 via-cyan-400/15 to-purple-500/0" />
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
