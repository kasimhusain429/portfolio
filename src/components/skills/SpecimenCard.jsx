/**
 * Specimen card faces (front + back) and the handwritten note, shared by the
 * 3D cabinet and the flat (mobile) herbarium.
 */
import { FAMILIES, LEVELS, noteFor } from '../../data/skills'
import SpecimenArt from './SpecimenArt'

export function LevelDots({ level, className = '' }) {
  const n = LEVELS[level].dots
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${i < n ? 'bg-hue-500' : 'border border-hue-500/40'}`}
        />
      ))}
    </span>
  )
}

const paper =
  'bg-[linear-gradient(170deg,var(--color-paper-hi),var(--color-paper)_58%,var(--color-paper-2))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--hue-500)_16%,_transparent),0_1px_0_color-mix(in_srgb,_var(--color-paper-hi)_80%,_transparent)_inset]'

export function SpecimenFront({ s, size = 'sm' }) {
  const big = size === 'md'
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center rounded-[10px] text-center [backface-visibility:hidden] ${paper} ${
        big ? 'px-3 pb-3 pt-3' : 'px-2 pb-2 pt-1.5'
      }`}
    >
      <SpecimenArt kind={s.kind} seed={s.seed} className={big ? 'h-[52%] w-auto' : 'h-[48%] w-auto'} />
      <p className={`font-serif italic leading-[1.02] text-ink ${big ? 'mt-1 text-[1.2rem]' : 'mt-0.5 text-[14px]'}`}>
        {s.latin}
      </p>
      <p className={`mt-1 text-ink-soft ${big ? 'text-[0.8rem]' : 'text-[9.5px]'}`}>{s.name}</p>
      <LevelDots level={s.level} className="mt-auto" />
    </div>
  )
}

export function SpecimenBack({ s, size = 'sm' }) {
  const big = size === 'md'
  const family = FAMILIES.find((f) => f.key === s.family)?.label
  return (
    <div
      className={`absolute inset-0 flex flex-col rounded-[10px] text-left [backface-visibility:hidden] [transform:rotateY(180deg)] ${paper} ${
        big ? 'p-3.5' : 'p-2.5'
      }`}
    >
      <p className={`font-hand leading-none text-hue-700 ${big ? 'text-[1.35rem]' : 'text-[17px]'}`}>Field notes</p>
      <dl className={`mt-2 space-y-1.5 text-ink ${big ? 'text-[0.8rem]' : 'text-[9.5px]'}`}>
        <div>
          <dt className="text-ink-soft">Level</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            {LEVELS[s.level].label} <LevelDots level={s.level} />
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Family</dt>
          <dd className="font-medium">{family}</dd>
        </div>
        {s.foundIn.length > 0 && (
          <div>
            <dt className="text-ink-soft">Found in</dt>
            <dd className="font-medium leading-snug">{s.foundIn.join(', ')}</dd>
          </div>
        )}
      </dl>
      <p className={`mt-auto font-serif italic text-ink-soft ${big ? 'text-[0.85rem]' : 'text-[10px]'}`}>{s.latin}</p>
    </div>
  )
}

/** the little handwritten note pinned to a lifted specimen */
export function Note({ s }) {
  return (
    <span className="pointer-events-none absolute -right-[46px] -top-[22px] z-10 w-[136px] rotate-[6deg] rounded-[4px] bg-paper-hi px-2.5 py-2 font-hand text-[15px] leading-[1.05] text-ink shadow-[0_10px_20px_-8px_color-mix(in_srgb,_var(--color-ink-950)_60%,_transparent)]">
      <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--hue-300),var(--hue-500)_60%,var(--color-ink))] shadow-[0_2px_3px_color-mix(in_srgb,_var(--color-ink-950)_50%,_transparent)]" />
      {noteFor(s)}
    </span>
  )
}
