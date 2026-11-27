import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { useBloom } from '../lib/bloomStore'
import { useJourney } from '../lib/journey'
import { SECTION_HUES } from '../lib/palette'
import { EASE as MOTION } from '../lib/motion'

const navLinks = [
  { label: 'About', href: '#about', n: '02' },
  { label: 'Skills', href: '#skills', n: '03' },
  { label: 'Work', href: '#projects', n: '04' },
  { label: 'Experience', href: '#experience', n: '05' },
  { label: 'Contact', href: '#contact', n: '07' },
]
const HUE_OF = Object.fromEntries(SECTION_HUES.map((s) => [s.id, s.hue]))

const EASE = MOTION.out

export default function Navbar() {
  // shared scroll reader (lib/journey): active section, scroll state and the surface under the bar
  const { active, scrolled, onLight, pastHero } = useJourney()
  const [open, setOpen] = useState(false)
  const live = useBloom((s) => s.phase === 'live')
  const smoothScroll = useSmoothScroll()
  const toggleRef = useRef(null)
  const firstLinkRef = useRef(null)

  // Menu: lock scroll, close on Escape, move focus in and hand it back on close
  useEffect(() => {
    if (!open) return
    const toggle = toggleRef.current
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    smoothScroll?.stop?.()
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => firstLinkRef.current?.focus(), 120)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
      smoothScroll?.start?.()
      document.body.style.overflow = ''
      toggle?.focus()
    }
  }, [open, smoothScroll])

  const onNav = (href) => (e) => {
    e?.preventDefault()
    if (open) {
      document.body.style.overflow = ''
      smoothScroll?.start?.()
      setOpen(false)
    }
    requestAnimationFrame(() => {
      if (smoothScroll?.scrollTo) smoothScroll.scrollTo(href, { offset: href === '#home' ? 0 : -80 })
      else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const light = onLight && !open
  const hue = HUE_OF[active] || 'iris'

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={live ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
      transition={{ duration: 1, delay: live ? 1.1 : 0, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        '--nav-fg': light ? 'var(--color-ink)' : 'var(--color-paper)',
        '--nav-soft': light ? 'var(--color-ink-soft)' : 'var(--color-mist)',
        '--nav-bg': onLight ? 'var(--color-paper)' : 'var(--color-ink-900)',
        // the underline and logo dot take the colour of the section you're in
        '--nav-accent': light ? `var(--color-${hue}-600)` : `var(--color-${hue}-400)`,
      }}
    >
      <a
        href="#main"
        className="btn btn-sm btn-primary absolute left-4 top-3 z-20 -translate-y-24 focus-visible:translate-y-0"
      >
        Skip to content
      </a>

      <div
        className={`container-page flex items-center justify-between py-4 transition-[background-color,backdrop-filter] duration-500 md:py-5 ${scrolled && !open && (!onLight || pastHero) ? 'bg-(--nav-bg)/72 backdrop-blur-lg' : ''
          }`}
        style={{ maxWidth: 'none' }}
      >
        <a
          href="#home"
          onClick={onNav('#home')}
          aria-label="Kasim Husain, back to top"
          className="relative z-10 font-display text-3xl font-bold tracking-[-0.03em] text-(--nav-fg) transition-colors duration-500"
        >
          K<span className="text-(--nav-accent) transition-colors duration-500">.</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex lg:gap-9" aria-label="Primary">
          {navLinks.map((l) => {
            const isActive = active === l.href.slice(1)
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={onNav(l.href)}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative py-1.5 text-[0.95rem] transition-colors duration-300 ${isActive ? 'text-(--nav-fg)' : 'text-(--nav-soft) hover:text-(--nav-fg)'
                  }`}
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-(--nav-accent) transition-[transform,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                />
              </a>
            )
          })}
        </nav>

        <div className="hidden md:flex">
          <a href="#contact" onClick={onNav('#contact')} className="btn btn-sm btn-primary">
            Let&apos;s talk
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative z-10 inline-flex min-h-11 items-center gap-2.5 rounded-full px-4 font-display text-sm font-semibold text-(--nav-fg) ring-1 ring-(--nav-fg)/30 transition-colors md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true" className="relative block h-3 w-4">
            <span
              className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0.5'
                }`}
            />
            <span
              className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-2.5'
                }`}
            />
          </span>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="bg-night fixed inset-0 -z-0 flex flex-col justify-between px-5 pb-8 pt-24 sm:px-8 md:hidden"
            data-hue={hue}
          >
            <nav aria-label="Mobile">
              <ul>
                {navLinks.map((l, i) => {
                  const id = l.href.slice(1)
                  return (
                    <li key={l.href} className="overflow-hidden border-b border-paper/10" data-hue={HUE_OF[id]}>
                      <motion.a
                        ref={i === 0 ? firstLinkRef : undefined}
                        href={l.href}
                        onClick={onNav(l.href)}
                        aria-current={active === id ? 'true' : undefined}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.7, delay: 0.12 + i * 0.06, ease: EASE }}
                        className="flex items-baseline gap-4 py-3 font-display text-[clamp(2.4rem,11vw,3.2rem)] font-semibold leading-none tracking-[-0.04em] text-paper aria-[current=true]:text-hue-300"
                      >
                        <span className="font-mono text-eyebrow font-normal tracking-[0.2em] text-hue-300">{l.n}</span>
                        {l.label}
                      </motion.a>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
              className="flex flex-col gap-4"
            >
              <a href="#contact" onClick={onNav('#contact')} className="btn btn-primary w-full">
                Let&apos;s talk
              </a>
              <p className="text-center text-caption text-mist">Available for freelance · Ahmedabad, India (IST)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
