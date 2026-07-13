import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX, FiDownload } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
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
        if (el && el.offsetTop <= y) current = id
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
  const [scrolled, setScrolled] = useState(false)

  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    theme === 'light' ? root.classList.add('light') : root.classList.remove('light')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const onNav = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div
          className={`mt-4 flex items-center justify-between rounded-2xl border border-(--border) bg-(--card) px-4 py-3 backdrop-blur-xl transition-shadow duration-300 ${
            scrolled ? 'shadow-[0_12px_40px_-15px_rgba(0,0,0,0.35)]' : 'shadow-none'
          }`}
        >
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNav('#home')}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 transition"
          >
            <span className="text-sm font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Kasim
              </span>
              <span className="text-(--muted)">.dev</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navLinks.map((l) => {
              const isActive = active === l.href.replace('#', '')
              return (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => onNav(l.href)}
                  className="relative rounded-xl px-3 py-2 text-sm font-medium text-(--muted) transition-colors hover:text-(--fg)"
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-(--card-strong)"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {l.label}
                </button>
              )
            })}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-xs font-semibold text-(--fg) transition hover:bg-(--card-strong)"
              aria-label="Download resume"
            >
              <FiDownload size={13} />
              Resume
            </a>
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
            <motion.button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) transition active:scale-[0.96]"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              whileTap={{ scale: 0.94 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? 'x' : 'menu'}
                  initial={{ opacity: 0, rotate: open ? -45 : 45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: open ? 45 : -45, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {open ? <FiX size={18} /> : <FiMenu size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden"
            >
              <div className="mt-2 rounded-2xl border border-(--border) bg-(--card) p-2 backdrop-blur-xl">
                {navLinks.map((l, idx) => {
                  const isActive = active === l.href.replace('#', '')
                  return (
                    <motion.button
                      key={l.href}
                      type="button"
                      onClick={() => onNav(l.href)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.25, ease: 'easeOut' }}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                        isActive ? 'bg-(--card-strong) text-(--fg)' : 'text-(--muted) hover:bg-(--card-strong) hover:text-(--fg)'
                      }`}
                    >
                      {l.label}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400" />
                      )}
                    </motion.button>
                  )
                })}
                <div className="mt-1 border-t border-(--border) pt-2">
                  <a
                    href="/resume.pdf"
                    download
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-(--fg) transition hover:bg-(--card-strong)"
                  >
                    <FiDownload size={14} />
                    Download Resume
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
