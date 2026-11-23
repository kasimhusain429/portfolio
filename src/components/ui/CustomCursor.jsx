/**
 * CustomCursor — a precise dot with a trailing ring, in the Bloom palette.
 *
 * - Navy on the pearl hero, pearl on the navy sections that follow.
 * - Grows softly over links and buttons.
 * - Becomes a "View" lens over a project petal (read from bloomStore,
 *   since petals live in WebGL and have no DOM element to hover).
 * - Never rendered on touch devices; native cursor stays for text inputs.
 */
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useDevice } from '../../hooks/useDevice'
import { useBloom } from '../../lib/bloomStore'
import { isLightAt } from '../../lib/surface'

const RING_SPRING = { stiffness: 380, damping: 32, mass: 0.6 }

export default function CustomCursor() {
  const device = useDevice()
  const petal = useBloom((s) => !!s.hovered)
  const [mode, setMode] = useState('default') // default | link | text
  const [visible, setVisible] = useState(false)
  const [onLight, setOnLight] = useState(true)
  const [pressed, setPressed] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, RING_SPRING)
  const ry = useSpring(y, RING_SPRING)

  const enabled = device && !device.isTouch && !device.isMobile

  useEffect(() => {
    if (!enabled) return
    let lastY = -1
    let raf = 0
    // reading the surface under the pointer touches layout: at most once per frame
    const readSurface = () => {
      raf = 0
      if (lastY >= 0) setOnLight(isLightAt(lastY))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(readSurface)
    }
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      lastY = e.clientY
      setVisible(true)
      queue()
    }
    const onOver = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('input, textarea, [contenteditable="true"]')) setMode('text')
      else if (t.closest('a, button, [role="button"], label, select')) setMode('link')
      else setMode('default')
    }
    const onScroll = queue
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const ink = onLight ? 'var(--color-ink)' : 'var(--color-paper)'
  const view = petal
  const ringSize = view ? 76 : mode === 'link' ? 46 : 30
  const hidden = !visible || mode === 'text'

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] grid place-items-center rounded-full"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: hidden ? 0 : 1,
          scale: pressed ? 0.86 : 1,
          backgroundColor: view ? 'color-mix(in srgb, var(--color-ink) 92%, transparent)' : mode === 'link' ? 'color-mix(in srgb, var(--hue-500) 12%, transparent)' : 'color-mix(in srgb, var(--color-ink-950) 0%, transparent)',
          borderColor: view ? 'color-mix(in srgb, var(--color-ink) 0%, transparent)' : ink,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.6 }}
      >
        <span className="absolute inset-0 rounded-full border" style={{ borderColor: 'inherit', opacity: view ? 0 : 0.45 }} />
        <motion.span
          className="font-display text-[0.8rem] font-semibold text-paper"
          animate={{ opacity: view ? 1 : 0, scale: view ? 1 : 0.6 }}
          transition={{ duration: 0.25 }}
        >
          View
        </motion.span>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-[6px] w-[6px] rounded-full"
        style={{ x, y, translateX: '-50%', translateY: '-50%', backgroundColor: ink }}
        animate={{ opacity: hidden || view || mode === 'link' ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />

      <style>{`
        @media (pointer: fine) {
          html, body, a, button, [role="button"] { cursor: none; }
        }
      `}</style>
    </>
  )
}
