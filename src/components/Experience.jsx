/**
 * Experience — "Field Journal"
 *
 * A cloth-bound notebook on a dark desk under a lamp. Scrolling slips off the
 * elastic band, opens the cover and turns real 3D leaves; each spread is one
 * chapter, and its ink writes itself the first time you reach it.
 * Wide screens show the whole spread; phones keep the same book but the camera
 * pans page by page so the writing stays readable.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { ENTRIES, STAMPS } from '../data/experience'
import { easeInOutCubic } from '../lib/motion'
import { useDevice } from '../hooks/useDevice'
import { AlbumIntro, BackBoard, CoverFront, Endpaper, EntryLeft, EntryRight, PH, PW, Pocket, TitlePage } from './journal/Pages'
import { Postmark, StampBack, StampFront } from './journal/Stamps'

const WIDE = '(min-width: 900px) and (min-height: 560px)'
const BW = PW + 12 // board (cover) size
const BH = PH + 18
const ease = easeInOutCubic
const ramp = (v, a, b) => ease(Math.min(1, Math.max(0, (v - a) / (b - a))))

// scroll choreography (fractions of the pinned scroll)
const H2 = PW / 2
const PLAN = {
  wide: {
    band: [0.015, 0.04],
    leaves: [[0.04, 0.11], [0.18, 0.25], [0.32, 0.39], [0.46, 0.53], [0.6, 0.67]],
    flight: [0.72, 0.89],
    // camera centre (book px): closed → centred on the cover, open → centred on the spine
    cam: { at: [0, 0.04, 0.11, 1], x: [H2, H2, 0, 0] },
    // pages reached: 0 cover, 1 contents, 2–3 Elsner, 4–5 Cypherox, 6–7 Freelance, 8 appendix, 9 pocket
    levels: [[0.08, 1], [0.22, 3], [0.36, 5], [0.5, 7], [0.64, 9]],
    chapters: [['Cover', 0.005], ['Contents', 0.14], [ENTRIES[0].short, 0.28], [ENTRIES[1].short, 0.42], [ENTRIES[2].short, 0.56], ['Stamps', 0.95]],
    stamp: { w: 180, h: 226, cols: 3, gx: 40, gy: 34, k0: 0.5 },
    height: 'h-[760vh]',
  },
  compact: {
    band: [0.012, 0.03],
    leaves: [[0.03, 0.08], [0.14, 0.19], [0.33, 0.38], [0.52, 0.57], [0.71, 0.76]],
    flight: [0.85, 0.95],
    cam: {
      at: [0, 0.15, 0.2, 0.25, 0.28, 0.34, 0.39, 0.44, 0.47, 0.53, 0.58, 0.63, 0.66, 0.72, 0.77, 0.8, 0.83, 0.85, 0.93, 1],
      x: [H2, H2, -H2, -H2, H2, H2, -H2, -H2, H2, H2, -H2, -H2, H2, H2, -H2, -H2, H2, H2, 0, 0],
    },
    levels: [[0.06, 1], [0.19, 2], [0.27, 3], [0.38, 4], [0.46, 5], [0.57, 6], [0.65, 7], [0.76, 8], [0.82, 9]],
    chapters: [['Cover', 0.005], ['Index', 0.1], [ENTRIES[0].short, 0.22], [ENTRIES[1].short, 0.41], [ENTRIES[2].short, 0.6], ['Stamps', 0.97]],
    stamp: { w: 156, h: 196, cols: 2, gx: 18, gy: 18, k0: 0.56 },
    height: 'h-[1000svh]',
  },
}
const lerp = (a, b, t) => a + (b - a) * t
const POCKET = { x: 22, y: 262, w: PW - 44, h: PH - 284 }
const TILT_END = [-2, 1.5, -1, 2, -1.5, 1]
const MARKED = [0, 3, 5] // stamps that get a postmark

/* ─── A leaf: front + back, hinged on the spine ─────────────── */
function Leaf({ p, range, z, front, back, board = false }) {
  const rot = useTransform(p, (v) => -180 * ramp(v, range[0], range[1]))
  const transform = useTransform(rot, (r) => `rotateY(${r}deg) translateZ(${z}px)`)
  // the page darkens as it lifts and curls past vertical
  const shade = useTransform(rot, (r) => Math.sin((-r * Math.PI) / 180) * 0.42)
  return (
    <motion.div
      className="absolute left-0 origin-left [transform-style:preserve-3d]"
      style={{ transform, width: board ? BW : PW, height: board ? BH : PH, top: board ? -9 : 0 }}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {front}
        <motion.div
          aria-hidden="true"
          style={{ opacity: shade }}
          className="pointer-events-none absolute inset-0 rounded-r-[6px] bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent),color-mix(in_srgb,_var(--color-ink-950)_25%,_transparent)_55%,color-mix(in_srgb,_var(--color-paper)_10%,_transparent))]"
        />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {back}
        <motion.div
          aria-hidden="true"
          style={{ opacity: shade }}
          className="pointer-events-none absolute inset-0 rounded-l-[6px] bg-[linear-gradient(270deg,color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent),color-mix(in_srgb,_var(--color-ink-950)_25%,_transparent)_55%,color-mix(in_srgb,_var(--color-paper)_10%,_transparent))]"
        />
      </div>
    </motion.div>
  )
}

/* ─── Props on the desk ─────────────────────────────────────── */
function Pen() {
  return (
    <svg viewBox="0 0 40 420" className="h-[400px] w-[38px]" aria-hidden="true">
      <defs>
        <linearGradient id="penBody" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-ink-950)" />
          <stop offset="0.35" stopColor="var(--hue-700)" />
          <stop offset="0.5" stopColor="var(--hue-400)" />
          <stop offset="0.65" stopColor="var(--hue-700)" />
          <stop offset="1" stopColor="var(--color-ink-950)" />
        </linearGradient>
        <linearGradient id="penMetal" x1="0" x2="1">
          <stop offset="0" stopColor="var(--hue-400)" />
          <stop offset="0.45" stopColor="var(--color-paper)" />
          <stop offset="1" stopColor="var(--hue-400)" />
        </linearGradient>
      </defs>
      <path d="M20 412 13 368h14Z" fill="url(#penMetal)" />
      <path d="M20 410v-30" stroke="var(--color-ink-950)" strokeWidth="0.8" />
      <rect x="10" y="300" width="20" height="70" rx="5" fill="url(#penBody)" />
      <rect x="9" y="290" width="22" height="12" rx="2" fill="url(#penMetal)" />
      <rect x="8" y="20" width="24" height="272" rx="11" fill="url(#penBody)" />
      <rect x="26" y="34" width="4" height="120" rx="2" fill="url(#penMetal)" />
      <rect x="8" y="80" width="24" height="5" fill="url(#penMetal)" />
    </svg>
  )
}

/* ─── A stamp: flies from the pocket into the collection ───── */
function Stamp({ s, i, cT, cfg, grid, landed, flipped, hovered, onHover, onFlip }) {
  const { w, h, k0 } = cfg
  const d = i * 0.1
  const sx = PW / 2 + (i - 2.5) * 46
  const sy = 238 + [0, 10, 4, 12, 2, 8][i]
  const r0 = (i - 2.5) * 8
  const [gx, gy] = grid[i]
  const transform = useTransform(cT, (c) => {
    const t = ramp(c, d, d + 0.5)
    const arc = Math.sin(Math.PI * t)
    const x = lerp(sx, gx, t) + arc * (i % 2 ? 26 : -26)
    const y = lerp(sy, gy, t) - arc * 70
    const z = lerp(0.3 + i * 0.12, 40, t) + arc * 120
    return `translate3d(${x - w / 2}px, ${y - h / 2}px, ${z}px) rotateX(${-34 * arc}deg) rotateY(${18 * arc * (i % 2 ? 1 : -1)}deg) rotateZ(${lerp(r0, TILT_END[i], t)}deg) scale(${lerp(k0, 1, t)})`
  })
  const lifted = landed && hovered
  return (
    <motion.div
      className="absolute left-0 top-0 [transform-style:preserve-3d]"
      style={{ width: w, height: h, transform, pointerEvents: landed ? 'auto' : 'none' }}
    >
      <motion.button
        type="button"
        tabIndex={landed ? 0 : -1}
        aria-label={`${s.value}, ${s.label}. ${flipped ? 'Showing the back' : 'Turn over to read the back'}`}
        aria-pressed={flipped}
        onPointerEnter={(e) => e.pointerType === 'mouse' && onHover(s.id)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && onHover(null)}
        onFocus={() => onHover(s.id)}
        onBlur={() => onHover(null)}
        onClick={() => onFlip(s.id)}
        className="absolute inset-0 cursor-pointer outline-none [transform-style:preserve-3d] focus-visible:[&>div:first-child]:ring-4"
        initial={false}
        animate={{ z: lifted ? 34 : 0, scale: lifted ? 1.06 : 1, rotateY: flipped ? 180 : 0, rotateZ: lifted ? -TILT_END[i] : 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }}
      >
        <StampFront s={s} w={w} h={h} n={i + 1} />
        <StampBack s={s} w={w} h={h} n={i + 1} />
        {MARKED.includes(i) && (
          <div className="pointer-events-none absolute -right-[34%] top-[-8%] w-[82%] [backface-visibility:hidden] [transform:translateZ(1px)]">
            <Postmark on={landed} place={i === 3 ? 'LONDON' : 'AHMEDABAD'} delay={0.15 + MARKED.indexOf(i) * 0.22} />
          </div>
        )}
      </motion.button>
    </motion.div>
  )
}

/* ─── Section ───────────────────────────────────────────────── */
function Journal({ compact }) {
  const plan = compact ? PLAN.compact : PLAN.wide
  const cfg = plan.stamp
  const smooth = useSmoothScroll()
  const small = useDevice()?.isSmallScreen ?? false
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const { scrollYProgress: enter } = useScroll({ target: sectionRef, offset: ['start end', 'start start'] })

  // collection grid (book px, centred on the spine)
  const rows = Math.ceil(STAMPS.length / cfg.cols)
  const GW = cfg.cols * cfg.w + (cfg.cols - 1) * cfg.gx
  const GH = rows * cfg.h + (rows - 1) * cfg.gy
  const grid = STAMPS.map((_, i) => {
    const c = i % cfg.cols
    const r = Math.floor(i / cfg.cols)
    return [-GW / 2 + cfg.w / 2 + c * (cfg.w + cfg.gx), PH / 2 - GH / 2 + cfg.h / 2 + r * (cfg.h + cfg.gy)]
  })

  const scale = useMotionValue(1)
  const scaleC = useMotionValue(1)
  useEffect(() => {
    const el = stageRef.current
    const fit = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      scale.set(compact ? Math.min(1.1, (w - 24) / BW, (h - 150) / BH) : Math.min(1.15, (w - 140) / (2 * BW), (h - 260) / BH))
      scaleC.set(compact ? Math.min(1.1, (w - 28) / GW, (h - 250) / GH) : Math.min(1.2, (w - 140) / (GW + 40), (h - 300) / (GH + 20)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [compact, scale, scaleC, GW, GH])

  // phases
  const openT = useTransform(p, (v) => ramp(v, plan.leaves[0][0], plan.leaves[0][1]))
  const lastT = useTransform(p, (v) => ramp(v, plan.leaves[4][0], plan.leaves[4][1]))
  const cT = useTransform(p, (v) => ramp(v, plan.flight[0], plan.flight[1]))
  const sEff = useTransform([scale, scaleC, cT], ([a, b, c]) => lerp(a, b, c))

  // camera
  const camX = useTransform([p, sEff], ([v, s]) => {
    const { at, x } = plan.cam
    let i = 0
    while (i < at.length - 2 && v > at[i + 1]) i++
    const t = ramp(v, at[i], at[i + 1])
    return -(x[i] + (x[i + 1] - x[i]) * t) * s
  })
  const camY = useTransform([enter, cT], ([v, c]) => (1 - ease(v)) * 220 + c * (compact ? 14 : 0))
  const tiltX = useTransform([enter, openT, cT], ([e, o, c]) => ((compact ? 8 : 26) * (1 - ease(e)) + (compact ? 6 : 14) - o * (compact ? 2 : 5)) * (1 - c))
  const tiltZ = useTransform([enter, openT, cT], ([e, o, c]) => ((compact ? -2 : -7) * (1 - o) + 6 * (1 - ease(e))) * (1 - c))
  const transform = useTransform(
    [camX, camY, tiltX, tiltZ, sEff],
    ([x, y, rx, rz, s]) => `translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s})`,
  )
  const band = {
    x: useTransform(p, (v) => ramp(v, plan.band[0], plan.band[1]) * 70),
    opacity: useTransform(p, (v) => 1 - ramp(v, plan.band[0] + 0.01, plan.band[1])),
  }
  const shadowL = useTransform(openT, (o) => -BW * o)
  const shadowW = useTransform(openT, (o) => BW * (1 + o))
  const lamp = useTransform([openT, cT], ([o, c]) => 0.55 + o * 0.45 - c * 0.15)
  const dim = useTransform(cT, (c) => Math.min(1, c * 1.6) * 0.86)
  const edges = useTransform(lastT, (t) => 1 - t)
  const hint = useTransform(p, (v) => 1 - Math.min(1, v / 0.03))
  const journalHead = useTransform(cT, (c) => 1 - ramp(c, 0, 0.35))
  const albumHead = useTransform(cT, (c) => ramp(c, 0.55, 1))
  const albumHeadY = useTransform(albumHead, (a) => (1 - a) * 16)

  // reached pages, current chapter, landed stamps
  const [level, setLevel] = useState(0)
  const [chapter, setChapter] = useState(0)
  const [landed, setLanded] = useState(false)
  useMotionValueEvent(p, 'change', (v) => {
    let l = 0
    for (const [at, n] of plan.levels) if (v >= at) l = n
    setLevel((prev) => Math.max(prev, l))
    let c = 0
    plan.chapters.forEach(([, at], i) => {
      if (v >= at - 0.06) c = i
    })
    setChapter(c)
    setLanded(ramp(v, plan.flight[0], plan.flight[1]) > 0.985)
  })

  const [hovered, setHovered] = useState(null)
  const [flipped, setFlipped] = useState(() => new Set())
  const flip = (id) =>
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const goTo = (at) => {
    const el = sectionRef.current
    const y = el.getBoundingClientRect().top + window.scrollY + (el.offsetHeight - window.innerHeight) * at
    if (smooth?.scrollTo) smooth.scrollTo(y, { duration: 1.8 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  const [e1, e2, e3] = ENTRIES

  return (
    <section id="experience" data-hue="marigold" ref={sectionRef} aria-labelledby="experience-title" className={`relative ${plan.height}`}>
      <span id="achievements" className="absolute left-0 h-px w-px" style={{ top: `${plan.flight[1] * 100 - 4}%` }} aria-hidden="true" />
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden [perspective:2400px]">
        {/* desk + lamp; the top fades so the colour field from the room above carries into the lamplight */}
        <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,transparent,black_30%,black_82%,transparent)]">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_60%,var(--color-ink-800)_0%,var(--color-ink-950)_55%,var(--color-ink-950)_100%)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:repeating-linear-gradient(94deg,color-mix(in_srgb,_var(--hue-400)_18%,_transparent)_0_1px,transparent_1px_7px),repeating-linear-gradient(91deg,color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)_0_2px,transparent_2px_23px)]" />
          <motion.div
            style={{ opacity: lamp }}
            className="absolute left-1/2 top-[52%] h-[95vmin] w-[150vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,_var(--hue-300)_34%,_transparent),color-mix(in_srgb,_var(--hue-500)_14%,_transparent)_55%,transparent)]"
          />
          {Array.from({ length: small ? 6 : 14 }, (_, i) => (
            <span
              key={i}
              className="absolute h-[3px] w-[3px] rounded-full bg-hue-300"
              style={{
                left: `${18 + ((i * 47) % 64)}%`,
                top: `${12 + ((i * 31) % 70)}%`,
                animation: `mote ${7 + (i % 5)}s ${i * 0.7}s ease-in-out infinite`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,transparent_55%,color-mix(in_srgb,_var(--color-ink-950)_75%,_transparent))]" />
        </div>

        {/* headers: the journal hands over to the collection */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-[1440px] px-5 pt-24 sm:px-8 lg:px-12">
          <motion.div style={{ opacity: journalHead }} className="absolute inset-x-5 top-24 flex items-start justify-between sm:inset-x-8 lg:inset-x-12">
            <div>
              <p className="eyebrow text-hue-300">05 — Experience</p>
              <h2 id="experience-title" className="mt-3 font-serif text-h2-pin italic text-paper">The field journal</h2>
            </div>
            {!compact && (
              <p className="max-w-[260px] pt-1 text-right text-body-sm text-mist">
                Three chapters of growing as an engineer, kept the old-fashioned way.
              </p>
            )}
          </motion.div>
          <motion.div style={{ opacity: albumHead, y: albumHeadY }} className="absolute inset-x-5 top-24 flex items-start justify-between sm:inset-x-8 lg:inset-x-12">
            <div>
              <p className="eyebrow text-hue-300">06 — By the numbers{compact && ' · tap to turn'}</p>
              <h2 className={`mt-3 font-serif italic text-paper ${compact ? 'text-[1.85rem] leading-none' : 'text-h2-pin'}`}>
                Collected along the way
              </h2>
            </div>
            {!compact && (
              <p className="max-w-[280px] pt-1 text-right text-body-sm text-mist">
                The places my work has travelled and the numbers worth keeping. Turn a stamp over to read its story.
              </p>
            )}
          </motion.div>
        </div>

        {/* the book */}
        <div className={`absolute left-1/2 ${compact ? 'top-[55%]' : 'top-[55.5%]'} h-0 w-0 [transform-style:preserve-3d]`}>
          <motion.div style={{ transform }} className="absolute left-0 top-0 [transform-style:preserve-3d]" aria-label="Field journal">
            <div className="absolute left-0 [transform-style:preserve-3d]" style={{ top: -PH / 2, width: PW, height: PH }}>
              {/* shadow on the desk */}
              <motion.div
                aria-hidden="true"
                style={{ left: shadowL, width: shadowW, transform: 'translateZ(-8px)' }}
                className="absolute -bottom-[14px] -top-[2px] rounded-[14px] bg-[color-mix(in_srgb,_var(--color-ink-950)_75%,_transparent)] blur-[22px]"
              />
              {!compact && (
                <div className="absolute left-[calc(100%+120px)] top-[60px]" style={{ transform: 'translateZ(2px) rotate(16deg)' }}>
                  <div className="absolute left-[10px] top-[16px] h-[400px] w-[30px] rounded-full bg-[color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)] blur-[8px]" />
                  <Pen />
                </div>
              )}
              {/* back board, inside back cover and its pocket */}
              <div className="journal-cloth absolute left-0 rounded-r-[10px]" style={{ top: -9, width: BW, height: BH, transform: 'translateZ(-1px)' }} />
              <BackBoard />
              <motion.div
                aria-hidden="true"
                style={{ opacity: edges, transform: 'translateZ(0.1px)' }}
                className="pointer-events-none absolute inset-0 shadow-[1px_1px_0_var(--color-paper-2),2px_2px_0_var(--color-paper),3px_3px_0_var(--color-paper-2),4px_4px_0_var(--color-paper),5px_5px_0_var(--color-paper-2)]"
              />
              <span aria-hidden="true" className="absolute left-[8px] top-0 h-[calc(100%+46px)] w-[11px] bg-[linear-gradient(90deg,var(--hue-700),var(--hue-500)_45%,var(--hue-400)_60%,var(--hue-700))] [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-9px),0_100%)]" style={{ transform: 'translateZ(0.2px)' }} />
              <div className="absolute" style={{ left: POCKET.x, top: POCKET.y, width: POCKET.w, height: POCKET.h, transform: 'translateZ(1.2px)' }}>
                <Pocket />
              </div>

              {/* leaves, top of the stack last */}
              <Leaf p={p} range={plan.leaves[4]} z={3} front={<EntryRight e={e3} on={level >= 7} n={6} />} back={<AlbumIntro on={level >= 8} n={7} />} />
              <Leaf p={p} range={plan.leaves[3]} z={4} front={<EntryRight e={e2} on={level >= 5} n={4} />} back={<EntryLeft e={e3} on={level >= 6} n={5} />} />
              <Leaf p={p} range={plan.leaves[2]} z={5} front={<EntryRight e={e1} on={level >= 3} n={2} />} back={<EntryLeft e={e2} on={level >= 4} n={3} />} />
              <Leaf p={p} range={plan.leaves[1]} z={6} front={<TitlePage on={level >= 1} entries={ENTRIES} />} back={<EntryLeft e={e1} on={level >= 2} n={1} />} />
              <Leaf p={p} range={plan.leaves[0]} z={7} board front={<CoverFront bandStyle={band} />} back={<Endpaper />} />

              {/* the room dims as the stamps rise out of the pocket */}
              <motion.div
                aria-hidden="true"
                style={{ opacity: dim, transform: 'translateZ(14px)' }}
                className="pointer-events-none absolute left-[-2400px] top-[-2400px] h-[5000px] w-[5000px] bg-[radial-gradient(closest-side,color-mix(in_srgb,_var(--color-ink-950)_55%,_transparent),color-mix(in_srgb,_var(--color-ink-950)_97%,_transparent)_60%)]"
              />

              {/* stamps */}
              {STAMPS.map((s, i) => (
                <Stamp
                  key={s.id}
                  s={s}
                  i={i}
                  cT={cT}
                  cfg={cfg}
                  grid={grid}
                  landed={landed}
                  hovered={hovered === s.id}
                  flipped={flipped.has(s.id)}
                  onHover={setHovered}
                  onFlip={flip}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* chapters */}
        <nav aria-label="Journal chapters" className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-3 sm:bottom-8">
          <ol className="segmented flex-nowrap gap-0.5 sm:gap-1">
            {plan.chapters.map(([label, at], i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => goTo(at)}
                  aria-current={chapter === i ? 'step' : undefined}
                  className="segment max-sm:min-h-9 max-sm:px-2 max-sm:text-[12px]"
                >
                  {!compact && <span aria-hidden="true" className="font-serif italic opacity-70">{['·', 'i', 'I', 'II', 'III', '✦'][i]}</span>}
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <motion.p
          style={{ opacity: hint }}
          className={`pointer-events-none absolute inset-x-0 z-10 text-center font-mono text-eyebrow uppercase tracking-[0.24em] text-hue-300 ${compact ? 'bottom-[72px]' : 'bottom-[84px]'}`}
        >
          Scroll to open the journal
        </motion.p>
        {!compact && (
          <p
            className={`pointer-events-none absolute inset-x-0 bottom-[80px] z-10 text-center font-mono text-eyebrow uppercase tracking-[0.24em] text-hue-300 transition-opacity duration-700 ${landed ? 'opacity-100' : 'opacity-0'}`}
          >
            Hover a stamp · click to turn it over
          </p>
        )}
      </div>
    </section>
  )
}

export default function Experience() {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && !window.matchMedia(WIDE).matches)
  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    const on = () => setCompact(!mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return <Journal key={compact ? 'compact' : 'wide'} compact={compact} />
}
