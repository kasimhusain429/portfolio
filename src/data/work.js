/**
 * Work section content: three doors (Web, Apps, Graphics) and what is behind each.
 * Web projects come from projects.js; apps and graphics live here.
 */
import { projects } from './projects'
import { coral, ink, iris, marigold, orchid, paper, teal } from '../lib/palette'

// Each door carries its own hue; the CSS gradients read the shared tokens.
const leaf = (hue) =>
  `linear-gradient(165deg, var(--color-${hue}-400) 0%, var(--color-${hue}-600) 40%, var(--color-ink-800) 100%)`
const glow = (hue) =>
  `radial-gradient(80% 60% at 50% 100%, color-mix(in srgb, var(--color-${hue}-300) 95%, transparent), color-mix(in srgb, var(--color-${hue}-500) 55%, transparent) 45%, transparent 80%)`

export const ROOMS = [
  {
    key: 'web',
    label: 'Web',
    hue: 'coral',
    room: 'The Glasshouse',
    blurb: 'Production sites for real clients, carried from Figma to launch.',
    leaf: leaf('coral'),
    glow: glow('coral'),
  },
  {
    key: 'apps',
    label: 'Apps',
    hue: 'iris',
    room: 'The Workshop',
    blurb: 'Product interfaces I rebuilt from scratch to learn how great tools feel in the hand.',
    leaf: leaf('iris'),
    glow: glow('iris'),
  },
  {
    key: 'graphics',
    label: 'Graphics',
    hue: 'marigold',
    room: 'The Print Room',
    blurb: 'Concept identities and posters: original marks, type and colour studies.',
    leaf: leaf('marigold'),
    glow: glow('marigold'),
  },
]

export const WEB = projects.map((p) => ({
  ...p,
  photo: `/bloom/${p.image.split('/').pop().replace('.png', '.webp')}`,
}))

// Built by Kasim as UI rebuilds of products he admires; the originals are credited on the card.
export const APPS = [
  {
    id: 'flocus',
    title: 'Flocus',
    kind: 'Focus dashboard',
    original: 'https://flocus.com/',
    originalLabel: 'flocus.com',
    desc: 'A calm, full-screen focus space: live clock and greeting, a pomodoro timer, ambient sound and a short daily task list over a living backdrop.',
    features: ['Pomodoro timer with session ring', 'Ambient scenes and sound mixer', 'Daily tasks and greeting'],
    tech: ['React', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    id: 'monkeytype',
    title: 'Monkeytype',
    kind: 'Typing test',
    original: 'https://monkeytype.com/',
    originalLabel: 'monkeytype.com',
    desc: 'A minimalist typing test with a smooth caret, live WPM and accuracy, timed and word modes, and an end-of-run result card.',
    features: ['Smooth caret and per-letter states', 'Live WPM and accuracy', 'Time and word modes'],
    tech: ['React', 'JavaScript', 'Tailwind CSS'],
  },
]

// Self-initiated concept identities (original marks, not client work)
export const LOGOS = [
  {
    id: 'mothlight',
    name: 'Mothlight',
    sector: 'Candle studio',
    tagline: 'A moth drawn to its own flame: the wings fold around a candle body.',
    bg: ink[900],
    fg: marigold[300],
    accent: paper.base,
    word: 'serif',
  },
  {
    id: 'crescent',
    name: 'Crescent & Co.',
    sector: 'Bakery',
    tagline: 'A crescent moon scored like a croissant, for a bakery that opens before dawn.',
    bg: paper.base,
    fg: ink.base,
    accent: coral[500],
    word: 'display',
  },
  {
    id: 'vinea',
    name: 'Vinea',
    sector: 'Natural wine bar',
    tagline: 'A vine-wrapped initial: the V is the trellis, the vine is the season.',
    bg: teal[700],
    fg: paper.base,
    accent: marigold[400],
    word: 'serif',
  },
  {
    id: 'northpost',
    name: 'Northpost',
    sector: 'Courier service',
    tagline: 'A compass star with its north ray lit, always pointing the parcel home.',
    bg: iris[600],
    fg: paper.base,
    accent: marigold[400],
    word: 'display',
  },
  {
    id: 'halcyon',
    name: 'Halcyon',
    sector: 'Swim school',
    tagline: 'A kingfisher skimming calm water, the old name for still, safe days.',
    bg: iris[300],
    fg: ink.base,
    accent: coral[600],
    word: 'display',
  },
  {
    id: 'orbit',
    name: 'Orbit Records',
    sector: 'Independent label',
    tagline: 'A record caught in its own orbit, with one satellite: the next release.',
    bg: orchid[600],
    fg: paper.base,
    accent: marigold[300],
    word: 'display',
  },
]

export const POSTERS = [
  { id: 'bloom', title: 'Bloom', kind: 'Festival poster', note: 'Eight overlapping petals, Swiss grid, one loud word.' },
  { id: 'typenight', title: 'Type / Night', kind: 'Conference poster', note: 'A cropped serif “Aa” as architecture for a night of talks about letters.' },
  { id: 'ink', title: 'Ink & Paper', kind: 'Exhibition poster', note: 'A generative ink bloom, displaced with turbulence, on warm paper.' },
  { id: 'mornings', title: 'Slow Mornings', kind: 'Music series poster', note: 'A sun rising in rings over striped water, for Sunday morning jazz.' },
]

export const COUNTS = { web: WEB.length, apps: APPS.length, graphics: LOGOS.length + POSTERS.length }
