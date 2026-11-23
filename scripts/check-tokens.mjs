/**
 * check-tokens: keeps the colour system honest.
 *   1. src/lib/palette.js must match the --color-* hexes in src/styles/tokens.css
 *   2. No raw hex / rgb() colours in src/ outside those two files.
 *      Exempt a line deliberately with `token-exempt: reason` in a comment.
 * Run: npm run check:tokens
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const tokensPath = join(root, 'src', 'styles', 'tokens.css')
const palettePath = join(root, 'src', 'lib', 'palette.js')
const ALLOWED = new Set([tokensPath, palettePath].map((p) => p.split(sep).join('/')))

const problems = []

// 1. parity
const css = readFileSync(tokensPath, 'utf8')
const cssColors = {}
for (const m of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) cssColors[m[1]] = m[2].toLowerCase()
const { FLAT } = await import(pathToFileURL(palettePath).href)
for (const [name, hex] of Object.entries(FLAT)) {
  if (cssColors[name] !== hex.toLowerCase()) problems.push(`palette drift: ${name} is ${hex} in palette.js but ${cssColors[name] ?? 'missing'} in tokens.css`)
}
for (const name of Object.keys(cssColors)) {
  if (!['focus', 'success', 'danger'].includes(name) && !(name in FLAT)) problems.push(`palette drift: ${name} is in tokens.css but not palette.js`)
}

// 2. no stray colours
const COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])|\brgba?\(|\bhsla?\(/g
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(jsx?|css)$/.test(entry) && !ALLOWED.has(full.split(sep).join('/'))) scan(full)
  }
}
function scan(file) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (line.includes('token-exempt')) return
      // ignore url("data:image/svg+xml,...") payloads, they are encoded and tokenised separately
      const stripped = line.replace(/url\((["'])data:[^)]*\1\)/g, '')
      const hits = stripped.match(COLOR)
      if (hits) problems.push(`${relative(root, file)}:${i + 1} hard-coded colour ${[...new Set(hits)].join(', ')}`)
    })
}
walk(join(root, 'src'))

if (problems.length) {
  console.error(`check-tokens: ${problems.length} problem(s)\n` + problems.map((p) => '  ' + p).join('\n'))
  process.exit(1)
}
console.log('check-tokens: palette in sync, no hard-coded colours in src/')
