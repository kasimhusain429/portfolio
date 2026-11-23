/**
 * palette.js: JS mirror of src/styles/tokens.css for places CSS variables
 * cannot reach (WebGL shaders, canvas, SVG art generated in JS, data files).
 * Keep in sync: `npm run check:tokens` compares both and fails on drift.
 */

export const ink = {
  950: '#0a0820',
  900: '#100d2e',
  800: '#1a1644',
  700: '#2a2468',
  base: '#18144f',
  soft: '#4b4783',
}

export const paper = { base: '#f8f4ee', hi: '#fdfbf8', 2: '#ede8fa' }

export const text = { mist: '#cfcbf2', haze: '#a9a4db' }

export const iris = { 300: '#c2b6ff', 400: '#9b8aff', 500: '#7357ff', 600: '#5b3ff0', 700: '#4329c9' }
export const orchid = { 300: '#f5b0f0', 400: '#ee86e4', 500: '#dc57d0', 600: '#b033a9', 700: '#8f2589' }
export const coral = { 300: '#ffbbae', 400: '#ff9482', 500: '#ff6f5b', 600: '#e8503f', 700: '#b93323' }
export const marigold = { 300: '#ffe79a', 400: '#ffd25a', 500: '#ffb927', 600: '#e89a0c', 700: '#945907' }
export const teal = { 300: '#9af0e3', 400: '#4fdcc8', 500: '#1bc4ae', 600: '#0e9c8d', 700: '#0a746b' }

export const HUES = { iris, orchid, coral, marigold, teal }

/** Dominant hue per section, in page order (also drives the scroll colour hand-off). */
export const SECTION_HUES = [
  { id: 'home', hue: 'iris' },
  { id: 'about', hue: 'teal' },
  { id: 'skills', hue: 'orchid' },
  { id: 'projects', hue: 'coral' },
  { id: 'experience', hue: 'marigold' },
  { id: 'contact', hue: 'iris' },
]

/** Flat map used by the parity check: token name -> hex. */
export const FLAT = {
  'ink-950': ink[950],
  'ink-900': ink[900],
  'ink-800': ink[800],
  'ink-700': ink[700],
  ink: ink.base,
  'ink-soft': ink.soft,
  paper: paper.base,
  'paper-hi': paper.hi,
  'paper-2': paper[2],
  mist: text.mist,
  haze: text.haze,
  ...Object.fromEntries(
    Object.entries(HUES).flatMap(([name, ramp]) => Object.entries(ramp).map(([stop, hex]) => [`${name}-${stop}`, hex])),
  ),
}

/** "#rrggbb" + alpha 0..1 -> "#rrggbbaa" (for canvas gradients and other places rgba() would be hard-coded). */
export const alpha = (hex, a) => hex + Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0')
