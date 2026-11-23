/**
 * JourneyRail: a slim rail on the right edge that stays with you through the
 * whole page. Each dot is a section and takes that section's hue; the line fills
 * with the spectrum as you go. Mouse shortcut only (the navbar and the footer
 * carry the same links for keyboard and screen-reader users), so it is hidden
 * from assistive tech and out of the tab order. Large screens only.
 */
import { useEffect, useRef } from 'react'
import { subscribeFrame, useJourney } from '../lib/journey'
import { SECTION_HUES } from '../lib/palette'
import { useBloom } from '../lib/bloomStore'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'

const LABELS = { home: 'Bloom', about: 'About', skills: 'Skills', projects: 'Work', experience: 'Experience', contact: 'Contact' }

export default function JourneyRail() {
  const { active, centreLight, inFooter } = useJourney()
  const live = useBloom((s) => s.phase === 'live')
  const smooth = useSmoothScroll()
  const fill = useRef(null)

  useEffect(
    () =>
      subscribeFrame((_, progress) => {
        if (fill.current) fill.current.style.transform = `scaleY(${progress.toFixed(4)})`
      }),
    [],
  )

  const index = SECTION_HUES.findIndex((s) => s.id === active)
  const go = (id) => (e) => {
    e.preventDefault()
    if (smooth?.scrollTo) smooth.scrollTo(`#${id}`, { offset: id === 'home' ? 0 : -80 })
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-(--dur-base) lg:block xl:right-6 ${
        live && !inFooter ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ '--rail': centreLight ? 'var(--color-ink)' : 'var(--color-paper)' }}
    >
      <div className="relative flex flex-col items-center gap-4 py-1">
        <span className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-(--rail)/20 transition-colors duration-(--dur-base)" />
        <span
          ref={fill}
          className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 origin-top bg-spectrum"
          style={{ transform: 'scaleY(0)' }}
        />
        {SECTION_HUES.map(({ id, hue }, i) => {
          const state = i === index ? 'now' : i < index ? 'past' : 'ahead'
          return (
            <a
              key={id}
              href={`#${id}`}
              tabIndex={-1}
              onClick={go(id)}
              data-hue={hue}
              className="group relative grid h-6 w-6 place-items-center"
            >
              <span
                className={`block h-2 w-2 rounded-full transition-[transform,background-color,box-shadow] duration-(--dur-base) ease-(--ease-out) ${
                  state === 'now'
                    ? 'scale-150 bg-hue-400 shadow-glow'
                    : state === 'past'
                      ? 'scale-75 bg-hue-400'
                      : 'scale-75 bg-(--rail)/45'
                }`}
              />
              <span className="pointer-events-none absolute right-8 translate-x-1 whitespace-nowrap rounded-full bg-ink-950/85 px-2.5 py-1 text-caption text-paper opacity-0 backdrop-blur transition-[opacity,transform] duration-(--dur-fast) group-hover:translate-x-0 group-hover:opacity-100">
                {LABELS[id]}
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
