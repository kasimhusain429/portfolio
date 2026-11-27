/**
 * Skills — Chapter 3: "The Herbarium".
 *
 * Desktop: a navy specimen cabinet built in CSS 3D. The section pins while
 * you scroll; each drawer (Frontend, State & Data, Tools & craft) slides out
 * in turn and its specimen cards rise. Hovering a specimen lifts it upright
 * with a handwritten note; clicking turns it over to its field notes.
 * Smaller screens: drawer tabs + a grid of the same specimen cards.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { FAMILIES, LEVELS, SKILLS, skillsIn } from '../data/skills'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { LevelDots, Note, SpecimenBack, SpecimenFront } from './skills/SpecimenCard'
import { EASE as MOTION } from '../lib/motion'
import { useDevice } from '../hooks/useDevice'
import { useSectionScroll } from '../hooks/useSectionScroll'

const EASE = MOTION.out
const WIDE = '(min-width: 1100px) and (min-height: 640px)'

// cabinet geometry (px, before scaling): wide on large screens, compact on phones/tablets
function makeGeo(compact) {
  const W = compact ? 560 : 800
  const H = 150
  const GAP = 14
  return {
    compact,
    W,
    H,
    GAP,
    D: 440,
    DW: W - 20,
    TOTAL_H: 3 * H + 4 * GAP,
    CW: compact ? 132 : 120,
    CH: compact ? 184 : 172,
    WALL: 104,
  }
}
// tier layouts by row count: depth of each tier and riser height between tiers
const TIERS = {
  2: { z: [-80, -240], step: 100 },
  3: { z: [-60, -170, -280], step: 82 },
  4: { z: [-48, -138, -228, -318], step: 68 },
}

// scroll windows for each drawer (fractions of the pinned scroll)
const WINDOWS = [
  [-0.04, 0.33],
  [0.35, 0.66],
  [0.68, 1.2],
]
const ramp = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const openAt = (i, p) => {
  const [a, b] = WINDOWS[i]
  return ramp(p, a, a + 0.06) * (1 - ramp(p, b - 0.03, b + 0.03))
}

/* deterministic star dust */
const DUST = Array.from({ length: 70 }, (_, i) => {
  const r = (s) => {
    const x = Math.sin(i * 91.7 + s * 47.3) * 43758.5453
    return x - Math.floor(x)
  }
  return { x: r(1) * 100, y: r(2) * 100, s: 1 + r(3) * 2, o: 0.25 + r(4) * 0.6 }
})

function StarDust({ count = DUST.length }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {DUST.slice(0, count).map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-hue-300"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, opacity: d.o }}
        />
      ))}
    </div>
  )
}

/* ─── Field-notes panel (desktop, left column) ─────────────── */
function FieldNotes({ skill, family }) {
  const count = skillsIn(family).length
  const label = FAMILIES.find((f) => f.key === family)?.label
  return (
    <div className="relative min-h-[150px]" aria-live="polite">
      <AnimatePresence mode="wait">
        {skill ? (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="font-serif text-[2.1rem] italic leading-none text-paper">{skill.latin}</p>
            <p className="mt-2 font-display text-lg font-semibold text-hue-300">{skill.name}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-mist">
              <span className="flex items-center gap-2">
                <LevelDots level={skill.level} /> {LEVELS[skill.level].label}
              </span>
              <span>{FAMILIES.find((f) => f.key === skill.family)?.label}</span>
            </div>
            {skill.foundIn.length > 0 && (
              <p className="mt-3 text-sm text-haze">Found in {skill.foundIn.join(', ')}</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`idle-${family}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="font-serif text-[2.1rem] italic leading-none text-paper">{label}</p>
            <p className="mt-3 max-w-[32ch] text-haze">
              {count} specimens in this drawer. Hover one to read its label, click to turn it over.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── One specimen card in the cabinet ─────────────────────── */
function Card3D({ g, s, x, z, lift = 0, hovered, flipped, onEnter, onLeave, onActivate }) {
  const lean = 12
  const kb = useRef(false)
  return (
    <button
      type="button"
      aria-label={`${s.name}, ${LEVELS[s.level].label}${s.foundIn.length ? `, used in ${s.foundIn.join(', ')}` : ''
        }. Press to turn over.`}
      aria-pressed={flipped}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onLeave()}
      onFocus={(e) => {
        // keyboard focus selects; a pointer click's focus does not (the click handles it)
        if (!e.currentTarget.matches(':focus-visible')) return
        kb.current = true
        onEnter()
      }}
      onBlur={() => {
        if (!kb.current) return
        kb.current = false
        onLeave()
      }}
      onClick={onActivate}
      className="absolute left-0 top-0 cursor-pointer rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-hue-300"
      style={{
        width: g.CW,
        height: g.CH,
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 100%',
        transform: `translate3d(${x - g.CW / 2}px, ${g.H - g.CH - lift}px, ${z}px) rotateX(${lean}deg)`,
      }}
    >
      {/* the visual lifts; the button itself stays put so hover never flickers */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 100%',
          transform: hovered ? `translate3d(0,-22px,46px) rotateX(${-lean}deg) scale(1.08)` : 'none',
          transition: 'transform 650ms cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div
          className="absolute inset-0 rounded-[10px] shadow-[0_14px_22px_-10px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)]"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 750ms cubic-bezier(.16,1,.3,1)',
          }}
        >
          <SpecimenFront s={s} />
          <SpecimenBack s={s} />
        </div>
        {hovered && !flipped && <Note s={s} />}
      </div>
    </button>
  )
}

/* ─── A drawer: box + front plate + specimens ──────────────── */
function Drawer({ g, index, family, top, open, hovered, flipped, setHovered, onActivate, onPlate }) {
  const z = useTransform(open, (o) => o * g.D * 0.8)
  const rise = useTransform(open, (o) => (1 - o) * 40)
  // closed drawers keep their specimens hidden (visibility keeps the 3D context intact)
  const shown = useTransform(open, (o) => (o > 0.04 ? 'visible' : 'hidden'))
  const items = useMemo(() => skillsIn(family.key), [family.key])
  // card-catalogue rows: 2 rows (3 for the big Tools drawer), back rows stand on risers
  // wide cabinet: 2 tiers (3 for Tools); compact cabinet: 3 specimens per tier
  const rows = g.compact ? Math.min(4, Math.ceil(items.length / 3)) : items.length > 8 ? 3 : 2
  const perRow = Math.ceil(items.length / rows)
  const { z: rowZ, step } = TIERS[rows]
  const BASE = 72 // even the front tier sits on a low riser so its labels clear the drawer front
  const slots = items.map((s, i) => {
    const row = Math.floor(i / perRow)
    const n = Math.min(perRow, items.length - row * perRow)
    const k = i - row * perRow
    const span = g.DW - (g.compact ? 50 : 80)
    return { s, x: (g.DW - span) / 2 + (span / n) * (k + 0.5), z: rowZ[row], lift: BASE + row * step }
  })

  const face = { position: 'absolute', left: 0, top: 0 }
  return (
    <motion.div
      className="absolute"
      style={{ left: 10, top, width: g.DW, height: g.H, transformStyle: 'preserve-3d', z }}
    >
      {/* floor, walls, back */}
      <div
        style={{
          ...face,
          top: g.H,
          width: g.DW,
          height: g.D,
          transformOrigin: 'top',
          transform: 'rotateX(-90deg)',
          background: 'linear-gradient(180deg,var(--color-ink-900),var(--color-ink-950))',
        }}
      />
      <div
        style={{
          ...face,
          top: g.H - g.WALL,
          width: g.D,
          height: g.WALL,
          transformOrigin: 'left',
          transform: 'rotateY(90deg)',
          background: 'linear-gradient(90deg,var(--color-ink-800),var(--color-ink-900))',
        }}
      />
      <div
        style={{
          ...face,
          left: g.DW,
          top: g.H - g.WALL,
          width: g.D,
          height: g.WALL,
          transformOrigin: 'left',
          transform: 'rotateY(90deg)',
          background: 'linear-gradient(90deg,var(--color-ink-800),var(--color-ink-900))',
        }}
      />
      <div
        style={{
          ...face,
          top: g.H - g.WALL,
          width: g.DW,
          height: g.WALL,
          transform: `translateZ(${-g.D}px)`,
          background: 'var(--color-ink-900)',
        }}
      />

      {/* stepped risers so every tier stands clear of the one in front */}
      {rowZ.map((rz, r) => (
        <div
          key={`riser${r}`}
          style={{
            ...face,
            left: 30,
            top: g.H - (BASE + step * r),
            width: g.DW - 60,
            height: BASE + step * r,
            transform: `translateZ(${rz + 26}px)`,
            background: 'linear-gradient(180deg,var(--color-ink-700) 0%,var(--color-ink-800) 8%,var(--color-ink-800) 100%)',
            boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--hue-300) 45%, transparent)',
          }}
        />
      ))}

      {/* specimens rise as the drawer opens */}
      <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', y: rise, visibility: shown }}>
        {slots.map(({ s, x, z: cz, lift }) => (
          <Card3D
            key={s.id}
            g={g}
            s={s}
            x={x}
            z={cz}
            lift={lift}
            hovered={hovered === s.id}
            flipped={flipped.has(s.id)}
            onEnter={() => setHovered(s.id)}
            // compact: the large preview sits below the cabinet, so the selection stays
            // until another specimen is chosen (moving to the preview must not clear it)
            onLeave={() => !g.compact && setHovered((h) => (h === s.id ? null : h))}
            onActivate={() => onActivate(s.id)}
          />
        ))}
      </motion.div>

      {/* drawer front */}
      <div
        className="rounded-[5px]"
        style={{
          ...face,
          width: g.DW,
          height: g.H,
          transform: 'translateZ(1px)',
          background: 'linear-gradient(180deg,var(--color-ink-700) 0%,var(--color-ink-800) 40%,var(--color-ink-800) 100%)',
          boxShadow:
            'inset 0 1px 0 color-mix(in srgb, var(--hue-300) 35%, transparent), inset 0 -14px 24px color-mix(in srgb, var(--color-ink-950) 35%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--hue-300) 8%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={onPlate}
          className="absolute left-1/2 top-1/2 flex h-[38px] w-[220px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[5px] bg-[linear-gradient(180deg,var(--color-paper-2),var(--hue-300)_55%,var(--hue-300))] font-display text-[13px] font-semibold uppercase tracking-[0.22em] text-ink shadow-[0_3px_6px_color-mix(in_srgb,_var(--color-ink-950)_45%,_transparent),inset_0_1px_0_color-mix(in_srgb,_var(--color-paper-hi)_90%,_transparent),inset_0_-2px_0_color-mix(in_srgb,_var(--hue-500)_35%,_transparent)] outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-paper"
        >
          <span className="absolute left-2 h-1.5 w-1.5 rounded-full bg-hue-500/60 shadow-[inset_0_1px_1px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]" />
          {family.label}
          <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-hue-500/60 shadow-[inset_0_1px_1px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]" />
          <span className="sr-only">, open drawer {index + 1}</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ─── The carcass (body) of the cabinet ────────────────────── */
function Carcass({ g }) {
  const strip = 'var(--color-ink-800)'
  return (
    <>
      <div
        className="absolute left-0 top-0"
        style={{ width: g.W, height: g.TOTAL_H, transform: `translateZ(${-g.D}px)`, background: 'var(--color-ink-950)' }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width: g.W,
          height: g.D,
          transformOrigin: 'top',
          transform: 'rotateX(-90deg)',
          background: 'linear-gradient(0deg,var(--color-ink-800),var(--color-ink-700))',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--hue-300) 12%, transparent)',
        }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width: g.D,
          height: g.TOTAL_H,
          transformOrigin: 'left',
          transform: 'rotateY(90deg)',
          background: 'linear-gradient(90deg,var(--color-ink-800),var(--color-ink-900))',
        }}
      />
      <div
        className="absolute top-0"
        style={{
          left: g.W,
          width: g.D,
          height: g.TOTAL_H,
          transformOrigin: 'left',
          transform: 'rotateY(90deg)',
          background: 'linear-gradient(90deg,var(--color-ink-800),var(--color-ink-900))',
        }}
      />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`g${i}`}
          className="absolute left-0"
          style={{ top: i * (g.H + g.GAP), width: g.W, height: g.GAP, background: strip }}
        />
      ))}
      <div className="absolute left-0 top-0" style={{ width: 10, height: g.TOTAL_H, background: strip }} />
      <div className="absolute top-0" style={{ left: g.W - 10, width: 10, height: g.TOTAL_H, background: strip }} />
    </>
  )
}

/* ─── Large, readable copy of the selected specimen (compact layout) ─── */
function SpecimenPreview({ skill, flipped, onFlip, family }) {
  const label = FAMILIES.find((f) => f.key === family)?.label
  return (
      <div className="flex min-h-[126px] items-center gap-4 sm:min-h-[150px]" aria-live="polite">
        <AnimatePresence mode="wait">
          {skill ? (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex w-full items-center gap-4"
            >
              <button
                type="button"
                onClick={onFlip}
                aria-label={`Turn ${skill.name} over`}
                className="relative h-[150px] w-[108px] shrink-0 rounded-[10px] outline-none [perspective:800px] focus-visible:ring-2 focus-visible:ring-hue-300"
              >
                <div
                  className="absolute inset-0 shadow-[0_14px_24px_-12px_color-mix(in_srgb,_var(--color-ink-950)_90%,_transparent)]"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 700ms cubic-bezier(.16,1,.3,1)',
                  }}
                >
                  <SpecimenFront s={skill} />
                  <SpecimenBack s={skill} />
                </div>
              </button>
              <div className="min-w-0">
                <p className="font-serif text-[1.55rem] italic leading-none text-paper">{skill.latin}</p>
                <p className="mt-1.5 font-display text-base font-semibold text-hue-300">{skill.name}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-mist">
                  <LevelDots level={skill.level} /> {LEVELS[skill.level].label}
                </p>
                {skill.foundIn.length > 0 && (
                  <p className="mt-1.5 text-caption text-haze">Found in {skill.foundIn.join(', ')}</p>
                )}
                <p className="mt-2 text-caption text-haze">Tap the card to turn it over.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`idle-${family}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="font-serif text-[1.55rem] italic leading-none text-paper">{label}</p>
              <p className="mt-2 max-w-[34ch] text-sm text-haze">
                {skillsIn(family).length} specimens in this drawer. Tap one to lift it out and read its label.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )
}

      /* ─── The pinned 3D herbarium (wide + compact layouts) ─────── */
      function Herbarium3D({compact}) {
  const g = useMemo(() => makeGeo(compact), [compact])
      const sectionRef = useRef(null)
      const stageRef = useRef(null)
      const reduce = useReducedMotion()
      const smooth = useSmoothScroll()
      const small = useDevice()?.isSmallScreen ?? false
  const touch = useMemo(() => window.matchMedia('(hover: none)').matches, [])
      const [hovered, setHovered] = useState(null)
  const [flipped, setFlipped] = useState(() => new Set())
      const [active, setActive] = useState(0)
      const activeRef = useRef(0)
      const [scale, setScale] = useState(compact ? 0.5 : 1)

      const {progress: p, enter } = useSectionScroll(sectionRef)
      const opens = [
    useTransform(p, (v) => openAt(0, v)),
    useTransform(p, (v) => openAt(1, v)),
    useTransform(p, (v) => openAt(2, v)),
      ]

  useMotionValueEvent(p, 'change', (v) => {
    const o = [0, 1, 2].map((i) => openAt(i, v))
      const a = o.indexOf(Math.max(...o))
      if (a !== activeRef.current) {
        activeRef.current = a
      setActive(a)
      setHovered(null) // a new drawer: clear the selection
    }
  })

      // cabinet entrance, camera following the open drawer, gentle pointer parallax
      const enterRX = useTransform(enter, [0, 1], [reduce ? 0 : compact ? -6 : -14, 0])
      const enterY = useTransform(enter, [0, 1], [reduce ? 0 : compact ? 48 : 140, 0])
  const followY = useTransform(p, (v) => -(openAt(1, v) + openAt(2, v) * 2) * (g.H + g.GAP) * 0.95)
  const stageY = useTransform([enterY, followY], ([a, b]) => a + b)
      const px = useSpring(0, {stiffness: 60, damping: 18 })
      const py = useSpring(0, {stiffness: 60, damping: 18 })
      const baseRY = compact ? -26 : -34
  const rotY = useTransform(px, (v) => baseRY + v * 4)
  const rotX = useTransform([py, enterRX], ([v, e]) => -15 + v * -3 + e)

  useEffect(() => {
    const stage = stageRef.current
      if (!stage) return
    const ro = new ResizeObserver(() => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      setScale(compact ? Math.min(0.84, w / 680, h / 820) : Math.min(1.05, w / 900, h / 740))
    })
      ro.observe(stage)
    return () => ro.disconnect()
  }, [compact])

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return
      px.set((e.clientX / window.innerWidth - 0.5) * 2)
      py.set((e.clientY / window.innerHeight - 0.5) * 2)
  }

  const goToDrawer = (i) => {
    const el = sectionRef.current
      const [a, b] = WINDOWS[i]
      const mid = i === 0 ? 0.04 : i === 2 ? a + 0.12 : (a + b) / 2
      const vh = window.visualViewport?.height || window.innerHeight
      const travel = el.offsetHeight - vh
      const y = el.getBoundingClientRect().top + window.scrollY + travel * mid
      if (smooth?.scrollTo) smooth.scrollTo(y, {offset: 0 })
      else window.scrollTo({top: y, behavior: 'smooth' })
  }
  const toggleFlip = (id) =>
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  // wide + mouse: click turns the specimen over.
  // compact or touch: first tap lifts it out (large copy below), second tap turns it over
  const onActivate = (id) => {
    if (!compact && !touch) return toggleFlip(id)
      if (hovered !== id) setHovered(id)
      else toggleFlip(id)
  }

  const selected = SKILLS.find((s) => s.id === hovered) || null
      const offset = compact ? {x: 44, y: 86 } : {x: 70, y: 210 }

      const tabs = (
        <div
          role="group"
          aria-label="Drawers"
          className={`segmented ${compact ? 'mt-3 max-w-full flex-nowrap overflow-x-auto [scrollbar-width:none]' : 'mt-8'}`}
        >
          {FAMILIES.map((f, i) => (
            <button
              key={f.key}
              type="button"
              aria-current={active === i ? 'true' : undefined}
              onClick={() => goToDrawer(i)}
              className={`segment whitespace-nowrap font-medium ${compact ? '!min-h-8 !px-2.5 !text-[12px]' : ''}`}
            >
              {f.label} <span className="font-mono opacity-80">{skillsIn(f.key).length}</span>
            </button>
          ))}
        </div>
        )

        const cabinet = (
        <div ref={stageRef} className="relative h-full min-h-0 w-full">
          <div
            aria-hidden="true"
            className="absolute bottom-[10%] left-1/2 h-14 w-[60%] -translate-x-1/2 rounded-[50%] bg-ink-950/80 blur-2xl"
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: g.W,
              height: g.TOTAL_H,
              marginLeft: -g.W / 2,
              marginTop: -g.TOTAL_H / 2,
              transform: `translate(${Math.round(offset.x * scale)}px, ${Math.round(offset.y * scale)}px) scale(${scale})`,
            }}
          >
            <motion.div style={{ perspective: 1700, perspectiveOrigin: compact ? '50% 22%' : '45% 22%', y: stageY }}>
              <motion.div
                className="relative"
                style={{ width: g.W, height: g.TOTAL_H, transformStyle: 'preserve-3d', rotateX: rotX, rotateY: rotY }}
              >
                <Carcass g={g} />
                {FAMILIES.map((f, i) => (
                  <Drawer
                    key={f.key}
                    g={g}
                    index={i}
                    family={f}
                    top={g.GAP + i * (g.H + g.GAP)}
                    open={opens[i]}
                    hovered={hovered}
                    flipped={flipped}
                    setHovered={setHovered}
                    onActivate={onActivate}
                    onPlate={() => goToDrawer(i)}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
        )

        return (
        <section
          id="skills"
          data-hue="orchid"
          ref={sectionRef}
          aria-labelledby="skills-title"
          className={`relative ${compact ? 'h-[330svh]' : 'h-[360vh]'}`}
          onPointerMove={onMove}
        >
            <div className="sticky top-0 h-[100dvh] min-h-svh overflow-hidden">
              <StarDust count={small ? 32 : undefined} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[8%] top-[18%] h-[70vh] w-[60vw] bg-[radial-gradient(closest-side,color-mix(in_srgb,_var(--hue-500)_42%,_transparent),transparent)]"
              />

              {compact ? (
                  <div className="relative mx-auto flex h-full max-w-3xl flex-col px-5 pb-4 pt-16 sm:px-8 sm:pt-20 md:pt-24">
                    <div className="relative z-10">
                      <p className="eyebrow text-hue-300">03 — Skills</p>
                        <h2 id="skills-title" className="mt-2 font-display text-h2-pin font-semibold text-paper">
                          The herbarium
                        </h2>
                          <p className="mt-1.5 max-w-[38ch] text-body-sm text-mist">
                            Every tool I reach for, pressed, labelled and filed by family.
                          </p>
                          {tabs}
                        </div>
                          <div className="relative min-h-0 flex-1 overflow-hidden">{cabinet}</div>
                          <div className="relative z-10 border-t border-hue-300/20 pt-3 sm:pt-4">
                            <SpecimenPreview
                              skill={selected}
                              family={FAMILIES[active].key}
                              flipped={selected ? flipped.has(selected.id) : false}
                              onFlip={() => selected && toggleFlip(selected.id)}
                            />
                          </div>
                        </div>
                        ) : (
                        <div className="relative mx-auto grid h-full max-w-[1440px] grid-cols-[minmax(340px,33%)_minmax(0,1fr)] items-center gap-6 px-12 pt-20">
                          <div className="relative z-10">
                            <p className="eyebrow text-hue-300">03 — Skills</p>
                            <h2 id="skills-title" className="mt-5 font-display text-[clamp(2.8rem,1.4rem+2.6vw,4.75rem)] font-semibold leading-[0.93] tracking-[-0.035em] text-paper">
                              The herbarium
                            </h2>
                            <p className="mt-5 max-w-[34ch] text-lead text-mist">
                              Every tool I reach for, pressed, labelled and filed by family.
                            </p>
                            {tabs}
                            <div className="mt-10 border-t border-hue-300/20 pt-6">
                              <FieldNotes skill={selected} family={FAMILIES[active].key} />
                            </div>
                            <div className="mt-6 flex gap-5 text-caption text-haze">
                              {Object.entries(LEVELS).map(([k, l]) => (
                                <span key={k} className="flex items-center gap-1.5">
                                  <LevelDots level={k} /> {l.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          {cabinet}
                        </div>
        )}
                    </div>
                  </section>
                  )
}

                  export default function Skills() {
  // full cabinet when there is room; the compact cabinet (same 3D UI) on phones and tablets
  const [compact, setCompact] = useState(() => !window.matchMedia(WIDE).matches)
  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    const on = () => setCompact(!mq.matches)
                  mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
                  return <Herbarium3D key={compact ? 'compact' : 'wide'} compact={compact} />
}
