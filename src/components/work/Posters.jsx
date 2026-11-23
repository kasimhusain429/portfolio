/**
 * Original posters (SVG, 300×420): Swiss grids, type collage, grain.
 * Colours come from the shared palette so the prints sit in the same spectrum as the site.
 */
import { useId } from 'react'
import { coral, ink, iris, marigold, orchid, paper, teal } from '../../lib/palette'

const display = { fontFamily: 'var(--font-display)' }
const serif = { fontFamily: 'var(--font-serif)' }
const mono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" }

function Grain({ id, opacity = 0.09 }) {
  return (
    <>
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
      </filter>
      <rect width="300" height="420" filter={`url(#${id})`} opacity={opacity} />
    </>
  )
}

function Bloom({ uid }) {
  const fills = [iris[500], orchid[400], coral[400], marigold[400]]
  return (
    <>
      <rect width="300" height="420" fill={paper.base} />
      <g stroke={ink.base} strokeOpacity="0.12" strokeWidth="0.6">
        {[20, 100, 200, 280].map((x) => <path key={x} d={`M${x} 0v420`} />)}
        {[48, 300, 392].map((y) => <path key={y} d={`M0 ${y}h300`} />)}
      </g>
      <g style={{ mixBlendMode: 'multiply' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="150"
            cy="112"
            rx="30"
            ry="64"
            fill={fills[i % 4]}
            opacity="0.85"
            transform={`rotate(${i * 45} 150 176)`}
          />
        ))}
      </g>
      <circle cx="150" cy="176" r="15" fill={ink.base} />
      <circle cx="150" cy="176" r="5" fill={paper.base} />
      <text x="20" y="38" fontSize="8.5" fill={ink.base} style={mono} letterSpacing="1">FESTIVAL OF LIGHT</text>
      <text x="280" y="38" fontSize="8.5" fill={ink.base} style={mono} textAnchor="end">14—16.05.27</text>
      <text x="150" y="374" fontSize="78" fontWeight="600" fill={ink.base} style={display} letterSpacing="-3" textAnchor="middle" textLength="262" lengthAdjust="spacingAndGlyphs">BLOOM</text>
      <text x="20" y="408" fontSize="8" fill={ink.base} style={mono}>GLASSHOUSE GARDENS</text>
      <text x="280" y="408" fontSize="8" fill={coral[700]} style={mono} textAnchor="end">DUSK TILL LATE</text>
      <Grain id={`${uid}g`} />
    </>
  )
}

function TypeNight({ uid }) {
  return (
    <>
      <rect width="300" height="420" fill={ink[900]} />
      <g stroke={iris[300]} strokeOpacity="0.16" strokeWidth="0.6">
        {[20, 150, 280].map((x) => <path key={x} d={`M${x} 0v420`} />)}
        {[140, 280].map((y) => <path key={y} d={`M0 ${y}h300`} />)}
      </g>
      <text x="-18" y="372" fontSize="330" fill={orchid[600]} style={serif}>Aa</text>
      <text x="20" y="74" fontSize="56" fontWeight="600" fill={paper.base} style={display} letterSpacing="-2">Type</text>
      <text x="22" y="124" fontSize="52" fontStyle="italic" fill={orchid[300]} style={serif}>Night</text>
      <circle cx="236" cy="86" r="34" fill={marigold[400]} />
      <text x="236" y="83" fontSize="9" fill={ink.base} style={mono} textAnchor="middle">NO.</text>
      <text x="236" y="101" fontSize="20" fontWeight="600" fill={ink.base} style={display} textAnchor="middle">04</text>
      <text x="164" y="300" fontSize="8" fill={paper.base} style={mono}>A CONFERENCE</text>
      <text x="164" y="312" fontSize="8" fill={paper.base} style={mono}>ON LETTERS</text>
      <text x="164" y="336" fontSize="8" fill={marigold[300]} style={mono}>08.03.2027 — 19:00</text>
      <text x="20" y="404" fontSize="8" fill={iris[300]} style={mono}>TALKS · WORKSHOPS · SPECIMENS</text>
      <Grain id={`${uid}g`} opacity={0.12} />
    </>
  )
}

function Ink({ uid }) {
  const dots = [
    [62, 178, 5], [238, 302, 7], [222, 150, 4], [84, 318, 3], [250, 226, 3], [100, 150, 2.5], [196, 340, 3],
  ]
  return (
    <>
      <defs>
        <linearGradient id={`${uid}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paper.base} />
          <stop offset="1" stopColor={paper[2]} />
        </linearGradient>
        <filter id={`${uid}d`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="34" />
        </filter>
        <filter id={`${uid}b`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="300" height="420" fill={`url(#${uid}p)`} />
      <circle cx="160" cy="240" r="96" fill={orchid[300]} opacity="0.55" filter={`url(#${uid}b)`} />
      <g filter={`url(#${uid}d)`}>
        <circle cx="150" cy="240" r="72" fill={ink.base} />
        <circle cx="200" cy="200" r="34" fill={iris[600]} />
        <circle cx="112" cy="282" r="30" fill={orchid[600]} />
        <circle cx="168" cy="300" r="18" fill={coral[500]} />
        {dots.map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={ink.base} />)}
      </g>
      <text x="20" y="76" fontSize="62" fill={ink.base} style={serif}>Ink &amp;</text>
      <text x="22" y="128" fontSize="62" fontStyle="italic" fill={orchid[600]} style={serif}>Paper</text>
      <text x="280" y="62" fontSize="8" fill={ink.base} style={mono} textAnchor="end">AN EXHIBITION</text>
      <text x="280" y="74" fontSize="8" fill={ink.base} style={mono} textAnchor="end">OF SLOW MARKS</text>
      <path d="M20 382h260" stroke={ink.base} strokeOpacity="0.3" strokeWidth="0.6" />
      <text x="20" y="402" fontSize="8" fill={ink.base} style={mono}>02 APR — 30 JUN</text>
      <text x="280" y="402" fontSize="8" fill={ink.base} style={mono} textAnchor="end">ROOM 3 · FREE ENTRY</text>
      <Grain id={`${uid}g`} opacity={0.1} />
    </>
  )
}

function Mornings({ uid }) {
  const rings = [
    [132, marigold[300]],
    [104, paper.base],
    [76, marigold[400]],
    [48, paper.base],
  ]
  return (
    <>
      <defs>
        <clipPath id={`${uid}s`}>
          <rect width="300" height="300" />
        </clipPath>
      </defs>
      <rect width="300" height="420" fill={iris[600]} />
      <g clipPath={`url(#${uid}s)`}>
        {rings.map(([r, c]) => <circle key={r} cx="150" cy="300" r={r} fill={c} />)}
      </g>
      <rect y="300" width="300" height="120" fill={ink[900]} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={150 - (120 - i * 18)} y={308 + i * 13} width={(120 - i * 18) * 2} height={5 - i * 0.6} rx="2" fill={teal[300]} opacity={0.75 - i * 0.1} />
      ))}
      <text x="20" y="74" fontSize="66" fontWeight="600" fill={paper.base} style={display} letterSpacing="-2.5">Slow</text>
      <text x="22" y="120" fontSize="50" fontStyle="italic" fill={marigold[300]} style={serif}>mornings</text>
      <text x="280" y="40" fontSize="8" fill={paper.base} style={mono} textAnchor="end">VOL. 03</text>
      <text x="20" y="404" fontSize="8" fill={teal[300]} style={mono}>A JAZZ SERIES</text>
      <text x="280" y="404" fontSize="8" fill={teal[300]} style={mono} textAnchor="end">SUNDAYS · 9 AM</text>
      <Grain id={`${uid}g`} opacity={0.12} />
    </>
  )
}

const ART = { bloom: Bloom, typenight: TypeNight, ink: Ink, mornings: Mornings }

export function Poster({ poster, className = '' }) {
  const uid = 'p' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const Art = ART[poster.id]
  return (
    <svg viewBox="0 0 300 420" className={className} role="img" aria-label={`${poster.title} poster`}>
      <Art uid={uid} />
    </svg>
  )
}
