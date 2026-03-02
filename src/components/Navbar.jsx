import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

function useScrollSpy(ids, offset = 120) {
  const [active, setActive] = useState(ids[0] || '')

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY + offset
      let current = ids[0] || ''

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.offsetTop <= y) current = id
      }

      setActive(current)
    }

    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [ids, offset])

  return active
}

export default function Navbar() {
  const ids = useMemo(() => navLinks.map((l) => l.href.replace('#', '')), [])
  const active = useScrollSpy(ids)

  const [open, setOpen] = useState(false)

  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') root.classList.add('light')
    else root.classList.remove('light')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const onNav = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: y, behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-(--border) bg-(--card) px-4 py-3 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => onNav('#home')}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 transition"
          >
            <span className="text-sm font-semibold tracking-tight text-(--fg)">
              <span className="bg-linear-to-r from-indigo-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Kasim
              </span>
              <span className="text-(--muted)">.dev</span>
            </span>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map((l) => {
              const isActive = active === l.href.replace('#', '')
              return (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => onNav(l.href)}
                  className="relative rounded-xl px-3 py-2 text-sm font-medium text-(--muted) transition hover:text-(--fg)"
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-(--card-strong)"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">
                    {l.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r from-indigo-400 via-cyan-300 to-purple-400 transition-all duration-300 group-hover:w-full" />
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) transition active:scale-[0.98]"
              aria-label="Open menu"
            >
              {open ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-3 rounded-2xl border border-(--border) bg-(--card) p-2 backdrop-blur-xl">
                {navLinks.map((l) => {
                  const isActive = active === l.href.replace('#', '')
                  return (
                    <button
                      key={l.href}
                      type="button"
                      onClick={() => onNav(l.href)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-(--fg) transition hover:bg-(--card-strong)"
                    >
                      <span>{l.label}</span>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-linear-to-r from-indigo-400 via-cyan-300 to-purple-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
