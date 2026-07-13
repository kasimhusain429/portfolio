import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiArrowRight, FiMapPin } from 'react-icons/fi'

function useTypewriter(words, ms = 72, pauseMs = 1400) {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const current = words[index] || ''

  useEffect(() => {
    if (!words.length) return
    if (!deleting && subIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), pauseMs)
      return () => clearTimeout(t)
    }
    if (deleting && subIndex === 0) {
      setDeleting(false)
      setIndex((i) => (i + 1) % words.length)
      return
    }
    const delta = deleting ? ms / 2 : ms
    const t = setTimeout(() => setSubIndex((s) => s + (deleting ? -1 : 1)), delta)
    return () => clearTimeout(t)
  }, [words, index, subIndex, deleting, current, ms, pauseMs])

  return current.substring(0, subIndex)
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.11, delayChildren: 0.18 } },
}
const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

const stats = [
  { value: '2+', label: 'Years Experience' },
  { value: '6+', label: 'Live Projects Shipped' },
  { value: '20+', label: 'Reusable Components' },
  { value: '~30%', label: 'Perf Improvement' },
]

export default function Hero() {
  const roles = useMemo(
    () => ['React.js Developer', 'Frontend Engineer', 'UI-Focused Builder', 'Next.js Developer'],
    [],
  )
  const typed = useTypewriter(roles)

  const onNav = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative overflow-hidden pt-28">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/25 via-cyan-400/15 to-purple-500/25 blur-3xl" />
        <motion.div
          className="absolute left-[5%] top-1/3 h-64 w-64 rounded-full bg-gradient-to-r from-cyan-400/15 to-indigo-500/15 blur-3xl"
          animate={{ y: [0, -22, 0], x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[5%] top-1/2 h-72 w-72 rounded-full bg-gradient-to-r from-purple-500/15 to-cyan-400/15 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        {/* Left — copy */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-medium text-(--muted)">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available for new opportunities
            </span>
          </motion.div>

          <motion.p variants={item} className="mt-5 text-sm font-medium text-(--muted)">
            Hi, I&apos;m
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-2 text-5xl font-bold tracking-tight text-(--fg) sm:text-6xl"
          >
            <span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-purple-300 bg-clip-text text-transparent">
              Kasim Husain
            </span>
          </motion.h1>

          <motion.div variants={item} className="mt-4 flex h-8 items-center gap-2">
            <span className="text-xl font-medium text-(--muted) sm:text-2xl">
              {typed}
              <span className="ml-1 inline-block h-6 w-0.5 animate-pulse bg-indigo-400 align-middle" />
            </span>
          </motion.div>

          <motion.p variants={item} className="mt-5 max-w-lg text-base leading-relaxed text-(--muted)">
            React.js / Front-End Developer with <strong className="font-semibold text-(--fg)">2+ years</strong> building
            responsive web apps, dashboards, and production client websites. Focused on
            performance, pixel-accurate UI, and clean component systems.
          </motion.p>

          <motion.div variants={item} className="mt-2 flex items-center gap-1.5 text-xs text-(--muted)">
            <FiMapPin className="shrink-0" />
            Ahmedabad, Gujarat, India
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNav('#projects')}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_-20px_rgba(99,102,241,0.75)] transition duration-300 hover:brightness-110 hover:shadow-[0_22px_55px_-18px_rgba(99,102,241,0.9)] active:scale-[0.98]"
            >
              View My Work
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-6 py-3 text-sm font-semibold text-(--fg) backdrop-blur transition duration-300 hover:bg-(--card-strong) active:scale-[0.98]"
            >
              Download Resume
              <FiDownload />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={item}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-(--border) bg-(--card) px-4 py-3 text-center backdrop-blur"
              >
                <div className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] leading-snug text-(--muted)">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — decorative UI mockup */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto aspect-square w-full max-w-[440px]"
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-indigo-500/30 via-cyan-400/20 to-purple-500/30"
              animate={{ rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-3 rounded-[36px] border border-(--border) bg-(--card) shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl" />

            {/* Floating card 1 — dashboard preview */}
            <motion.div
              className="absolute left-6 top-8 w-[76%] rounded-2xl border border-(--border) bg-(--card-strong) p-4 shadow-xl backdrop-blur"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-14 rounded-full bg-(--ring)" />
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
                  <div className="h-2 w-2 rounded-full bg-amber-400/70" />
                </div>
              </div>
              <div className="mt-3 h-9 w-full rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/15" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-14 rounded-xl border border-(--border) bg-(--card)" />
                <div className="h-14 rounded-xl border border-(--border) bg-(--card)" />
                <div className="h-14 rounded-xl border border-(--border) bg-(--card)" />
              </div>
            </motion.div>

            {/* Floating card 2 — component snippet */}
            <motion.div
              className="absolute bottom-8 right-6 w-[68%] rounded-2xl border border-(--border) bg-(--card-strong) p-4 shadow-xl backdrop-blur"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-20 rounded-full bg-(--ring)" />
                <div className="h-2 w-8 rounded-full bg-purple-400/40" />
              </div>
              <div className="mt-3 h-28 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15" />
              <div className="mt-3 flex gap-2">
                <div className="h-2 flex-1 rounded-full bg-(--ring)" />
                <div className="h-2 w-1/3 rounded-full bg-(--ring)" />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-(--border) bg-(--card-strong) px-4 py-2 text-xs font-semibold text-(--muted) backdrop-blur shadow-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              🚀 Figma → Production
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
