/**
 * Small animated visuals for the four root cards (pearl paper cards).
 * Each takes `on` (the card is revealed or hovered) and settles into its
 * story state.
 */
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE as MOTION } from '../../lib/motion'

const EASE = MOTION.out

/** Craft — a design frame becomes components. */
export function CraftVisual({ on }) {
  const lines = [
    [
      ['<', 'p'],
      ['Hero', 'c'],
      [' />', 'p'],
    ],
    [
      ['<', 'p'],
      ['Work', 'c'],
      [' grid', 'w'],
      [' />', 'p'],
    ],
    [
      ['<', 'p'],
      ['Contact', 'c'],
      [' />', 'p'],
    ],
  ]
  const tone = { p: 'text-hue-300', c: 'text-paper', w: 'text-hue-300' }
  return (
    <div className="flex h-full items-center gap-3">
      <div className="flex h-full w-[30%] flex-col justify-center gap-1.5 rounded-xl border border-hue-500/25 bg-paper p-2.5 shadow-[0_6px_14px_-10px_color-mix(in_srgb,_var(--color-ink)_50%,_transparent)]">
        <span className="h-2 w-[70%] rounded-full bg-ink-900/70" />
        <span className="h-5 w-full rounded-md bg-[linear-gradient(135deg,var(--hue-300),var(--hue-500))]" />
        <span className="h-2 w-[45%] rounded-full bg-hue-500/40" />
      </div>
      <div className="relative h-px flex-1 bg-hue-500/20">
        <motion.span
          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--hue-500),var(--color-ink))]"
          initial={false}
          animate={{ width: on ? '100%' : '0%' }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <motion.span
          className="absolute -right-0.5 -top-[3px] h-[7px] w-[7px] rotate-45 border-r border-t border-ink"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{ delay: on ? 0.6 : 0 }}
        />
      </div>
      <div className="flex h-full w-[54%] flex-col justify-center gap-1 rounded-xl bg-[linear-gradient(160deg,var(--color-ink-800),var(--color-ink))] px-2.5 font-mono text-[11px] leading-none shadow-[0_8px_18px_-10px_color-mix(in_srgb,_var(--color-ink)_80%,_transparent)] sm:px-3 sm:text-[12px]">
        {lines.map((tokens, i) => (
          <motion.div
            key={i}
            className="overflow-hidden whitespace-nowrap py-[3px]"
            initial={false}
            animate={{ clipPath: on ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
            transition={{ duration: 0.6, delay: on ? 0.55 + i * 0.14 : 0, ease: EASE }}
          >
            {tokens.map(([t, k], j) => (
              <span key={j} className={tone[k]}>
                {t}
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/** Impact — the same dashboard, 30% faster. */
export function ImpactVisual({ on }) {
  return (
    <div className="flex h-full items-center gap-4">
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <div>
          <div className="mb-1 flex justify-between text-[12px] text-ink-soft">
            <span>Before</span>
            <span>100%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-900/15" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[12px] font-medium text-hue-700">
            <span>After</span>
            <span>70%</span>
          </div>
          <div className="h-2 rounded-full bg-hue-500/10">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-ink),var(--hue-500),var(--hue-400))] shadow-[0_4px_12px_-2px_color-mix(in_srgb,_var(--hue-500)_60%,_transparent)]"
              initial={false}
              animate={{ width: on ? '70%' : '100%' }}
              transition={{ duration: 1.2, delay: on ? 0.3 : 0, ease: EASE }}
            />
          </div>
        </div>
      </div>
      <motion.p
        className="bg-[linear-gradient(135deg,var(--color-ink),var(--hue-500))] bg-clip-text font-display text-[2.1rem] font-semibold leading-none tracking-[-0.03em] text-transparent"
        initial={false}
        animate={{ opacity: on ? 1 : 0.25, y: on ? 0 : 6 }}
        transition={{ duration: 0.6, delay: on ? 0.9 : 0, ease: EASE }}
      >
        −30%
      </motion.p>
    </div>
  )
}

/** Way of working — the sprint loop keeps turning. */
export function AgileVisual({ on }) {
  const steps = ['Plan', 'Build', 'Review', 'Ship']
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (!on || reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % steps.length), 1100)
    return () => clearInterval(id)
  }, [on, reduce, steps.length])
  return (
    <div className="relative flex h-full items-center justify-between gap-2">
      <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-hue-500/30" />
      {steps.map((s, k) => {
        const current = i === k && on
        return (
          <div
            key={s}
            className={`relative z-10 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-300 sm:px-3 sm:text-[13px] ${
              current ? 'text-paper' : 'bg-paper text-ink-soft ring-1 ring-inset ring-hue-500/25'
            }`}
          >
            {current && (
              <motion.span
                layoutId="sprint-pill"
                className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,var(--hue-500),var(--color-ink))] shadow-[0_6px_16px_-6px_color-mix(in_srgb,_var(--color-ink)_70%,_transparent)]"
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
            )}
            <span className="relative">{s}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Obsession — blocks snap onto an 8pt rhythm. */
export function RhythmVisual({ on }) {
  const blocks = [
    { x: '6%', w: '34%', h: 16, y: 8, off: 5, tone: 'bg-ink-900/80' },
    { x: '6%', w: '58%', h: 8, y: 32, off: -6, tone: 'bg-hue-500/55' },
    { x: '6%', w: '46%', h: 8, y: 48, off: 4, tone: 'bg-hue-500/30' },
    { x: '70%', w: '24%', h: 48, y: 8, off: -5, tone: 'bg-[linear-gradient(160deg,var(--hue-300),var(--hue-500))]' },
  ]
  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[repeating-linear-gradient(180deg,color-mix(in_srgb,_var(--hue-500)_16%,_transparent)_0_1px,transparent_1px_8px)]">
      {blocks.map((b, k) => (
        <motion.span
          key={k}
          className={`absolute rounded-[4px] ${b.tone}`}
          style={{ left: b.x, width: b.w, height: b.h, top: b.y }}
          initial={false}
          animate={{ y: on ? 0 : b.off, x: on ? 0 : b.off * 1.5, opacity: on ? 1 : 0.6 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: on ? 0.25 + k * 0.08 : 0 }}
        />
      ))}
      <span className="absolute bottom-1.5 right-2 font-mono text-[11px] text-hue-700">8pt</span>
    </div>
  )
}
