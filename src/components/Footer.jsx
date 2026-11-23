/**
 * Footer — "Dawn over the garden"
 *
 * The night at the mailbox gives way to sunrise: two crossed ribbons that
 * speed up with your scroll, a closing invitation, a live Ahmedabad clock,
 * a giant signature whose letters lift toward the cursor, and a meadow of
 * cornflowers that bends away from your pointer (or ripples from a tap).
 * On large screens the whole footer is revealed from beneath the page.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { FiArrowUp, FiArrowUpRight, FiCheck, FiCopy, FiLinkedin, FiMail } from 'react-icons/fi'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { coral, ink, iris, marigold, orchid, paper, teal } from '../lib/palette'
import { EASE as MOTION } from '../lib/motion'
import { RevealLine } from './ui/Reveal'

const EMAIL = 'kasimhusain260@gmail.com'
const PATH = [
  { label: 'Bloom', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Herbarium', href: '#skills' },
  { label: 'Work', href: '#projects' },
  { label: 'Journal', href: '#experience' },
  { label: 'Stamps', href: '#achievements' },
  { label: 'Contact', href: '#contact' },
]
const EASE = MOTION.out
// petal colour, centre colour: the whole spectrum growing in one meadow
const MEADOW = [
  [iris[600], paper.base],
  [orchid[500], marigold[300]],
  [coral[500], paper.hi],
  [teal[500], paper.hi],
  [marigold[500], coral[700]],
  [iris[400], ink.base],
]
const wrap = (min, max, v) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}
const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ─── Ribbons: scroll-velocity marquee ──────────────────────── */
function Ribbon({ words, base = 2.4, className = '', textClass = '', reverse = false }) {
  const reduce = useReducedMotion()
  const x0 = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(vel, [-1500, 0, 1500], [-4, 0, 4], { clamp: false })
  const dir = useRef(reverse ? 1 : -1)
  const x = useTransform(x0, (v) => `${wrap(-50, 0, v)}%`)
  useAnimationFrame((_, delta) => {
    if (reduce) return
    const f = factor.get()
    if (f < 0) dir.current = reverse ? -1 : 1
    else if (f > 0) dir.current = reverse ? 1 : -1
    const move = dir.current * base * (delta / 1000) * (1 + Math.abs(f))
    x0.set(x0.get() + move)
  })
  const line = (
    <span className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={textClass}>{w}</span>
          <span className="mx-6 text-[0.6em] opacity-70 sm:mx-9">✦</span>
        </span>
      ))}
    </span>
  )
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <motion.div style={{ x }} className="flex w-max">
        {line}
        {line}
        {line}
        {line}
      </motion.div>
    </div>
  )
}

/* ─── Signature: letters lift toward the cursor ─────────────── */
function Signature({ text }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const letters = text.split('')
  const n = letters.length

  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const spans = [...el.querySelectorAll('[data-l]')]
    const lift = new Float32Array(spans.length)
    let px = null
    let raf = 0
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX
    }
    const onLeave = () => (px = null)
    const tick = () => {
      let moving = false
      spans.forEach((s, i) => {
        let target = 0
        if (px != null) {
          const r = s.getBoundingClientRect()
          const d = Math.abs(r.left + r.width / 2 - px)
          target = Math.max(0, 1 - d / 220)
        }
        lift[i] += (target - lift[i]) * 0.12
        if (Math.abs(target - lift[i]) > 0.002) moving = true
        s.style.transform = `translate3d(0, ${-lift[i] * 26}%, 0) rotate(${(lift[i] * (i % 2 ? 4 : -4)).toFixed(2)}deg)`
      })
      raf = moving || px != null ? requestAnimationFrame(tick) : 0
    }
    const kick = (e) => {
      onMove(e)
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const footer = el.closest('footer')
    footer.addEventListener('pointermove', kick)
    footer.addEventListener('pointerleave', onLeave)
    return () => {
      footer.removeEventListener('pointermove', kick)
      footer.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  return (
    <p ref={ref} aria-label={text} className="flex select-none justify-center whitespace-nowrap font-serif text-[clamp(3.6rem,15.5vw,15rem)] italic leading-[0.85] tracking-[-0.03em]">
      {letters.map((c, i) => (
        <span key={i} data-l className="inline-block will-change-transform" aria-hidden="true">
          <motion.span
            className="inline-block bg-clip-text pb-[0.12em] text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg,var(--color-ink),var(--color-iris-700) 35%,var(--color-orchid-700) 62%,var(--color-ink) 92%)',
              backgroundSize: `${n * 100}% 100%`,
              backgroundPosition: `${(i / (n - 1)) * 100}% 0`,
            }}
            initial={reduce ? false : { y: '110%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 1.1, delay: i * 0.045, ease: EASE }}
          >
            {c === ' ' ? ' ' : c}
          </motion.span>
        </span>
      ))}
    </p>
  )
}

/* ─── Meadow: cornflowers that bend away from the pointer ───── */
function Bloom({ color, center }) {
  return (
    <svg viewBox="-20 -20 40 40" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 8 }, (_, k) => (
        <path key={k} d="M0 -3 L-3.2 -14 L-1.2 -12.4 L0 -17 L1.2 -12.4 L3.2 -14 Z" fill={color} transform={`rotate(${k * 45})`} />
      ))}
      <circle r="3.6" fill={center} />
    </svg>
  )
}

function Meadow({ count }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const flowers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r1 = rand(i, 1)
        const r2 = rand(i, 2)
        const r3 = rand(i, 3)
        const [color, center] = MEADOW[Math.floor(r2 * MEADOW.length)]
        return {
          x: ((i + 0.5) / count) * 100 + (r1 - 0.5) * (70 / count),
          h: 64 + r3 * 84,
          size: 24 + r1 * 18,
          color,
          center,
          bud: r3 > 0.86,
          dur: 3.4 + r2 * 2.6,
          delay: -r1 * 4,
        }
      }),
    [count],
  )

  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const nodes = [...el.querySelectorAll('[data-f]')]
    const bend = new Float32Array(nodes.length)
    const kickV = new Float32Array(nodes.length)
    let px = null
    let raf = 0
    let visible = false
    const tick = () => {
      const w = el.clientWidth
      let active = false
      nodes.forEach((n, i) => {
        const fx = (flowers[i].x / 100) * w
        let target = 0
        if (px != null) {
          const d = fx - px
          target = Math.sign(d) * Math.exp(-(d * d) / (2 * 110 * 110)) * 30
        }
        kickV[i] *= 0.9
        bend[i] += (target + kickV[i] - bend[i]) * 0.09
        if (Math.abs(target + kickV[i] - bend[i]) > 0.05) active = true
        n.style.transform = `rotate(${bend[i].toFixed(2)}deg)`
      })
      raf = visible && (active || px != null) ? requestAnimationFrame(tick) : 0
    }
    const start = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }
    const footer = el.closest('footer')
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      px = e.clientX - el.getBoundingClientRect().left
      start()
    }
    const onLeave = () => {
      px = null
      start()
    }
    // a tap sends a ripple through the meadow
    const onDown = (e) => {
      if (e.pointerType === 'mouse') return
      const x = e.clientX - el.getBoundingClientRect().left
      const w = el.clientWidth
      flowers.forEach((f, i) => {
        const d = (f.x / 100) * w - x
        kickV[i] += Math.sign(d) * Math.exp(-(d * d) / (2 * 160 * 160)) * 34
      })
      start()
    }
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      start()
    })
    io.observe(el)
    footer.addEventListener('pointermove', onMove)
    footer.addEventListener('pointerleave', onLeave)
    footer.addEventListener('pointerdown', onDown)
    return () => {
      io.disconnect()
      footer.removeEventListener('pointermove', onMove)
      footer.removeEventListener('pointerleave', onLeave)
      footer.removeEventListener('pointerdown', onDown)
      cancelAnimationFrame(raf)
    }
  }, [flowers, reduce])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] sm:h-[190px]">
      {/* grass */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[60px] w-full">
        <path
          d={`M0 60 ${Array.from({ length: 80 }, (_, i) => `L${i * 5 + 1.5} ${24 + rand(i, 7) * 26} L${i * 5 + 3} ${44 + rand(i, 8) * 10} L${i * 5 + 5} ${30 + rand(i, 9) * 24}`).join(' ')} L400 60Z`}
          fill="var(--color-teal-600)"
          opacity="0.55"
        />
        <path
          d={`M0 60 ${Array.from({ length: 100 }, (_, i) => `L${i * 4 + 1} ${36 + rand(i, 4) * 20} L${i * 4 + 2.5} ${50 + rand(i, 5) * 6} L${i * 4 + 4} ${40 + rand(i, 6) * 18}`).join(' ')} L400 60Z`}
          fill="var(--color-teal-700)"
        />
      </svg>
      {flowers.map((f, i) => (
        <div key={i} data-f className="absolute bottom-[14px] origin-bottom" style={{ left: `${f.x}%`, height: f.h, width: f.size }}>
          <div
            className="relative h-full w-full origin-bottom"
            style={reduce ? undefined : { animation: `sway ${f.dur}s ${f.delay}s ease-in-out infinite alternate` }}
          >
            <span className="absolute bottom-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,var(--color-teal-600),var(--color-teal-700))]" style={{ top: f.size * 0.45 }} />
            <span className="absolute left-1/2 h-[7px] w-[14px] origin-left rounded-full bg-teal-600" style={{ bottom: f.h * 0.32, transform: `rotate(${i % 2 ? -30 : 210}deg)` }} />
            <div className="absolute left-0 top-0" style={{ width: f.size, height: f.size }}>
              {f.bud ? (
                <span className="absolute inset-[30%] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-coral-300),var(--color-coral-500))]" />
              ) : (
                <div className="h-full w-full" style={reduce ? undefined : { animation: `spin ${16 + f.dur * 3}s linear infinite` }}>
                  <Bloom color={f.color} center={f.center} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Bits ──────────────────────────────────────────────────── */
function useISTClock() {
  const fmt = useMemo(() => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }), [])
  const [t, setT] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setT(fmt.format(new Date())), 20000)
    return () => clearInterval(id)
  }, [fmt])
  return t
}

function Magnetic({ children, className = '', ...rest }) {
  const x = useSpring(0, { stiffness: 220, damping: 16 })
  const y = useSpring(0, { stiffness: 220, damping: 16 })
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.25)
    y.set((e.clientY - r.top - r.height / 2) * 0.35)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.a style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={className} {...rest}>
      {children}
    </motion.a>
  )
}

/* ─── Footer ────────────────────────────────────────────────── */
function FooterBody() {
  const smooth = useSmoothScroll()
  const time = useISTClock()
  const [copied, setCopied] = useState(false)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 768)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const go = (href) => (e) => {
    e.preventDefault()
    const el = document.getElementById(href.slice(1))
    if (!el) return
    if (smooth?.scrollTo) smooth.scrollTo(el, { offset: href === '#home' ? 0 : -72, duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }
  const toTop = () => {
    if (smooth?.scrollTo) smooth.scrollTo(0, { duration: 2 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <footer className="relative overflow-hidden bg-(image:--grad-dawn) text-paper">
      {/* dawn: rising sun and slow rays */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-30vmin] left-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,_var(--color-paper)_95%,_transparent)_0%,color-mix(in_srgb,_var(--color-paper-2)_70%,_transparent)_22%,color-mix(in_srgb,_var(--hue-300)_25%,_transparent)_45%,transparent_68%)] [animation:sunrise_9s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-[-60vmin] left-1/2 h-[160vmin] w-[160vmin] -translate-x-1/2 rounded-full opacity-25 [animation:spin_120s_linear_infinite] [background:repeating-conic-gradient(from_0deg,color-mix(in_srgb,_var(--color-paper)_50%,_transparent)_0deg_4deg,transparent_4deg_16deg)] [mask-image:radial-gradient(circle,var(--color-ink-950)_18%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(color-mix(in_srgb,_var(--color-paper)_90%,_transparent)_1px,transparent_1.2px)] [background-size:3px_3px] [mask-image:linear-gradient(180deg,var(--color-ink-950),transparent_45%)]" />
      </div>

      {/* crossed ribbons */}
      <div className="relative h-[120px] sm:h-[156px]">
        <Ribbon
          reverse
          base={1.6}
          words={['Open to freelance', 'Websites that grow', 'React & Next.js', 'Figma to launch', 'Ahmedabad · Worldwide']}
          className="absolute inset-x-[-5%] top-[16px] rotate-[2.6deg] bg-marigold-400 py-2.5 text-ink shadow-[0_10px_30px_-12px_color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)] sm:top-[20px] sm:py-3"
          textClass="font-mono text-[12px] uppercase tracking-[0.3em] sm:text-[13px]"
        />
        <Ribbon
          base={2.6}
          words={['Let’s grow something', 'Say hello', 'Let’s grow something', 'Write me a postcard']}
          className="absolute inset-x-[-5%] top-[52px] rotate-[-2.4deg] bg-[linear-gradient(90deg,var(--color-iris-600),var(--color-orchid-600)_50%,var(--color-iris-600))] py-2 text-paper shadow-[0_18px_40px_-14px_color-mix(in_srgb,_var(--color-ink-950)_80%,_transparent)] ring-1 ring-paper/20 sm:top-[66px] sm:py-3"
          textClass="font-display text-[22px] font-semibold tracking-[-0.02em] sm:text-[34px]"
        />
      </div>

      <div className="container-page relative pt-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          {/* invitation */}
          <div>
            <p className="eyebrow text-hue-300">Thanks for walking the garden</p>
            <h2 className="mt-5 font-display text-[clamp(2.2rem,1.5rem+2.8vw,4rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
              <RevealLine>Got an idea that</RevealLine>
              <RevealLine delay={0.1}>
                <span className="font-serif font-normal italic tracking-[-0.01em] text-hue-300">needs to grow?</span>
              </RevealLine>
            </h2>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Magnetic
                href="#contact"
                onClick={go('#contact')}
                className="group inline-flex min-h-[52px] items-center gap-3 rounded-full bg-paper py-2 pl-6 pr-2 font-display text-[15px] font-semibold text-ink shadow-[0_18px_40px_-16px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)]"
              >
                Write me a postcard
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--hue-300),var(--hue-500)_55%,var(--color-ink))] text-paper transition-transform duration-300 group-hover:rotate-45">
                  <FiArrowUpRight />
                </span>
              </Magnetic>
              <p className="flex items-center gap-2 text-[13px] text-mist">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                Available for freelance · <span className="tabular-nums text-paper">{time}</span> in Ahmedabad
              </p>
            </div>
          </div>

          {/* columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pt-8">
            <nav aria-label="Footer">
              <h3 className="font-mono text-eyebrow font-normal uppercase tracking-[0.24em] text-hue-300">The path</h3>
              <ul className="mt-4 space-y-2.5">
                {PATH.map((l, i) => (
                  <li key={l.href}>
                    <a href={l.href} onClick={go(l.href)} className="group inline-flex min-h-7 items-center gap-2 py-0.5 text-[14px] text-mist transition-colors hover:text-paper">
                      <span className="font-mono text-[12px] text-hue-300">{String(i + 1).padStart(2, '0')}</span>
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-hue-300 transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h3 className="font-mono text-eyebrow font-normal uppercase tracking-[0.24em] text-hue-300">Say hello</h3>
              <button
                type="button"
                onClick={copy}
                className="group mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-ink-950/30 px-3.5 py-2 text-left text-[13px] text-paper ring-1 ring-hue-300/25 backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
                aria-label={copied ? 'Email copied' : `Copy email address ${EMAIL}`}
              >
                {copied ? <FiCheck className="shrink-0 text-hue-400" /> : <FiCopy className="shrink-0 text-hue-300 group-hover:text-hue-400" />}
                <span className="truncate">{copied ? 'Copied to clipboard' : narrow ? 'Copy email' : EMAIL}</span>
              </button>
              <p className="mt-3 text-[13px] leading-relaxed text-mist">Replies within a day or two, usually sooner.</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-mono text-eyebrow font-normal uppercase tracking-[0.24em] text-hue-300">Elsewhere</h3>
              <div className="mt-4 flex gap-3">
                {[
                  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/kasim-husain-6601071a8' },
                  { icon: FiMail, label: 'Email', href: `mailto:${EMAIL}` },
                ].map(({ icon: Icon, label, href }) => (
                  <Magnetic
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    aria-label={label}
                    className="grid h-12 w-12 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--hue-300),var(--hue-500)_55%,var(--hue-700))] text-[18px] text-paper shadow-[0_12px_26px_-12px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)] ring-1 ring-paper/30 transition-shadow hover:shadow-[0_0_0_6px_color-mix(in_srgb,_var(--hue-300)_25%,_transparent),0_12px_26px_-12px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)]"
                  >
                    <Icon />
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* signature */}
        <div className="relative z-10 mt-12 sm:mt-16">
          <Signature text="Kasim Husain" />
        </div>

        {/* bottom bar */}
        <div className="relative z-10 mt-4 flex flex-col-reverse items-start justify-between gap-4 pb-[170px] sm:flex-row sm:items-center sm:pb-[196px]">
          <p className="text-[12px] font-medium text-ink">© {new Date().getFullYear()} Kasim Husain · Grown by hand in React</p>
          <button
            type="button"
            onClick={toTop}
            className="group inline-flex items-center gap-3 rounded-full bg-ink-900 py-1.5 pl-4 pr-1.5 text-[13px] text-paper shadow-[0_14px_30px_-14px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)] transition-colors hover:bg-hue-700"
          >
            Back to the bloom
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-paper),var(--hue-300)_45%,var(--hue-500))] text-ink transition-transform duration-300 group-hover:-translate-y-1">
              <FiArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>

      <Meadow count={narrow ? 22 : 48} />
    </footer>
  )
}

/** On large screens the footer is revealed from beneath the page as you reach the end. */
export default function Footer() {
  const innerRef = useRef(null)
  const [reveal, setReveal] = useState({ on: false, h: 0 })
  useEffect(() => {
    const el = innerRef.current
    const measure = () => {
      const h = el.offsetHeight
      const on = window.innerWidth >= 1024 && h <= window.innerHeight
      setReveal((prev) => (prev.on === on && prev.h === h ? prev : { on, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div className="relative" style={reveal.on ? { height: reveal.h, clipPath: 'inset(0 0 0 0)' } : undefined}>
      <div ref={innerRef} className={reveal.on ? 'fixed inset-x-0 bottom-0' : ''}>
        <FooterBody />
      </div>
    </div>
  )
}
