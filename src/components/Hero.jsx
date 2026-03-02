import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiArrowRight } from 'react-icons/fi'

function useTypewriter(words, ms = 70, pauseMs = 1200) {
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

    const delta = deleting ? ms / 1.8 : ms
    const t = setTimeout(() => {
      setSubIndex((s) => s + (deleting ? -1 : 1))
    }, delta)

    return () => clearTimeout(t)
  }, [words, index, subIndex, deleting, current, ms, pauseMs])

  return current.substring(0, subIndex)
}

export default function Hero() {
  const roles = useMemo(
    () => ['React Developer', 'Frontend Engineer', 'UI-focused Builder'],
    [],
  )
  const typed = useTypewriter(roles)

  const onNav = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  }

  const item = {
    hidden: { y: 16, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
  }

  return (
    <section id="home" className="relative overflow-hidden pt-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-500/30 via-cyan-400/20 to-purple-500/30 blur-3xl" />
        <motion.div
          className="absolute left-10 top-40 h-72 w-72 rounded-full bg-linear-to-r from-cyan-400/20 to-indigo-500/20 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-10 top-64 h-80 w-80 rounded-full bg-linear-to-r from-purple-500/20 to-cyan-400/20 blur-3xl"
          animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p variants={item} className="text-sm font-medium text-(--muted)">
            Hi, I&apos;m
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-3 text-4xl font-semibold tracking-tight text-(--fg) sm:text-5xl"
          >
            <span className="bg-linear-to-r from-indigo-300 via-cyan-200 to-purple-300 bg-clip-text text-transparent">
              Kasim Kodaliya
            </span>
          </motion.h1>

          <motion.div variants={item} className="mt-4 flex items-center gap-2">
            <p className="text-lg text-(--muted) sm:text-xl">
              {typed}
              <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-(--ring) align-middle" />
            </p>
          </motion.div>

          <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-(--muted)">
            I build modern, high-performance web experiences with crisp UX, tasteful motion, and
            production-grade component systems.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNav('#projects')}
              className="group inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 via-cyan-500 to-purple-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_-20px_rgba(99,102,241,0.8)] transition duration-300 hover:brightness-110 active:scale-[0.99]"
            >
              View Projects
              <FiArrowRight className="transition group-hover:translate-x-0.5" />
            </button>

            <a
              href="/resume.pdf"
              className="inline-flex items-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-5 py-3 text-sm font-semibold text-(--fg) shadow-sm backdrop-blur transition duration-300 hover:bg-(--card-strong) active:scale-[0.99]"
              download
            >
              Download Resume
              <FiDownload />
            </a>
          </motion.div>

          <motion.div variants={item} className="mt-10 flex items-center gap-4 text-xs text-(--muted)">
            <span className="rounded-full border border-(--border) bg-(--card) px-3 py-1">Remote</span>
            <span className="rounded-full border border-(--border) bg-(--card) px-3 py-1">Available for freelance</span>
          </motion.div>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative mx-auto aspect-square w-full max-w-[420px]"
          >
            <motion.div
              className="absolute inset-0 rounded-[36px] bg-linear-to-r from-indigo-500/35 via-cyan-400/25 to-purple-500/35"
              animate={{ rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-3 rounded-[32px] border border-(--border) bg-(--card) shadow-[0_25px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl" />

            <motion.div
              className="absolute left-6 top-8 w-[78%] rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm backdrop-blur"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-2 w-16 rounded-full bg-(--ring)" />
              <div className="mt-3 h-8 w-full rounded-xl bg-linear-to-r from-indigo-500/25 to-cyan-500/20" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-16 rounded-xl bg-(--card)" />
                <div className="h-16 rounded-xl bg-(--card)" />
                <div className="h-16 rounded-xl bg-(--card)" />
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 right-6 w-[70%] rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm backdrop-blur"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-20 rounded-full bg-(--ring)" />
                <div className="h-2 w-10 rounded-full bg-(--card)" />
              </div>
              <div className="mt-3 h-24 rounded-xl bg-linear-to-r from-purple-500/20 to-indigo-500/20" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
