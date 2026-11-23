/**
 * HueField: the night sky behind every dark section.
 *
 * One fixed layer under the page carries a glow per section hue. As you scroll,
 * the glow of the section you're leaving fades while the next one's rises, so
 * orchid flows into coral, coral into marigold and so on (weights come from
 * lib/journey). Only opacity changes per frame, which stays on the compositor.
 * The light sections (hero, About) paint over it with their own surfaces.
 */
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { subscribeFrame } from '../lib/journey'
import { HUES } from '../lib/palette'

const NAMES = Object.keys(HUES)

export default function HueField() {
  const layers = useRef({})

  useEffect(
    () =>
      subscribeFrame((weights) => {
        for (const name of NAMES) {
          const el = layers.current[name]
          if (!el) continue
          const o = (weights[name] || 0).toFixed(3)
          if (el.style.opacity !== o) el.style.opacity = o
        }
      }),
    [],
  )

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-ink-900">
      <div className="hue-drift absolute -inset-[8%]">
        {NAMES.map((name) => (
          <div
            key={name}
            data-hue={name}
            ref={(el) => {
              layers.current[name] = el
            }}
            className="hue-layer absolute inset-0"
            style={{ opacity: 0 }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(95%_75%_at_50%_50%,transparent_55%,color-mix(in_srgb,var(--color-ink-950)_75%,transparent))]" />
    </div>,
    document.body,
  )
}
