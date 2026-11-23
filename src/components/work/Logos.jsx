/**
 * Original concept marks (SVG, 120×120). Each takes fg / accent / bg colours.
 */
import { useId } from 'react'

function Mothlight({ fg, accent }) {
  return (
    <>
      <path d="M60 58C44 28 17 25 15 44c-2 17 25 21 45 16Z" fill={fg} />
      <path d="M60 58c16-30 43-33 45-14 2 17-25 21-45 16Z" fill={fg} />
      <path d="M60 63c-15 4-30 17-24 29 6 9 20-7 24-25Z" fill={fg} opacity="0.62" />
      <path d="M60 63c15 4 30 17 24 29-6 9-20-7-24-25Z" fill={fg} opacity="0.62" />
      <circle cx="33" cy="45" r="5" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />
      <circle cx="87" cy="45" r="5" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />
      <path d="M60 30c7 12 8 24 0 58-8-34-7-46 0-58Z" fill={accent} />
    </>
  )
}

function Crescent({ fg, accent, bg }) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <>
      <mask id={id}>
        <rect width="120" height="120" fill="white" />
        <circle cx="76" cy="48" r="33" fill="black" />
      </mask>
      <circle cx="58" cy="62" r="40" fill={fg} mask={`url(#${id})`} />
      {[
        'M27 52q8 4 9 13',
        'M33 79q8-1 13 6',
        'M50 93q6-4 13-1',
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={bg} strokeWidth="4" strokeLinecap="round" />
      ))}
      <path d="M92 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={accent} />
    </>
  )
}

function Vinea({ fg, accent }) {
  return (
    <>
      <path d="M30 26 60 96 90 26" fill="none" stroke={fg} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M22 66c14-16 24 10 36-4s20-24 40-10"
        fill="none"
        stroke={accent}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M44 58c-2-9 4-15 12-15-1 9-6 15-12 15Z" fill={accent} />
      <path d="M86 48c6-6 14-5 18 1-7 5-14 5-18-1Z" fill={accent} />
      <g fill={fg}>
        <circle cx="94" cy="62" r="3.6" />
        <circle cx="101" cy="64" r="3.6" />
        <circle cx="97" cy="70" r="3.6" />
      </g>
    </>
  )
}

function Northpost({ fg, accent }) {
  return (
    <>
      <circle cx="60" cy="60" r="50" fill="none" stroke={fg} strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M60 12 68 52 108 60 68 68 60 108 52 68 12 60 52 52Z" fill={fg} />
      <path d="M60 12 68 52H52Z" fill={accent} />
      <circle cx="60" cy="60" r="7" fill={accent} />
    </>
  )
}

function Halcyon({ fg, accent, bg }) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <>
      <clipPath id={id}>
        <circle cx="60" cy="60" r="46" />
      </clipPath>
      <circle cx="60" cy="60" r="46" fill={fg} />
      <g clipPath={`url(#${id})`} fill="none" stroke={bg} strokeWidth="5" strokeLinecap="round">
        <path d="M6 76q9-7 18 0t18 0 18 0 18 0 18 0 18 0" />
        <path d="M6 90q9-7 18 0t18 0 18 0 18 0 18 0 18 0" />
        <path d="M6 104q9-7 18 0t18 0 18 0 18 0 18 0 18 0" />
      </g>
      <path d="M30 52q14-14 30-2 16-12 32 0-16-4-32 8-14-12-30-6Z" fill={accent} />
      <circle cx="60" cy="49" r="3" fill={bg} />
    </>
  )
}

function Orbit({ fg, accent, bg }) {
  return (
    <>
      <path d="M8 64a52 16 -18 0 1 104-8" fill="none" stroke={accent} strokeWidth="3" opacity="0.45" transform="rotate(-18 60 60)" />
      <circle cx="60" cy="60" r="34" fill={fg} />
      <circle cx="60" cy="60" r="26" fill="none" stroke={bg} strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="60" cy="60" r="19" fill="none" stroke={bg} strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="60" cy="60" r="11" fill={accent} />
      <circle cx="60" cy="60" r="2.5" fill={bg} />
      <path d="M112 56a52 16 -18 0 1-104 8" fill="none" stroke={accent} strokeWidth="3" transform="rotate(-18 60 60)" />
      <circle cx="104" cy="40" r="5" fill={accent} />
    </>
  )
}

const MARKS = { mothlight: Mothlight, crescent: Crescent, vinea: Vinea, northpost: Northpost, halcyon: Halcyon, orbit: Orbit }

export function LogoMark({ logo, className = '' }) {
  const Mark = MARKS[logo.id]
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={`${logo.name} logo`}>
      <Mark fg={logo.fg} accent={logo.accent} bg={logo.bg} />
    </svg>
  )
}

/** construction lines shown on hover */
export function Construction({ color, className = '' }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none" stroke={color} strokeWidth="0.5">
      <circle cx="60" cy="60" r="50" strokeDasharray="1.5 2.5" />
      <circle cx="60" cy="60" r="34" />
      <circle cx="60" cy="60" r="18" strokeDasharray="1.5 2.5" />
      <path d="M0 60h120M60 0v120M10 10l100 100M110 10 10 110" strokeDasharray="1.5 2.5" />
      <rect x="10" y="10" width="100" height="100" />
    </svg>
  )
}
