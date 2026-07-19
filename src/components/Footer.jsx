import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FiArrowUp, FiLinkedin, FiMail, FiMapPin } from 'react-icons/fi'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'

const social = [
  { icon: FiMail,     label: 'Email',    href: 'mailto:kasimhusain260@gmail.com' },
  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/kasim-husain-6601071a8' },
]

const navLinks = [
  { label: 'About',      href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Contact',    href: '#contact' },
]

const techStack = ['React.js', 'Tailwind CSS', 'Framer Motion', 'Vite']

export default function Footer() {

  const smoothScroll = useSmoothScroll()

  const onTop = () => {
    if (smoothScroll?.scrollTo) {
      smoothScroll.scrollTo(0, { duration: 1.5 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const onNav = (href) => {
    const target = href.replace('#', '')
    if (smoothScroll?.scrollTo) {
      smoothScroll.scrollTo(`#${target}`, { offset: -88 })
    } else {
      const el = document.getElementById(target)
      if (!el) return
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
    }
  }

  return (
    <footer
      className="relative overflow-hidden border-t border-(--border)"
    >
      {/* Subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-500/8 blur-3xl"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">

        {/* ── Top row ── */}
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">

          {/* Brand */}
          <div>
            <div className="text-base font-black tracking-tight">
              <span
                style={{
                  background: 'linear-gradient(135deg,#a5b4fc,#67e8f9,#c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Kasim
              </span>
              <span className="text-(--muted)">.dev</span>
            </div>
            <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-(--muted)">
              React.js / Front-End Developer building fast, accessible, pixel-accurate web experiences.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-(--muted)">
              <FiMapPin size={11} />
              Ahmedabad, Gujarat, India
            </div>

            {/* Social icons */}
            <div className="mt-4 flex items-center gap-2">
              {social.map((s) => {
                const Icon = s.icon
                return (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={s.label}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--muted) transition hover:border-indigo-500/30 hover:bg-(--card-strong) hover:text-(--fg)"
                  >
                    <Icon size={15} />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-(--muted)">Navigation</div>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <button
                    type="button"
                    onClick={() => onNav(l.href)}
                    className="group flex items-center gap-1.5 text-sm text-(--muted) transition hover:text-(--fg)"
                  >
                    <span className="inline-block h-px w-3 origin-left scale-x-0 bg-gradient-to-r from-indigo-400 to-cyan-400 transition-transform group-hover:scale-x-100" />
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-(--muted)">Work Together</div>
            <p className="text-sm leading-relaxed text-(--muted)">
              Open to frontend roles and freelance projects. Let&apos;s build something great.
            </p>
            <motion.a
              href="mailto:kasimhusain260@gmail.com"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_12px_35px_-15px_rgba(99,102,241,0.75)] transition hover:shadow-[0_16px_45px_-14px_rgba(99,102,241,0.9)]"
            >
              <FiMail size={13} />
              kasimhusain260@gmail.com
            </motion.a>

            {/* Built with */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <span key={t} className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* ── Bottom row ── */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-(--muted)">
            © {new Date().getFullYear()} Kasim Husain. All rights reserved.
          </p>
          <motion.button
            type="button"
            onClick={onTop}
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-3.5 py-2 text-xs font-semibold text-(--fg) transition hover:bg-(--card-strong)"
            aria-label="Back to top"
          >
            Back to top <FiArrowUp size={12} />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
