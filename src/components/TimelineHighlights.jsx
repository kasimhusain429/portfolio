import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionReveal, { SectionRevealGroup, revealItem } from './SectionReveal'

const items = [
  {
    period: '2020 – 2024',
    title: 'B.Tech, Computer Engineering',
    org: 'Silver Oak University',
    meta: 'CGPA 8.59',
    description:
      'Graduated with a strong record in Computer Engineering. Built a solid foundation in software development, data structures, and web technologies.',
    accent: 'from-cyan-400 to-indigo-500',
    glow: 'rgba(6,182,212,0.45)',
  },
  {
    period: 'Jan 2024 – May 2024',
    title: 'UI Engineer Intern',
    org: 'Elsner Technologies Pvt. Ltd.',
    meta: 'Internship',
    description:
      'Converted Figma designs into responsive React.js pages. Supported sprint-based delivery in an Agile team using Git and GitHub.',
    accent: 'from-purple-500 to-pink-400',
    glow: 'rgba(168,85,247,0.45)',
  },
  {
    period: 'Jun 2024 – Present',
    title: 'React.js Developer',
    org: 'Cypherox Technologies Pvt. Ltd.',
    meta: 'Full-time',
    description:
      'Building reusable component libraries, integrating REST APIs, and shipping performance-optimised dashboards used by 100+ users daily. Cut initial page load by ~30%.',
    accent: 'from-indigo-500 via-cyan-400 to-purple-500',
    glow: 'rgba(99,102,241,0.45)',
    current: true,
  },
  {
    period: '2024 – Present',
    title: 'Freelance Frontend Developer',
    org: 'Independent',
    meta: 'Freelance',
    description:
      'Delivered 6+ production websites end-to-end for clients in hospitality, e-commerce, consulting, and local services across London, Sydney, and India.',
    accent: 'from-emerald-400 to-cyan-500',
    glow: 'rgba(52,211,153,0.45)',
  },
]

export default function TimelineHighlights() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const spineScaleY = useTransform(scrollYProgress, [0.05, 0.9], [0, 1])

  return (
    <section id="timeline" ref={sectionRef} className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

        <SectionReveal direction="up">
          <p className="text-xs font-semibold tracking-widest text-(--muted)">TIMELINE</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
            Career <span className="text-(--muted)">Journey</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--muted)">
            From university to full-time engineering — a snapshot of education, roles, and
            client work that shaped my frontend craft.
          </p>
        </SectionReveal>

        <div className="relative mt-10">
          {/* Scroll-driven spine */}
          <div className="absolute left-[19px] top-0 h-full w-px overflow-hidden sm:left-[23px]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/8 to-white/5" />
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500"
              style={{ scaleY: spineScaleY, transformOrigin: 'top' }}
            />
          </div>

          <SectionRevealGroup stagger={0.14} delayChildren={0.05} className="grid gap-5">
            {items.map((t) => (
              <motion.article
                key={t.title}
                variants={revealItem}
                className="relative pl-12 sm:pl-16"
              >
                {/* Dot */}
                <div className="absolute left-0 top-5 sm:left-1">
                  <div className="relative grid h-10 w-10 place-items-center">
                    <motion.div
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${t.accent} blur-[10px]`}
                      animate={{ opacity: t.current ? [0.3, 0.7, 0.3] : [0.15, 0.35, 0.15] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className={`relative h-5 w-5 rounded-full bg-gradient-to-r ${t.accent} p-0.5`}>
                      <div className="h-full w-full rounded-full bg-(--bg)" />
                    </div>
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.005 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="group rounded-2xl border border-(--border) bg-(--card) p-5 shadow-(--shadow) backdrop-blur transition-colors hover:bg-(--card-strong)"
                >
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
                      <span className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)">{t.period}</span>
                      {t.meta && (
                        <span className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)">{t.meta}</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-(--muted)">{t.description}</p>

                  <div className={`mt-4 h-px bg-gradient-to-r ${t.accent} opacity-20`} />
                </motion.div>
              </motion.article>
            ))}
          </SectionRevealGroup>
        </div>
      </div>
    </section>
  )
}
