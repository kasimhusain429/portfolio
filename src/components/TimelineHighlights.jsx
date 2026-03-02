import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function TimelineHighlights() {
  const items = useMemo(
    () => [
      {
        year: '2023',
        title: 'UI Engineer',
        meta: '6 Months',
        description:
          'Designed and developed responsive user interfaces, focusing on clean design systems, reusable components, and performance optimization.',
      },
      {
        year: '2024 — Present',
        title: 'Frontend Developer',
        meta: 'On-Site',
        description:
          'Working full-time on modern frontend applications using React. Building scalable UI architecture, improving performance, and collaborating with backend & design teams.',
      },
      {
        year: '2026',
        title: 'Freelance Developer',
        meta: '',
        description:
          'Providing freelance services in frontend development, modern UI systems, and performance-driven web applications for clients.',
      },
    ],
    [],
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  }

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
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
            Timeline <span className="text-(--muted)">Highlights</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--muted)">
            A quick snapshot of roles and milestones — built with a systems mindset, crisp UI, and performance-first
            execution.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
          className="relative mt-10"
        >
          <div className="absolute left-[11px] top-0 h-full w-px bg-linear-to-b from-indigo-500/0 via-cyan-400/60 to-purple-500/0 sm:left-[15px]" />

          <div className="grid gap-6">
            {items.map((t, idx) => (
              <motion.article
                key={`${t.year}-${idx}`}
                variants={item}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative pl-10 sm:pl-12"
              >
                <div className="absolute left-0 top-5 sm:left-1">
                  <div className="relative grid h-6 w-6 place-items-center">
                    <div className="absolute inset-0 rounded-full bg-linear-to-r from-indigo-500 via-cyan-400 to-purple-500 opacity-80 blur-[6px]" />
                    <div className="relative h-3.5 w-3.5 rounded-full bg-(--bg) ring-1 ring-(--ring)" />
                  </div>
                </div>

                <div className="group rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur transition hover:bg-(--card-strong)">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <div className="text-sm font-semibold text-(--fg)">{t.year}</div>
                      <div className="text-sm text-(--muted)">{t.title}</div>
                    </div>
                    {t.meta ? (
                      <div className="rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-semibold text-(--muted)">
                        {t.meta}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 text-sm leading-relaxed text-(--muted)">{t.description}</div>

                  <div className="mt-5 h-px w-full bg-linear-to-r from-indigo-500/0 via-cyan-400/20 to-purple-500/0" />
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
