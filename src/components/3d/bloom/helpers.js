/**
 * Shared helpers for the hero bloom (HeroScene3D and its parts): easing
 * ranges, a seeded random, the damped spring that gives petals their organic
 * overshoot, and soft radial canvas textures for glows and shadows.
 */
import * as THREE from 'three'
import { clamp01, smoothstep } from '../../../lib/motion'

export { clamp01 }
export const smooth = smoothstep
export const range = (v, a, b) => clamp01((v - a) / (b - a))

/** deterministic 0..1 noise for index i and stream s */
export const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Damped spring toward target; state is { x, v } and is advanced in place. */
export function spring(state, target, dt, k = 70, c = 9) {
  state.v += (target - state.x) * k * dt
  state.v *= Math.exp(-c * dt)
  state.x += state.v * dt
  return state.x
}

/** Radial gradient texture; stops are [offset, '#rrggbbaa'] pairs built with palette.alpha(). */
export function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  stops.forEach(([o, col]) => g.addColorStop(o, col))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
