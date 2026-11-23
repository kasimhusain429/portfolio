/**
 * Skills, pressed and labelled for the Herbarium.
 *
 * Levels: where an earlier self-rating existed, 90+ → Daily, 80–89 → Regular,
 * below 80 → Familiar. Skills without a rating carry a proposed level
 * (marked `proposed: true`) for Kasim to confirm.
 * `foundIn` lists only projects whose recorded tech stack includes the skill.
 */
import { projects } from './projects'

export const LEVELS = {
  daily: { label: 'Daily', dots: 3 },
  regular: { label: 'Regular', dots: 2 },
  familiar: { label: 'Familiar', dots: 1 },
}

export const FAMILIES = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'data', label: 'State & Data' },
  { key: 'tools', label: 'Tools & craft' },
]

const RAW = [
  // Frontend
  { name: 'React', latin: 'Reactus componentis', family: 'frontend', level: 'daily', match: 'React' },
  { name: 'Next.js', latin: 'Nextus frameworkus', family: 'frontend', level: 'regular', match: 'Next.js' },
  { name: 'TypeScript', latin: 'Typescriptus strictus', family: 'frontend', level: 'regular' },
  { name: 'JavaScript (ES6+)', latin: 'Javascriptum vulgare', family: 'frontend', level: 'daily' },
  { name: 'HTML5', latin: 'Hypertextus marcatus', family: 'frontend', level: 'daily', proposed: true },
  { name: 'CSS3', latin: 'Cascadia stylosa', family: 'frontend', level: 'daily', proposed: true },
  { name: 'Tailwind CSS', latin: 'Tailwindia utilitas', family: 'frontend', level: 'daily', match: 'Tailwind CSS' },
  { name: 'Framer Motion', latin: 'Framera animata', family: 'frontend', level: 'regular' },
  // State & Data
  { name: 'Redux', latin: 'Reduxia storea', family: 'data', level: 'regular' },
  { name: 'Context API', latin: 'Contextus providens', family: 'data', level: 'daily' },
  { name: 'React Hooks', latin: 'Hamulus reactivus', family: 'data', level: 'daily', proposed: true },
  { name: 'React Query', latin: 'Quaestio cacheata', family: 'data', level: 'regular' },
  { name: 'Axios', latin: 'Axiosa requestis', family: 'data', level: 'regular' },
  { name: 'REST APIs', latin: 'Restus endpointia', family: 'data', level: 'regular', match: 'REST APIs' },
  // Tools & craft
  { name: 'Git', latin: 'Gitium versionis', family: 'tools', level: 'daily' },
  { name: 'GitHub', latin: 'Gitium communis', family: 'tools', level: 'daily', proposed: true },
  { name: 'Vercel', latin: 'Vercelia deployens', family: 'tools', level: 'regular', proposed: true },
  { name: 'Vite', latin: 'Vitis rapida', family: 'tools', level: 'regular' },
  { name: 'Webpack', latin: 'Webpackia bundlata', family: 'tools', level: 'familiar', proposed: true },
  { name: 'Figma-to-Code', latin: 'Figma translata', family: 'tools', level: 'regular' },
  { name: 'Node.js', latin: 'Nodus servens', family: 'tools', level: 'familiar', match: 'Node.js' },
  { name: 'Responsive Design', latin: 'Fluida responsiva', family: 'tools', level: 'daily', proposed: true },
  { name: 'Accessibility', latin: 'Accessibilis omnium', family: 'tools', level: 'regular', proposed: true },
  { name: 'SEO', latin: 'Searchia optima', family: 'tools', level: 'regular', proposed: true },
  { name: 'Agile/Scrum', latin: 'Agilis sprintus', family: 'tools', level: 'daily', proposed: true },
]

const KINDS = ['sprig', 'bloom', 'fern', 'pod']

export const SKILLS = RAW.map((s, i) => {
  const foundIn = s.match ? projects.filter((p) => p.tech.includes(s.match)).map((p) => p.title) : []
  return {
    ...s,
    id: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    kind: KINDS[(i * 7 + s.name.length) % KINDS.length],
    seed: i + 1,
    foundIn,
  }
})

export const skillsIn = (family) => SKILLS.filter((s) => s.family === family)

/** "React — Daily — used in 4 projects" */
export function noteFor(s) {
  const lvl = LEVELS[s.level].label
  const n = s.foundIn.length
  return n ? `${s.name} — ${lvl} — used in ${n} project${n > 1 ? 's' : ''}` : `${s.name} — ${lvl}`
}
