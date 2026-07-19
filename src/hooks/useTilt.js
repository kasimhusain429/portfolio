/**
 * useTilt — Consolidated mouse-tracking 3D tilt hook.
 *
 * Replaces the duplicate useTilt implementations in:
 *  - About.jsx, Skills.jsx, Contact.jsx, Testimonials.jsx, ProjectCard.jsx
 *
 * @param {number} strength  Max rotation in degrees (default 12)
 * @param {object} springCfg Spring config override
 * @returns {{ ref, rx, ry, rotateX, rotateY, glareX, glareY, onMove, onLeave }}
 */
import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

const DEFAULT_SPRING = { stiffness: 180, damping: 22, mass: 0.5 }

export default function useTilt(strength = 12, springCfg = DEFAULT_SPRING) {
  const ref = useRef(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  // Rotation values
  const rawRotateX = useTransform(mouseY, [0, 1], [strength, -strength])
  const rawRotateY = useTransform(mouseX, [0, 1], [-strength, strength])
  const rx = useSpring(rawRotateX, springCfg)
  const ry = useSpring(rawRotateY, springCfg)

  // Glare spotlight position (for glass/sheen effects)
  const glareX = useTransform(mouseX, [0, 1], ['0%', '100%'])
  const glareY = useTransform(mouseY, [0, 1], ['0%', '100%'])

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    mouseX.set((e.clientX - left) / width)
    mouseY.set((e.clientY - top) / height)
  }

  const onLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return {
    ref,
    rx,
    ry,
    rotateX: rx,
    rotateY: ry,
    glareX,
    glareY,
    onMove,
    onLeave,
  }
}
