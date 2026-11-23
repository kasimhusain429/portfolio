/**
 * Preloader — "Seed"
 *
 * Shows honest progress for what the hero actually needs (webfonts, the 3D
 * scene code, and the scene's first rendered frames), then opens like a bloom:
 * a feathered circular reveal grows out of the seed and hands over to the 3D
 * flower, which starts its own intro at that exact moment (phase → 'live').
 */
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion'
import { useDevice } from '../hooks/useDevice'
import { getBloom, setBloom, subscribeBloom } from '../lib/bloomStore'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { EASE as MOTION } from '../lib/motion'

const MIN_MS = 1300 // never flash
const MAX_MS = 9000 // never trap the visitor; the DOM headline takes over
const RING = 2 * Math.PI * 44

export default function Preloader() {
  const device = useDevice()
  const reduce = useReducedMotion()
  const smooth = useSmoothScroll()
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const goal = useRef(4)
  const radius = useMotionValue(0)
  const mask = useMotionTemplate`radial-gradient(circle at 50% var(--seed-y), transparent ${radius}vmax, var(--color-ink-950) calc(${radius}vmax + 16vmax))`

  // Start at the top and hold the page still while loading. The lock is
  // released the moment the preloader is gone (it stays mounted, rendering
  // nothing, so this must not wait for unmount).
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    if (gone) return
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [gone])
  useEffect(() => {
    if (gone) return
    smooth?.stop?.()
    return () => smooth?.start?.()
  }, [smooth, gone])

  useEffect(() => {
    if (!device) return
    const has3D = device.is3DEnabled
    const t0 = performance.now()
    const bump = (v) => {
      goal.current = Math.max(goal.current, v)
    }
    document.fonts?.ready.then(() => bump(has3D ? 30 : 100))
    if (has3D) import('./3d/HeroScene3D').then(() => bump(62))
    const check = () => getBloom().ready && bump(100)
    check()
    const unsub = subscribeBloom(check)

    let raf
    let shown = 0
    let last = t0
    let exiting = false
    const tick = () => {
      const now = performance.now()
      const elapsed = now - t0
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      // creep gently between real milestones so it never looks frozen
      const creep = goal.current < 100 ? Math.min(goal.current + 18, 94) : 100
      const target = elapsed > MAX_MS ? 100 : Math.max(goal.current, Math.min(creep, shown + 5 * dt))
      // time-based easing: same pace at 30, 60 or 120 fps (and in throttled tabs)
      shown += (target - shown) * (1 - Math.exp(-dt * (target === 100 ? 9 : 3.5)))
      if (target === 100 && 100 - shown < 0.6) shown = 100
      const value = Math.min(100, Math.round(shown))
      setCount(value)
      if (!exiting && value >= 100 && elapsed > MIN_MS) {
        exiting = true
        // give the GPU two more frames to settle shader compilation, then bloom open
        setTimeout(() => {
          setLeaving(true)
          setBloom({ phase: 'live' })
          if (reduce) {
            setGone(true)
            return
          }
          animate(radius, 170, { duration: 1.5, ease: MOTION.inOut, onComplete: () => setGone(true) })
        }, 220)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      unsub()
    }
  }, [device, reduce, radius])

  if (gone) return null

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={leaving ? 'Loaded' : `Loading, ${count} percent`}
      className="bloom-atmosphere fixed inset-0 z-[200] [--seed-y:50%] md:[--seed-y:53%]"
      style={{ WebkitMaskImage: mask, maskImage: mask }}
      animate={reduce && leaving ? { opacity: 0 } : undefined}
      transition={{ duration: 0.4 }}
    >
      {/* soft periwinkle air around the seed */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(40vmax 40vmax at 50% var(--seed-y), color-mix(in srgb, var(--hue-300) 45%, transparent), transparent 70%)' }}
      />

      {/* Seed + progress ring */}
      <div aria-hidden="true" className="absolute left-1/2 top-[var(--seed-y)] -translate-x-1/2 -translate-y-1/2">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="absolute -left-[60px] -top-[60px]"
          animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 1.35 : 1 }}
          transition={{ duration: 0.6, ease: MOTION.out }}
        >
          <circle cx="60" cy="60" r="44" fill="none" stroke="var(--hue-300)" strokeWidth="2" />
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="none"
            stroke="var(--hue-500)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - count / 100)}
            transform="rotate(-90 60 60)"
          />
        </motion.svg>
        <motion.div
          className="h-[18px] w-[18px] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-paper-hi),var(--color-iris-400)_30%,var(--color-orchid-500)_68%,var(--color-iris-700)_96%)] shadow-[0_0_22px_6px_color-mix(in_srgb,_var(--color-orchid-500)_45%,_transparent),0_0_80px_28px_color-mix(in_srgb,_var(--color-iris-300)_65%,_transparent)]"
          animate={leaving ? { scale: 3.2, opacity: 0 } : reduce ? undefined : { scale: [1, 1.22, 1] }}
          transition={leaving ? { duration: 0.9, ease: MOTION.out } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Corners */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.35 }}
        className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-6 sm:px-8 md:px-12 md:pb-10"
      >
        <div className="leading-snug">
          <p className="font-display text-base font-semibold text-ink">Kasim Husain</p>
          <p className="text-sm text-ink-soft">Frontend engineer</p>
        </div>
        <p className="font-display text-[clamp(3.25rem,9vw,6.5rem)] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
          {count}
          <span className="ml-1 align-top text-[0.32em] font-medium text-hue-700">%</span>
        </p>
      </motion.div>
    </motion.div>
  )
}
