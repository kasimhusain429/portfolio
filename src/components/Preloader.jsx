/**
 * Preloader — "Digital Genesis" loading screen.
 *
 * A cinematic loading sequence with:
 * - Gradient orb pulsing
 * - Logo text assembly with character stagger
 * - Progress counter with liquid fill
 * - Dissolve exit into the hero section
 */
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

function useLoadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame
    let current = 0
    const target = 100
    const speed = 1.8 // base increment

    const tick = () => {
      // Simulate loading with easing (fast start, slow near end)
      const remaining = target - current
      const increment = Math.max(0.3, remaining * 0.04) * speed
      current = Math.min(target, current + increment)
      setProgress(Math.round(current))

      if (current < target) {
        frame = requestAnimationFrame(tick)
      }
    }

    // Small delay before starting
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick)
    }, 300)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [])

  return progress
}

export default function Preloader({ onComplete }) {
  const progress = useLoadingProgress()
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        setShow(false)
        setTimeout(() => onComplete?.(), 500)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [progress, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#050505' }}
          exit={{
            clipPath: 'circle(0% at 50% 50%)',
          }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Ambient background orbs */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <motion.div
              className="absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[20%] top-[30%] h-[30vh] w-[30vh] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Logo text assembly */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-baseline gap-0.5">
              {'Kasim'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="text-4xl font-black tracking-tight sm:text-5xl"
                  style={{
                    background: 'linear-gradient(135deg, #a5b4fc, #67e8f9, #c4b5fd)',
                    backgroundSize: '300% 300%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradient-shift 6s ease infinite',
                  }}
                  initial={{
                    opacity: 0,
                    y: 40,
                    filter: 'blur(12px)',
                    rotateX: 60,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    rotateX: 0,
                  }}
                  transition={{
                    delay: 0.4 + i * 0.08,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                className="text-4xl font-black tracking-tight text-slate-500 sm:text-5xl"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                .dev
              </motion.span>
            </div>

            {/* Tagline */}
            <motion.p
              className="mt-3 text-xs font-medium tracking-[0.3em] text-slate-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              FRONTEND ENGINEER
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="mt-8 h-[2px] w-48 overflow-hidden rounded-full bg-white/5"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>

            {/* Progress number */}
            <motion.div
              className="mt-3 font-mono text-xs tabular-nums text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {progress}%
            </motion.div>
          </motion.div>

          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
