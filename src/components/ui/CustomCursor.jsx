/**
 * CustomCursor — Animated cursor with context-aware morphing.
 *
 * Shows a ring + dot cursor that:
 * - Follows the mouse with spring physics
 * - Enlarges on hover over interactive elements
 * - Shows "View" text on project cards
 * - Hidden on mobile/touch devices
 */
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useDevice } from '../../hooks/useDevice'

const SPRING_CONFIG = { stiffness: 300, damping: 28, mass: 0.5 }
const TRAIL_SPRING_CONFIG = { stiffness: 150, damping: 22, mass: 0.8 }

export default function CustomCursor() {
  const device = useDevice()
  const [hoverState, setHoverState] = useState('default') // 'default' | 'hover' | 'view' | 'link'
  const [visible, setVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const springX = useSpring(mouseX, SPRING_CONFIG)
  const springY = useSpring(mouseY, SPRING_CONFIG)
  // Trailing ring with weaker spring for depth
  const trailX = useSpring(mouseX, TRAIL_SPRING_CONFIG)
  const trailY = useSpring(mouseY, TRAIL_SPRING_CONFIG)

  useEffect(() => {
    if (device?.isTouch || device?.isMobile) return

    const onMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    // Detect interactive elements
    const onOver = (e) => {
      const target = e.target
      if (!target) return

      if (target.closest('[data-cursor="view"]')) {
        setHoverState('view')
      } else if (target.closest('[data-cursor="explore"]')) {
        setHoverState('explore')
      } else if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        setHoverState('hover')
      } else if (target.closest('[data-cursor="link"]')) {
        setHoverState('link')
      } else {
        setHoverState('default')
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerenter', onEnter)
    document.addEventListener('pointerover', onOver, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerenter', onEnter)
      document.removeEventListener('pointerover', onOver)
    }
  }, [device, mouseX, mouseY, visible])

  // Don't render on touch/mobile devices
  if (device?.isTouch || device?.isMobile) return null

  const isHover = hoverState === 'hover'
  const isView = hoverState === 'view'
  const isExplore = hoverState === 'explore'
  const isExpanded = isView || isExplore
  const size = isHover ? 48 : isExpanded ? 72 : 32

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          width: size,
          height: size,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: isExpanded ? 1 : isHover ? 1.2 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-full border transition-all duration-300"
          style={{
            borderColor: isExpanded
              ? 'rgba(0, 229, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.5)',
            backgroundColor: isExpanded
              ? 'rgba(0, 229, 255, 0.08)'
              : 'transparent',
          }}
        >
          {isView && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[10px] font-bold uppercase tracking-widest text-white"
            >
              View
            </motion.span>
          )}
          {isExplore && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[9px] font-bold uppercase tracking-widest text-white"
            >
              Explore
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Trailing ghost ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border border-white/15 mix-blend-difference"
        style={{
          x: trailX,
          y: trailY,
          width: 48,
          height: 48,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible && !isExpanded ? 0.4 : 0,
          scale: isHover ? 1.3 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible && !isExpanded ? 1 : 0,
          scale: isHover ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Hide default cursor globally */}
      <style>{`
        * { cursor: none !important; }
      `}</style>
    </>
  )
}
