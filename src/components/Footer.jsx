import { motion } from 'framer-motion'
import { FiArrowUp, FiLinkedin, FiMail, FiMapPin } from 'react-icons/fi'

const links = [
  { icon: FiMail, label: 'Email', href: 'mailto:kasimhusain260@gmail.com' },
  {
    icon: FiLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kasim-husain-6601071a8',
  },
]

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  const onTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const onNav = (href) => {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-(--border) bg-(--card) backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">

        {/* Top row */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand + tagline */}
          <div className="max-w-xs">
            <div className="text-base font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                Kasim
              </span>
              <span className="text-(--muted)">.dev</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-(--muted)">
              React.js / Front-End Developer building fast, accessible, and pixel-accurate web experiences.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-(--muted)">
              <FiMapPin size={12} className="shrink-0" />
              Ahmedabad, Gujarat, India
            </div>
            <div className="mt-4 flex items-center gap-2">
              {links.map((l) => {
                const Icon = l.icon
                return (
                  <motion.a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={l.label}
                    whileHover={{ y: -3, scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--bg) text-(--muted) transition hover:border-indigo-500/30 hover:bg-(--card-strong) hover:text-(--fg)"
                  >
                    <Icon size={16} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-(--muted)">Navigation</div>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <button
                    type="button"
                    onClick={() => onNav(l.href)}
                    className="text-sm text-(--muted) transition hover:text-(--fg)"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="max-w-xs">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-(--muted)">Let&apos;s Work Together</div>
            <p className="text-sm leading-relaxed text-(--muted)">
              Open to frontend roles and freelance projects. Let&apos;s build something great.
            </p>
            <a
              href="mailto:kasimhusain260@gmail.com"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_-15px_rgba(99,102,241,0.7)] transition hover:brightness-110"
            >
              <FiMail size={14} />
              kasimhusain260@gmail.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-indigo-500/0 via-white/8 to-purple-500/0" />

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-(--muted)">
            © {new Date().getFullYear()} Kasim Husain. Built with React.js, Tailwind CSS & Framer Motion.
          </p>
          <motion.button
            type="button"
            onClick={onTop}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-(--border) bg-(--bg) px-3 text-xs font-semibold text-(--fg) transition hover:bg-(--card-strong)"
            aria-label="Back to top"
          >
            Back to top
            <FiArrowUp size={13} />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
