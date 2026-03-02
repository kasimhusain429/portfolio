import { motion } from 'framer-motion'
import { FiBriefcase, FiCode, FiLayers } from 'react-icons/fi'
import Kasim from '../assets/Kasim_image.png'

const stats = [
  { icon: FiBriefcase, label: 'Years Experience', value: '2+' },
  { icon: FiCode, label: 'Projects Built', value: '10+' },
  { icon: FiLayers, label: 'Technologies Mastered', value: '5+' },
]

export default function About() {
  return (
    <section id="about" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[28px] bg-linear-to-r from-indigo-500/20 via-cyan-400/15 to-purple-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-(--border) bg-(--card) shadow-(--shadow) backdrop-blur-xl">
              <img
                alt="Portrait"
                loading="lazy"
                className="h-[420px] w-full object-cover object-top"
                src={Kasim}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
          >
            <p className="text-xs font-semibold tracking-widest text-(--muted)">ABOUT</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
              About <span className="text-(--muted)">Me</span>
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-(--muted)">
              <p>
                I&apos;m a frontend engineer focused on crafting
                <span className="bg-linear-to-r from-indigo-300 via-cyan-200 to-purple-300 bg-clip-text font-semibold text-transparent">
                  {' '}
                  premium, conversion-friendly interfaces
                </span>
                —the kind that feel effortless to use.
              </p>
              <p>
                I care deeply about layout rhythm, motion restraint, and shipping UI systems that scale.
                My process blends design thinking with pragmatic engineering.
              </p>
              <p>
                If you need a portfolio, landing, or product UI that looks expensive and performs
                beautifully, I can help you build it.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:items-stretch">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className="flex h-full flex-col justify-between rounded-2xl border border-(--border) bg-(--card) p-4 shadow-(--shadow) backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Icon className="mt-0.5 shrink-0 text-(--muted)" />
                      <span className="text-right text-xs leading-snug text-(--muted)">{s.label}</span>
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-(--fg)">{s.value}</div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
