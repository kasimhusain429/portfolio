/**
 * journey.js: one rAF-throttled scroll reader shared by everything that
 * reacts to "where am I on the page".
 *
 *   nav state  (React, via useJourney): active section, scrolled, surface under the bar, …
 *              Replaced only when a field changes, so consumers re-render rarely.
 *   frame data (imperative, via subscribeFrame): per-hue weights for the colour
 *              hand-off and overall page progress, pushed every frame without React.
 *
 * Hue weights: around each boundary between sections the two hues cross-fade over
 * BLEND × viewport height, so colour flows from one section into the next.
 */
import { useSyncExternalStore } from 'react'
import { SECTION_HUES } from './palette'
import { isLightAt } from './surface'
import { smoothstep } from './motion'

const SPY_LINE = 140 // px from the top: the section under this line is "active"
const BLEND = 0.45

let nav = { active: 'home', scrolled: false, onLight: true, pastHero: false, inFooter: false, centreLight: true }
const navListeners = new Set()
const frameListeners = new Set()
const weights = { iris: 1, teal: 0, orchid: 0, coral: 0, marigold: 0 }
let progress = 0
let raf = 0
let started = false

function read() {
  raf = 0
  const vh = window.innerHeight
  const centre = vh / 2
  const band = vh * BLEND

  const rects = []
  for (const { id, hue } of SECTION_HUES) {
    const el = document.getElementById(id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    rects.push({ id, hue: el.dataset.hue || hue, top: r.top, bottom: r.bottom })
  }
  if (!rects.length) return

  // active section (same rule as the navbar scroll-spy)
  let active = rects[0].id
  for (const r of rects) if (r.top <= SPY_LINE) active = r.id

  // hue weights around the viewport centre
  for (const k in weights) weights[k] = 0
  let i = rects.findIndex((r) => centre < r.bottom)
  if (i === -1) i = rects.length - 1
  const cur = rects[i]
  if (centre - cur.top < cur.bottom - centre && i > 0) {
    const t = smoothstep((centre - (cur.top - band)) / (2 * band))
    weights[cur.hue] += t
    weights[rects[i - 1].hue] += 1 - t
  } else if (i < rects.length - 1) {
    const t = smoothstep((centre - (cur.bottom - band)) / (2 * band))
    weights[cur.hue] += 1 - t
    weights[rects[i + 1].hue] += t
  } else {
    weights[cur.hue] = 1
  }

  const max = document.documentElement.scrollHeight - vh
  progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0

  const home = document.getElementById('home')
  const footer = document.querySelector('footer')
  const next = {
    active,
    scrolled: window.scrollY > 40,
    onLight: isLightAt(40),
    centreLight: isLightAt(centre),
    pastHero: !!home && home.getBoundingClientRect().bottom < 80,
    inFooter: !!footer && footer.getBoundingClientRect().top < vh * 0.6,
  }
  if (Object.keys(next).some((k) => next[k] !== nav[k])) {
    nav = next
    navListeners.forEach((l) => l())
  }
  frameListeners.forEach((l) => l(weights, progress))
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(read)
}

function start() {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  schedule()
}

/** Ask for a fresh read, e.g. after a section changes its data-hue without scrolling. */
export const refreshJourney = () => schedule()

export function subscribeNav(listener) {
  start()
  navListeners.add(listener)
  return () => navListeners.delete(listener)
}
export const getNav = () => nav
export function useJourney() {
  return useSyncExternalStore(subscribeNav, getNav, getNav)
}

/** Imperative per-frame updates: listener(weights, progress). Called once immediately. */
export function subscribeFrame(listener) {
  start()
  frameListeners.add(listener)
  listener(weights, progress)
  schedule()
  return () => frameListeners.delete(listener)
}
