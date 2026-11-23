/**
 * bloomStore — shared state between the DOM hero and the 3D flower.
 * ready:   the WebGL flower (and its in-scene name) is on screen
 * hovered: id of the project petal under the cursor, or null
 * bloomed: the visitor pressed and held to fully open the flower
 * domShown: the DOM headline was shown as a fallback (the 3D name then appears in place)
 * phase:   'loading' while the preloader is up, 'live' from the moment it opens
 */
import { useSyncExternalStore } from 'react'

let state = { ready: false, hovered: null, bloomed: false, domShown: false, phase: 'loading' }
const listeners = new Set()

export function setBloom(next) {
  const merged = { ...state, ...next }
  if (Object.keys(next).every((k) => state[k] === merged[k])) return
  state = merged
  listeners.forEach((l) => l())
}

export const getBloom = () => state

export function subscribeBloom(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useBloom(selector) {
  return useSyncExternalStore(subscribeBloom, () => selector(state), () => selector(state))
}

/**
 * Screen-space anchor (CSS px) written by the 3D scene every frame while a
 * petal is hovered: x/y = petal centre, cx/cy/r = flower centre and radius.
 * Mutable on purpose so the DOM preview card can follow it without re-renders.
 */
export const bloomAnchor = { x: 0, y: 0, cx: 0, cy: 0, r: 0 }
