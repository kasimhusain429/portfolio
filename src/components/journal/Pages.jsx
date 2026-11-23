/**
 * Field Journal pages: paper, ink, tape, stamps and the page layouts.
 * Ink "writes itself" the first time a page is shown (`on`).
 */
import { createContext, useContext, useId } from 'react'
import { motion } from 'framer-motion'
import SpecimenArt from '../skills/SpecimenArt'
import { EASE as MOTION } from '../../lib/motion'

export const PW = 420 // page width (px, before scaling)
export const PH = 560 // page height

const OnCtx = createContext(false)
const EASE = MOTION.out

/** text that writes itself left → right */
export function Ink({ d = 0, className = '', children, as = 'div' }) {
  const on = useContext(OnCtx)
  const M = motion[as]
  return (
    <M
      className={className}
      initial={false}
      animate={on ? { clipPath: 'inset(-20% -10% -20% -2%)', opacity: 1 } : { clipPath: 'inset(-20% 100% -20% -2%)', opacity: 0.2 }}
      transition={{ duration: on ? 1.1 : 0, delay: on ? d : 0, ease: EASE }}
    >
      {children}
    </M>
  )
}

/** a hand-drawn ellipse around a figure */
function Circled({ children, d }) {
  const on = useContext(OnCtx)
  return (
    <span className="relative inline-block whitespace-nowrap px-1">
      {children}
      <svg viewBox="0 0 120 44" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+16px)] overflow-visible">
        <motion.path
          d="M8 26C6 12 40 4 70 5s48 8 46 19-34 17-62 16S4 34 10 20C14 12 30 8 44 7"
          fill="none"
          stroke="var(--hue-500)"
          strokeWidth="2.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ pathLength: on ? 1 : 0 }}
          transition={{ duration: on ? 0.9 : 0, delay: on ? d : 0, ease: 'easeInOut' }}
        />
      </svg>
    </span>
  )
}

function Note({ text, d }) {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g)
  return parts.map((part, i) => {
    const m = part.match(/<highlight>(.*?)<\/highlight>/)
    return m ? (
      <Circled key={i} d={d + 0.8}>
        <span className="font-semibold text-hue-700">{m[1]}</span>
      </Circled>
    ) : (
      <span key={i}>{part}</span>
    )
  })
}

export function Tape({ className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-[22px] w-[78px] bg-[linear-gradient(180deg,color-mix(in_srgb,_var(--hue-300)_78%,_transparent),color-mix(in_srgb,_var(--hue-400)_70%,_transparent))] shadow-[0_1px_2px_color-mix(in_srgb,_var(--color-ink)_18%,_transparent)] [clip-path:polygon(3%_0,97%_4%,100%_30%,97%_60%,100%_100%,2%_96%,0_70%,3%_38%)] ${className}`}
      style={style}
    />
  )
}

function Stamp({ text, numeral, className = '' }) {
  const id = 's' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <path id={`${id}c`} d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
        <filter id={`${id}r`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 1 1 1 0.6 1" />
          </feComponentTransfer>
        </filter>
      </defs>
      <g filter={`url(#${id}r)`} fill="none" stroke="var(--hue-500)" opacity="0.85">
        <circle cx="60" cy="60" r="55" strokeWidth="2.6" />
        <circle cx="60" cy="60" r="31" strokeWidth="1.4" />
        <text fill="var(--hue-500)" stroke="none" fontSize="10.5" letterSpacing="1.6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <textPath href={`#${id}c`}>{text}</textPath>
        </text>
        <text x="60" y="71" textAnchor="middle" fill="var(--hue-500)" stroke="none" fontSize="30" style={{ fontFamily: 'var(--font-serif)' }}>
          {numeral}
        </text>
      </g>
    </svg>
  )
}

/** one sheet of paper */
export function Page({ side, n, on, children, className = '' }) {
  return (
    <OnCtx.Provider value={on}>
      <div className={`journal-paper absolute inset-0 overflow-hidden ${side === 'left' ? 'rounded-l-[5px]' : 'rounded-r-[5px]'} ${className}`}>
        {/* gutter: the paper curving into the spine */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 w-[54px] ${side === 'left' ? 'right-0 bg-[linear-gradient(270deg,color-mix(in_srgb,_var(--color-ink-950)_28%,_transparent),color-mix(in_srgb,_var(--color-ink-950)_6%,_transparent)_45%,transparent)]' : 'left-0 bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--color-ink-950)_30%,_transparent),color-mix(in_srgb,_var(--color-ink-950)_7%,_transparent)_45%,transparent)]'}`}
        />
        {/* outer edge catching the light */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 w-[18px] ${side === 'left' ? 'left-0 bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--color-ink-950)_8%,_transparent),transparent)]' : 'right-0 bg-[linear-gradient(270deg,color-mix(in_srgb,_var(--color-ink-950)_8%,_transparent),transparent)]'}`}
        />
        <div className={`relative h-full ${side === 'left' ? 'pl-[40px] pr-[46px]' : 'pl-[48px] pr-[38px]'} pb-[46px] pt-[40px]`}>{children}</div>
        {n != null && (
          <span className={`absolute bottom-[18px] font-serif text-[13px] italic text-ink-soft ${side === 'left' ? 'left-[40px]' : 'right-[38px]'}`}>{n}</span>
        )}
      </div>
    </OnCtx.Provider>
  )
}

/* ─── Cover + endpaper ──────────────────────────────────────── */
export function CoverFront({ bandStyle }) {
  return (
    <div className="journal-cloth absolute inset-0 overflow-hidden rounded-r-[10px] rounded-l-[3px] shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--hue-300)_12%,_transparent),inset_10px_0_18px_-8px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent),inset_-2px_-2px_6px_color-mix(in_srgb,_var(--color-ink-950)_35%,_transparent)]">
      {/* hinge groove */}
      <span className="absolute inset-y-0 left-[22px] w-[3px] bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--color-ink-950)_35%,_transparent),color-mix(in_srgb,_var(--hue-300)_12%,_transparent))]" />
      {/* debossed frame + foil title */}
      <div className="absolute inset-x-[58px] top-[118px] h-[250px] rounded-[4px] shadow-[inset_1px_1px_2px_color-mix(in_srgb,_var(--color-ink-950)_55%,_transparent),1px_1px_0_color-mix(in_srgb,_var(--hue-300)_14%,_transparent)]" />
      <div className="absolute inset-x-[58px] top-[118px] flex h-[250px] flex-col items-center justify-center text-center">
        <SpecimenArt kind="fern" seed={4} className="h-[64px] w-auto opacity-80 [filter:brightness(2.2)_saturate(0.7)]" />
        <p className="mt-3 bg-[linear-gradient(100deg,var(--hue-400),var(--color-paper)_45%,var(--hue-300)_60%,var(--hue-400))] bg-clip-text font-serif text-[44px] italic leading-none text-transparent [text-shadow:0_1px_0_color-mix(in_srgb,_var(--color-ink-950)_0%,_transparent)]">
          Field Journal
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.34em] text-hue-300">Vol. II · 2024 —</p>
      </div>
      <p className="absolute inset-x-0 bottom-[54px] text-center font-display text-[13px] font-medium uppercase tracking-[0.32em] text-hue-300">
        Kasim Husain
      </p>
      {/* corner protectors */}
      <span className="absolute right-0 top-0 h-[34px] w-[34px] bg-[linear-gradient(225deg,var(--hue-300),var(--hue-400)_50%,transparent_51%)] opacity-80" />
      <span className="absolute bottom-0 right-0 h-[34px] w-[34px] bg-[linear-gradient(315deg,var(--hue-300),var(--hue-400)_50%,transparent_51%)] opacity-80" />
      {/* elastic band */}
      <motion.span
        style={bandStyle}
        className="absolute inset-y-0 right-[38px] w-[12px] bg-[linear-gradient(90deg,var(--hue-700),var(--hue-500)_40%,var(--hue-400)_55%,var(--hue-700))] shadow-[0_0_6px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]"
      />
    </div>
  )
}

export function Endpaper() {
  return (
    <div className="journal-cloth absolute inset-0 rounded-l-[10px] rounded-r-[3px]">
      <div className="absolute inset-[7px] right-[5px] overflow-hidden rounded-[3px] bg-paper-2">
        <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
          <defs>
            <pattern id="endpaper" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
              <path d="M32 50V18M32 26l-8-6M32 32l9-7M32 40l-9-6M32 46l8-5" fill="none" stroke="var(--hue-400)" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="0" cy="0" r="2.4" fill="var(--hue-500)" opacity="0.6" />
              <circle cx="64" cy="64" r="2.4" fill="var(--hue-500)" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#endpaper)" />
        </svg>
        <div className="absolute inset-y-0 right-0 w-[50px] bg-[linear-gradient(270deg,color-mix(in_srgb,_var(--color-ink-950)_30%,_transparent),transparent)]" />
        {/* ex libris plate */}
        <div className="journal-paper absolute left-1/2 top-[34%] w-[230px] -translate-x-1/2 rotate-[-2deg] rounded-[3px] px-6 py-5 text-center shadow-[0_10px_24px_-12px_color-mix(in_srgb,_var(--color-ink-950)_70%,_transparent)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-soft">Ex libris</p>
          <p className="font-ink mt-2 text-[30px] leading-none">Kasim Husain</p>
          <p className="mt-2 font-serif text-[13px] italic text-ink-soft">Frontend engineer, Ahmedabad</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Title / contents ─────────────────────────────────────── */
export function TitlePage({ on, entries }) {
  return (
    <Page side="right" n="i" on={on}>
      <Ink>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">Observations · 2024 —</p>
      </Ink>
      <Ink d={0.15}>
        <h3 className="mt-5 font-serif text-[46px] italic leading-[0.95] text-ink">Notes on growing</h3>
      </Ink>
      <Ink d={0.3}>
        <p className="mt-1 font-serif text-[46px] leading-[0.95] text-hue-700">as an engineer</p>
      </Ink>
      <div className="mt-9">
        <Ink d={0.5}>
          <p className="font-ink text-[24px]">Contents</p>
        </Ink>
        {entries.map((e, i) => (
          <Ink key={e.id} d={0.65 + i * 0.2}>
            <p className="mt-2 flex items-baseline gap-2 text-[15px] text-ink">
              <span className="font-serif italic text-hue-700">{e.numeral}.</span>
              <span className="font-medium">{e.short}</span>
              <span className="mb-1 flex-1 border-b border-dotted border-ink/30" />
              <span className="font-serif italic text-ink-soft">{i * 2 + 1}</span>
            </p>
          </Ink>
        ))}
      </div>
      <div className="absolute bottom-[56px] left-[48px] right-[38px] flex items-end justify-between">
        <Ink d={1.2}>
          <p className="font-ink max-w-[190px] text-[21px] leading-[1.05] -rotate-2">
            25 specimens filed in the herbarium, see above ↑
          </p>
        </Ink>
        <SpecimenArt kind="pod" seed={12} className="h-[130px] w-auto opacity-90" />
      </div>
    </Page>
  )
}

/* ─── An entry: left page (who/when) + right page (notes) ─── */
export function EntryLeft({ e, on, n }) {
  const long = e.role.length > 20
  return (
    <Page side="left" n={n} on={on}>
      <Ink>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">Entry {e.numeral}</p>
      </Ink>
      <Ink d={0.15}>
        <h3 className={`font-ink mt-3 leading-[0.9] ${long ? 'text-[38px]' : 'text-[46px]'}`}>{e.role}</h3>
      </Ink>
      <Ink d={0.35}>
        <p className="mt-3 font-serif text-[19px] italic text-hue-700">{e.company}</p>
      </Ink>
      <Ink d={0.45}>
        <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.16em] text-ink-soft">{e.period}</p>
      </Ink>
      {/* pressed specimen, taped down */}
      <motion.div
        initial={false}
        animate={on ? { opacity: 1, y: 0, rotate: -3 } : { opacity: 0, y: 14, rotate: -8 }}
        transition={{ duration: on ? 0.9 : 0, delay: on ? 0.5 : 0, ease: EASE }}
        style={{ top: long ? 244 : 218 }}
        className="absolute left-[56px] h-[230px] w-[180px] rounded-[2px] bg-paper-hi shadow-[0_14px_26px_-14px_color-mix(in_srgb,_var(--color-ink-950)_65%,_transparent),0_0_0_1px_color-mix(in_srgb,_var(--color-ink)_6%,_transparent)]"
      >
        <SpecimenArt kind={e.specimen.kind} seed={e.specimen.seed} className="absolute inset-x-3 top-3 h-[170px] w-[calc(100%-24px)]" />
        <p className="absolute inset-x-0 bottom-3 text-center font-serif text-[14px] italic text-ink-soft">{e.latin}</p>
        <Tape className="-left-5 top-3 -rotate-[32deg]" />
        <Tape className="-right-5 bottom-10 -rotate-[28deg]" />
      </motion.div>
      <Stamp text={e.stamp.repeat(2)} numeral={e.numeral} className={`absolute right-[34px] h-[118px] w-[118px] rotate-[-14deg] ${long ? 'top-[268px]' : 'top-[250px]'}`} />
      <Ink d={1} className="absolute bottom-[56px] left-[250px] right-[40px]">
        <p className="font-ink text-[21px] leading-[1.05] rotate-[-3deg]">{e.caption}</p>
      </Ink>
    </Page>
  )
}

export function EntryRight({ e, on, n, last }) {
  return (
    <Page side="right" n={n} on={on}>
      <Ink>
        <p className="font-ink text-[30px] leading-none">Field notes</p>
      </Ink>
      <ul className="journal-ruled font-ink mt-4 space-y-[0px] text-[21px] leading-[28px]">
        {e.notes.map((t, i) => (
          <Ink as="li" key={i} d={0.25 + i * 0.35} className="relative pl-6">
            <span className="absolute left-0 text-hue-700">—</span>
            <Note text={t} d={0.25 + i * 0.35} />
          </Ink>
        ))}
      </ul>
      <div className="absolute bottom-[64px] left-[48px] right-[38px]">
        <Ink d={1.2}>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-soft">Collected tools</p>
        </Ink>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-3">
          {e.tags.map((t, i) => (
            <motion.span
              key={t}
              initial={false}
              animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: on ? 0.6 : 0, delay: on ? 1.3 + i * 0.1 : 0, ease: EASE }}
              className="relative rounded-[2px] bg-paper-hi px-3 py-1.5 text-[12.5px] font-medium text-ink shadow-[0_3px_6px_-3px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent),0_0_0_1px_color-mix(in_srgb,_var(--color-ink)_7%,_transparent)]"
              style={{ rotate: `${[-2, 1.5, -1, 2][i % 4]}deg` }}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <Ink d={1.7}>
          <p className="font-ink mt-5 text-[22px] text-hue-700">
            {last ? 'to be continued …' : '→ turn the page'}
          </p>
        </Ink>
      </div>
      <Ink d={1.5} className="absolute right-[26px] top-[34px]">
        <p className="font-ink rotate-[6deg] text-[19px] text-hue-700">{e.margin}</p>
      </Ink>
    </Page>
  )
}

/* ─── The back of the journal: album intro + pocket ─────────── */
export function AlbumIntro({ on, n }) {
  return (
    <Page side="left" n={n} on={on}>
      <Ink>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-soft">Appendix · Keepsakes</p>
      </Ink>
      <Ink d={0.15}>
        <h3 className="mt-5 font-serif text-[44px] italic leading-[0.95] text-ink">Collected</h3>
      </Ink>
      <Ink d={0.3}>
        <p className="font-serif text-[44px] leading-[0.95] text-hue-700">along the way</p>
      </Ink>
      <Ink d={0.55}>
        <p className="font-ink mt-7 max-w-[300px] text-[22px] leading-[1.15]">
          A stamp for every place my work has travelled, and a few numbers worth keeping.
        </p>
      </Ink>
      {/* empty hinge mounts waiting for stamps */}
      <div className="absolute bottom-[70px] left-[40px] right-[46px] grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative aspect-[4/5] rounded-[2px] border border-dashed border-ink/20">
            <span className="absolute -top-2 left-1/2 h-4 w-9 -translate-x-1/2 bg-[color-mix(in_srgb,_var(--color-paper-2)_85%,_transparent)] shadow-[0_1px_2px_color-mix(in_srgb,_var(--color-ink)_15%,_transparent)]" />
          </div>
        ))}
      </div>
      <Ink d={1} className="absolute bottom-[42px] right-[46px]">
        <p className="font-ink text-[20px] text-hue-700">see the pocket →</p>
      </Ink>
    </Page>
  )
}

/** inside back cover (the base of the book) */
export function BackBoard() {
  return (
    <div className="journal-cloth absolute inset-0 rounded-r-[5px]">
      <div className="absolute inset-[7px] left-[5px] overflow-hidden rounded-[3px] bg-paper-2">
        <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
          <rect width="100%" height="100%" fill="url(#endpaper)" />
        </svg>
        <div className="absolute inset-y-0 left-0 w-[50px] bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--color-ink-950)_30%,_transparent),transparent)]" />
      </div>
    </div>
  )
}

/** glassine pocket glued to the inside back cover */
export function Pocket() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3px] bg-[linear-gradient(175deg,color-mix(in_srgb,_var(--color-paper)_58%,_transparent),color-mix(in_srgb,_var(--color-paper-2)_48%,_transparent)_50%,color-mix(in_srgb,_var(--hue-300)_55%,_transparent))] shadow-[0_-1px_0_color-mix(in_srgb,_var(--color-paper-hi)_70%,_transparent),inset_0_1px_0_color-mix(in_srgb,_var(--color-paper-hi)_90%,_transparent),0_-6px_14px_-8px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_25%,color-mix(in_srgb,_var(--color-paper-hi)_55%,_transparent)_38%,transparent_48%,transparent_62%,color-mix(in_srgb,_var(--color-paper-hi)_35%,_transparent)_70%,transparent_78%)]" />
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[22px] w-full" aria-hidden="true">
        <path d="M0 0h100v6Q50 22 0 6Z" fill="color-mix(in srgb, var(--color-paper-hi) 45%, transparent)" />
      </svg>
      <p className="font-ink absolute bottom-[16px] right-[22px] rotate-[-4deg] text-[22px] text-ink-soft">keepsakes</p>
    </div>
  )
}
