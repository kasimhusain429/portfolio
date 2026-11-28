/**
 * Work — "The Conservatory"
 *
 * Three glasshouse doors, one per discipline. A door eases open on hover with
 * light spilling across the floor; choosing it swings it wide and walks the
 * camera through the doorway into that room. Each room presents its work its
 * own way: an editorial gallery (Web), live working previews (Apps) and a
 * print room of marks and hung posters (Graphics).
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { FiArrowLeft, FiArrowUpRight, FiX } from 'react-icons/fi'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { APPS, COUNTS, LOGOS, POSTERS, ROOMS, WEB } from '../data/work'
import { FocusMock, TypeMock } from './work/AppMocks'
import { Construction, LogoMark } from './work/Logos'
import { Poster } from './work/Posters'
import { EASE as MOTION } from '../lib/motion'
import { refreshJourney } from '../lib/journey'
import { useParallax } from '../hooks/useParallax'
import { RevealLine, RevealUp } from './ui/Reveal'

const EASE = MOTION.out
const pad2 = (n) => String(n).padStart(2, '0')

/* ─── The door ──────────────────────────────────────────────── */
function Glimpse({ room }) {
  return (
    <div className="absolute inset-0" style={{ background: room.glow }}>
      {room.key === 'web' && (
        <img src={WEB[0].photo} alt="" width="1024" height="1024" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-luminosity" />
      )}
      {room.key === 'apps' && (
        <div className="absolute inset-x-[16%] top-[30%] space-y-[8%]">
          {[90, 70, 82, 54].map((w, i) => (
            <span key={i} className="block h-[3px] rounded-full bg-paper/70" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}
      {room.key === 'graphics' && (
        <Poster poster={POSTERS[0]} className="absolute left-1/2 top-[22%] w-[62%] -translate-x-1/2 rotate-[-4deg] shadow-2xl" />
      )}
      <div className="absolute inset-0" style={{ background: room.glow, opacity: 0.85 }} />
    </div>
  )
}

function Door({ room, index, state, onOpen }) {
  // state: 'idle' | 'opening' | 'dim'
  const open = state === 'opening'
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={state !== 'idle'}
      aria-label={`Open the ${room.label} door: ${COUNTS[room.key]} pieces in ${room.room}`}
      className="group relative flex min-w-0 flex-1 flex-col items-center text-left outline-none disabled:cursor-default"
      style={{ opacity: state === 'dim' ? 0.35 : 1, transition: 'opacity .5s' }}
    >
      {/* the arch */}
      <div className="relative w-[min(100%,250px,calc((100svh-400px)/1.95))] min-w-[88px]">
        <div className="relative aspect-[1/1.95] rounded-t-[999px] bg-[linear-gradient(160deg,var(--color-paper),var(--color-paper-2)_55%,var(--hue-400))] p-[6%] shadow-[0_30px_60px_-24px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent),inset_0_-6px_12px_color-mix(in_srgb,_var(--color-ink)_25%,_transparent)] ring-1 ring-paper/40 group-focus-visible:ring-4 group-focus-visible:ring-hue-300">
          <div className="relative h-full w-full overflow-hidden rounded-t-[999px] bg-ink-950 [perspective:700px]">
            <Glimpse room={room} />
            {/* the leaf: opens inward, hinged on the left */}
            <div
              className={`absolute inset-0 origin-left rounded-t-[999px] shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--color-paper)_25%,_transparent)] transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] ${
                open ? '[transform:rotateY(98deg)]' : 'group-hover:[transform:rotateY(30deg)]'
              }`}
              style={{ background: `repeating-linear-gradient(90deg,color-mix(in srgb, var(--color-paper-hi) 5%, transparent) 0 2px,transparent 2px 9px),${room.leaf}` }}
            >
              {/* glazing */}
              <div className="absolute inset-x-[13%] top-[7%] grid h-[44%] grid-cols-2 grid-rows-3 gap-[5px] overflow-hidden rounded-t-[999px]">
                {Array.from({ length: 6 }, (_, k) => (
                  <span key={k} className="relative overflow-hidden bg-[linear-gradient(170deg,color-mix(in_srgb,_var(--color-paper)_50%,_transparent),color-mix(in_srgb,_var(--hue-300)_22%,_transparent)_55%,color-mix(in_srgb,_var(--hue-500)_15%,_transparent))]">
                    <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,var(--color-paper),color-mix(in_srgb,_var(--hue-300)_60%,_transparent)_50%,transparent)] opacity-0 transition-opacity duration-700 group-hover:opacity-90" />
                  </span>
                ))}
              </div>
              {/* plaque */}
              <div className="absolute left-1/2 top-[53%] w-[66%] -translate-x-1/2 rounded-[4px] bg-[linear-gradient(180deg,var(--color-paper-hi),var(--color-paper-2))] px-1 py-[6%] text-center shadow-[0_4px_10px_-4px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)]">
                <p className="font-display text-[clamp(10px,0.55rem+0.65vw,15px)] font-semibold uppercase leading-none tracking-[0.04em] text-ink sm:tracking-[0.14em]">
                  {room.label}
                </p>
              </div>
              {/* lower panel */}
              <div className="absolute inset-x-[13%] bottom-[5%] top-[66%] rounded-[6px] shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--color-paper)_22%,_transparent),inset_0_10px_18px_-8px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]" />
              {/* handle */}
              <span className="absolute right-[10%] top-[62%] h-[3.2%] w-[7%] min-w-[7px] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-paper),var(--hue-300)_45%,var(--hue-500))] shadow-[0_2px_4px_color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)]" />
              {/* sheen */}
              <span className="pointer-events-none absolute inset-0 rounded-t-[999px] bg-[linear-gradient(105deg,transparent_30%,color-mix(in_srgb,_var(--color-paper)_22%,_transparent)_45%,transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </div>
          </div>
        </div>
        {/* light spilling across the floor */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-[6%] right-[6%] top-full h-[34%] origin-top transition-opacity duration-700 [clip-path:polygon(0_0,100%_0,135%_100%,-10%_100%)] ${
            open ? 'opacity-100' : 'opacity-25 group-hover:opacity-90'
          }`}
          style={{ background: 'linear-gradient(180deg,color-mix(in srgb, var(--hue-300) 55%, transparent),color-mix(in srgb, var(--hue-500) 12%, transparent) 60%,transparent)' }}
        />
      </div>
      {/* caption */}
      <div className="relative mt-4 w-full max-w-[250px] text-center sm:mt-5">
        <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-hue-300 sm:text-eyebrow sm:tracking-[0.2em]">
          <span className="max-sm:hidden">Door </span>{pad2(index + 1)} · {pad2(COUNTS[room.key])}
        </p>
        <p className="mt-1 font-serif text-[clamp(1rem,2.4vw,1.75rem)] italic leading-tight text-paper">{room.room}</p>
      </div>
    </button>
  )
}

function Foyer({ opening, onOpen }) {
  return (
    <div>
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <RevealUp as="p" className="eyebrow text-hue-300">04 — Selected work</RevealUp>
          <h2 className="mt-5 font-display text-h2 font-semibold text-paper">
            <RevealLine>Three doors,</RevealLine>
            <RevealLine delay={0.1}>
              <span className="bg-[linear-gradient(100deg,var(--hue-300),var(--hue-400)_45%,var(--color-paper))] bg-clip-text font-serif font-normal italic tracking-[-0.01em] text-transparent">
                one garden.
              </span>
            </RevealLine>
          </h2>
        </div>
        <RevealUp as="p" delay={0.2} className="max-w-sm text-body text-mist lg:pb-2">
          Websites for real clients, apps I rebuilt to learn the craft, and graphics made for the joy of it.{' '}
          <span className="text-paper">Pick a door and step inside.</span>
        </RevealUp>
      </header>

      <div className="relative mt-10 sm:mt-14">
        {/* glasshouse floor */}
        <div aria-hidden="true" className="absolute inset-x-[-10%] bottom-[18%] h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,_var(--hue-300)_35%,_transparent),transparent)]" />
        <div className="relative flex items-start justify-center gap-3 sm:gap-8 lg:gap-14">
          {ROOMS.map((r, i) => (
            <Door
              key={r.key}
              room={r}
              index={i}
              state={opening ? (opening === r.key ? 'opening' : 'dim') : 'idle'}
              onOpen={(e) => onOpen(r.key, e.currentTarget)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Room shell ────────────────────────────────────────────── */
function RoomShell({ room, onBack, onSwitch, children }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="group btn btn-sm btn-ghost-dark"
        >
          <FiArrowLeft className="transition-transform group-hover:-translate-x-0.5" /> All doors
        </button>
        <div role="group" aria-label="Rooms" className="segmented">
          {ROOMS.map((r) => (
            <button
              key={r.key}
              type="button"
              aria-current={r.key === room.key ? 'true' : undefined}
              onClick={() => onSwitch(r.key)}
              className="segment"
            >
              {r.label}
              <span className="font-mono text-[0.8em] opacity-80">{pad2(COUNTS[r.key])}</span>
            </button>
          ))}
        </div>
      </div>
      <header className="mt-10 max-w-3xl sm:mt-14">
        <p className="eyebrow text-hue-300">
          Door {pad2(ROOMS.indexOf(room) + 1)} · {room.label}
        </p>
        <h2 className="mt-3 font-serif text-[clamp(2.6rem,7vw,5.5rem)] italic leading-[0.95] text-paper">{room.room}</h2>
        <p className="mt-4 max-w-lg text-body text-mist">{room.blurb}</p>
      </header>
      <div className="mt-10 sm:mt-14">{children}</div>
    </div>
  )
}

const Chips = ({ items }) => (
  <ul className="flex flex-wrap gap-1.5">
    {items.map((t) => (
      <li key={t} className="chip">
        {t}
      </li>
    ))}
  </ul>
)

/* ─── Web: editorial gallery ────────────────────────────────── */
function WebRoom() {
  const [active, setActive] = useState(0)
  const p = WEB[active]
  return (
    <>
      {/* desktop: index list + arched window */}
      <div className="hidden gap-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,40%)]">
        <ol className="border-t border-hue-300/15">
          {WEB.map((w, i) => (
            <li key={w.id} className="border-b border-hue-300/15">
              <a
                href={w.live}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group relative flex items-baseline gap-6 py-5 outline-none"
              >
                <span className={`font-mono text-xs transition-colors ${active === i ? 'text-hue-400' : 'text-haze'}`}>
                  {pad2(i + 1)}
                </span>
                <span
                  className={`font-display text-[clamp(1.9rem,3.3vw,3.3rem)] font-semibold leading-none tracking-[-0.03em] transition-all duration-500 ${
                    active === i ? 'translate-x-3 text-paper' : 'text-haze'
                  }`}
                >
                  {w.title}
                </span>
                <span className={`ml-auto shrink-0 text-right text-[13px] transition-colors ${active === i ? 'text-hue-300' : 'text-haze'}`}>
                  {w.category}
                </span>
                <FiArrowUpRight
                  className={`shrink-0 self-center text-xl text-paper transition-all duration-500 ${
                    active === i ? 'opacity-100' : '-translate-x-2 opacity-0'
                  }`}
                />
                <span
                  className={`absolute bottom-[-1px] left-0 h-px bg-[linear-gradient(90deg,var(--hue-300),var(--hue-500))] transition-all duration-700 ${
                    active === i ? 'w-full' : 'w-0'
                  }`}
                />
              </a>
            </li>
          ))}
        </ol>
        <div className="sticky top-28 self-start">
          <div className="relative aspect-[4/5] max-h-[64vh] overflow-hidden rounded-t-[999px] ring-1 ring-hue-300/25 shadow-[0_40px_80px_-30px_color-mix(in_srgb,_var(--color-ink-950)_95%,_transparent)]">
            <AnimatePresence initial={false}>
              <motion.img
                key={p.id}
                src={p.photo}
                alt={`${p.title} mood`}
                initial={{ opacity: 0, scale: 1.12 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,color-mix(in_srgb,_var(--color-ink-950)_85%,_transparent))]" />
            <p className="absolute bottom-5 left-6 right-6 text-[13px] leading-relaxed text-paper">{p.description}</p>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <Chips items={p.tech} />
            <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-sm text-paper underline decoration-hue-300/50 underline-offset-4 hover:decoration-paper">
              Visit site <FiArrowUpRight />
            </a>
          </div>
        </div>
      </div>

      {/* phones + tablets: arched cards */}
      <div className="grid gap-10 sm:grid-cols-2 lg:hidden">
        {WEB.map((w, i) => (
          <motion.a
            key={w.id}
            href={w.live}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] ring-1 ring-hue-300/25">
              <img src={w.photo} alt={`${w.title} mood`} width="1024" height="1024" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-active:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,color-mix(in_srgb,_var(--color-ink-950)_80%,_transparent))]" />
              <span className="absolute bottom-4 left-5 font-mono text-xs text-hue-300">{pad2(i + 1)}</span>
              <span className="absolute bottom-3 right-4 grid h-10 w-10 place-items-center rounded-full bg-paper text-ink">
                <FiArrowUpRight />
              </span>
            </div>
            <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-hue-300">{w.category}</p>
            <h3 className="mt-1 font-display text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-paper">{w.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-mist">{w.description}</p>
            <div className="mt-4">
              <Chips items={w.tech} />
            </div>
          </motion.a>
        ))}
      </div>
    </>
  )
}

/* ─── Apps: live previews in tilting windows ────────────────── */
function AppPanel({ app, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 16 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 16 })
  const Mock = app.id === 'flocus' ? FocusMock : TypeMock

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
    >
      <div className="[perspective:1400px]" onPointerMove={onMove} onPointerLeave={reset}>
        <motion.div
          style={{ rotateX: rx, rotateY: ry }}
          className="overflow-hidden rounded-2xl bg-ink-950 ring-1 ring-hue-300/20 shadow-[0_50px_90px_-40px_color-mix(in_srgb,_var(--color-ink-950)_100%,_transparent),0_0_0_1px_color-mix(in_srgb,_var(--hue-300)_6%,_transparent)]"
        >
          <div className="flex items-center gap-1.5 border-b border-hue-300/10 bg-ink-900 px-4 py-2.5">
            {['var(--hue-300)', 'var(--hue-400)', 'var(--hue-500)'].map((c) => (
              <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="mx-auto rounded-md bg-ink-950/70 px-3 py-0.5 font-mono text-[11px] text-hue-300">{app.title.toLowerCase()} · rebuild</span>
            <span className="w-[42px]" />
          </div>
          <div className="aspect-[16/10]">
            <Mock active={inView && !reduce} />
          </div>
        </motion.div>
      </div>
      <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-[2.2rem] font-semibold leading-none tracking-[-0.03em] text-paper">{app.title}</h3>
        <span className="chip uppercase tracking-[0.14em] text-hue-300">Rebuild</span>
        <span className="text-[13px] text-haze">{app.kind}</span>
      </div>
      <p className="mt-3 max-w-xl text-body text-mist">{app.desc}</p>
      <ul className="mt-4 grid gap-1.5 text-[14px] text-paper sm:grid-cols-3 sm:gap-3">
        {app.features.map((f) => (
          <li key={f} className="flex gap-2 sm:block">
            <span className="text-hue-400 sm:block">✦</span> {f}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Chips items={app.tech} />
        <a href={app.original} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-haze underline decoration-hue-300/30 underline-offset-4 hover:text-paper">
          Original: {app.originalLabel} <FiArrowUpRight />
        </a>
      </div>
    </motion.article>
  )
}

function AppsRoom() {
  return (
    <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
      {APPS.map((a, i) => (
        <AppPanel key={a.id} app={a} index={i} />
      ))}
    </div>
  )
}

/* ─── Graphics: marks + hung posters ────────────────────────── */
function Lightbox({ item, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!item) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.data.name || item.data.title}
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-ink-950/85 p-5 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-4xl flex-col items-center gap-6 md:flex-row md:gap-10"
          >
            {item.kind === 'logo' ? (
              <div className="grid aspect-square w-full max-w-[420px] place-items-center rounded-3xl" style={{ background: item.data.bg }}>
                <LogoMark logo={item.data} className="w-[56%]" />
              </div>
            ) : (
              <Poster poster={item.data} className="h-auto max-h-[70vh] w-auto max-w-full rounded-sm shadow-[0_40px_80px_-30px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)]" />
            )}
            <div className="w-full max-w-sm text-paper">
              <p className="eyebrow text-hue-300">
                {item.kind === 'logo' ? `Concept identity · ${item.data.sector}` : `Original poster · ${item.data.kind}`}
              </p>
              <h3
                className={`mt-2 text-[2.4rem] leading-none ${
                  item.kind === 'logo' && item.data.word === 'display' ? 'font-display font-semibold tracking-[-0.03em]' : 'font-serif italic'
                }`}
              >
                {item.data.name || item.data.title}
              </h3>
              <p className="mt-4 text-body text-mist">{item.data.tagline || item.data.note}</p>
              {item.kind === 'logo' && (
                <div className="mt-6 flex gap-2">
                  {[item.data.bg, item.data.fg, item.data.accent].map((c) => (
                    <span key={c} className="flex items-center gap-2 rounded-full bg-paper/10 py-1 pl-1 pr-3 font-mono text-[12px] text-mist">
                      <span className="h-5 w-5 rounded-full ring-1 ring-paper/30" style={{ background: c }} />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -top-2 right-0 grid h-11 w-11 place-items-center rounded-full bg-paper text-ink md:-right-4 md:-top-4"
            >
              <FiX />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const TILTS = [-3, 2, -2, 3]

function GraphicsRoom() {
  const [open, setOpen] = useState(null)
  return (
    <>
      <div className="flex items-baseline justify-between border-b border-hue-300/15 pb-3">
        <h3 className="font-display text-xl font-semibold text-paper">Marks</h3>
        <p className="font-mono text-eyebrow uppercase tracking-[0.2em] text-hue-300">{pad2(LOGOS.length)} concept identities</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {LOGOS.map((l, i) => (
          <motion.button
            key={l.id}
            type="button"
            onClick={() => setOpen({ kind: 'logo', data: l })}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
            className="group relative aspect-[4/3.4] overflow-hidden rounded-2xl text-left shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--hue-300)_16%,_transparent)] outline-none ring-hue-300 focus-visible:ring-4 sm:aspect-[4/3]"
            style={{ background: l.bg }}
            aria-label={`${l.name}, ${l.sector}. Open`}
          >
            <Construction color={l.fg} className="absolute left-1/2 top-[44%] w-[52%] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-40" />
            <LogoMark logo={l} className="absolute left-1/2 top-[44%] w-[38%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 group-hover:rotate-[-4deg]" />
            <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-5 sm:bottom-4" style={{ color: l.fg }}>
              <span className={`text-[15px] leading-none sm:text-lg ${l.word === 'display' ? 'font-display font-semibold tracking-[-0.02em]' : 'font-serif italic'}`}>
                {l.name}
              </span>
              <span className="hidden text-[12px] opacity-85 sm:block">{l.sector}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-20 flex items-baseline justify-between border-b border-hue-300/15 pb-3">
        <h3 className="font-display text-xl font-semibold text-paper">Posters</h3>
        <p className="font-mono text-eyebrow uppercase tracking-[0.2em] text-hue-300">{pad2(POSTERS.length)} originals</p>
      </div>
      {/* the line they hang from */}
      <div className="relative -mx-5 mt-8 sm:mx-0">
        <svg aria-hidden="true" viewBox="0 0 1000 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full">
          <path d="M0 6Q500 44 1000 6" fill="none" stroke="var(--hue-300)" strokeOpacity="0.45" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div
          data-lenis-prevent-touch
          className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 pt-5 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-8 sm:overflow-visible lg:gap-12 sm:px-0"
        >
          {POSTERS.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setOpen({ kind: 'poster', data: p })}
              initial={{ opacity: 0, y: -30, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: TILTS[i] }}
              whileHover={{ rotate: 0, y: 10, scale: 1.04 }}
              whileFocus={{ rotate: 0, y: 10, scale: 1.04 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: i * 0.06 }}
              className="relative w-[68vw] max-w-[300px] shrink-0 snap-center origin-top pt-3 text-left outline-none sm:w-auto sm:max-w-none"
              aria-label={`${p.title}, ${p.kind}. Open`}
            >
              {/* clip */}
              <span className="absolute left-1/2 top-0 z-10 h-6 w-3.5 -translate-x-1/2 rounded-[3px] bg-[linear-gradient(180deg,var(--color-paper),var(--hue-400))] shadow-[0_3px_6px_color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)]" />
              <Poster poster={p} className="block w-full rounded-[3px] shadow-[0_30px_50px_-24px_color-mix(in_srgb,_var(--color-ink-950)_95%,_transparent)]" />
              <span className="mt-3 block text-[13px] text-paper">{p.title}</span>
              <span className="block text-[12px] text-haze">{p.kind}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <Lightbox item={open} onClose={() => setOpen(null)} />
    </>
  )
}

/* ─── Section ───────────────────────────────────────────────── */
const ROOM_VIEWS = { web: WebRoom, apps: AppsRoom, graphics: GraphicsRoom }

export default function Projects() {
  const reduce = useReducedMotion()
  const smooth = useSmoothScroll()
  const sectionRef = useRef(null)
  const [room, setRoom] = useState(null)
  const [opening, setOpening] = useState(null)
  const [origin, setOrigin] = useState('50% 60%')

  const toTop = () => {
    const el = sectionRef.current
    if (!el || el.getBoundingClientRect().top > 60) return
    if (smooth?.scrollTo) smooth.scrollTo(el, { offset: -72, duration: 0.9 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const openDoor = (key, el) => {
    const stage = el.closest('[data-foyer]').getBoundingClientRect()
    const r = el.getBoundingClientRect()
    setOrigin(`${r.left + r.width / 2 - stage.left}px ${r.top + r.height * 0.35 - stage.top}px`)
    setOpening(key)
    setTimeout(() => setRoom(key), reduce ? 0 : 750)
  }
  const back = () => {
    setOpening(null)
    setRoom(null)
    toTop()
  }
  const switchRoom = (key) => setRoom(key)

  useEffect(() => {
    if (room) toTop()
    refreshJourney() // the room's hue becomes the section hue: let the colour field follow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

  // Entering the conservatory: its light swells open from the doorway as the section rises.
  // Soft radial glows that scale and fade in (transform + opacity only, no hard edges against the sky).
  const { scrollYProgress: enter } = useScroll({ target: sectionRef, offset: ['start end', 'start 0.15'] })
  const glowScale = useTransform(enter, [0, 1], reduce ? [1, 1] : [0.55, 1])
  const glowOpacity = useTransform(enter, [0, 0.8], reduce ? [1, 1] : [0, 1])
  const drift = useParallax(sectionRef, 70)

  const active = ROOMS.find((r) => r.key === room)
  const View = active && ROOM_VIEWS[active.key]

  return (
    <section
      id="projects"
      aria-label="Selected work"
      data-hue={active ? active.hue : 'coral'}
      ref={sectionRef}
      className="relative overflow-clip text-paper"
    >
      {/* atmosphere: the room's light opening up behind the doors, drifting slower than the page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{ y: drift, scale: glowScale, opacity: glowOpacity, transformOrigin: '50% 45%' }}
        >
        <div className="absolute left-1/2 top-[30%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,_var(--hue-500)_32%,_transparent),transparent_65%)]" />
        <div className="absolute -right-[10%] bottom-0 h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,_var(--hue-400)_18%,_transparent),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(color-mix(in_srgb,_var(--hue-300)_100%,_transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,_var(--hue-300)_100%,_transparent)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_50%_40%,var(--color-ink-950),transparent_75%)]" />
        </motion.div>
      </div>

      <div data-stage className="container-page relative min-h-[100svh] pb-section pt-[max(6.5rem,var(--spacing-section))]">
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active.key}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <RoomShell room={active} onBack={back} onSwitch={switchRoom}>
                <View />
              </RoomShell>
            </motion.div>
          ) : (
            <motion.div
              key="foyer"
              data-foyer
              style={{ transformOrigin: origin }}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 2.6, filter: 'blur(6px)' }}
              transition={{ duration: 0.7, ease: MOTION.inOut }}
            >
              <Foyer opening={opening} onOpen={openDoor} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
