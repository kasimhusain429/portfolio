/**
 * Hero — Chapter 1: "Bloom"
 *
 * DOM layer over the persistent R3F canvas (HeroScene3D). The headline is
 * real text for accessibility and as the no-WebGL fallback; when the 3D
 * flower is ready the scene redraws it in-world so the glass refracts it.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useDevice } from '../hooks/useDevice'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { bloomAnchor, setBloom, useBloom } from '../lib/bloomStore'
import { projects } from '../data/projects'
import { EASE as MOTION } from '../lib/motion'

const EASE = MOTION.out
const ramp = (from, to) => (v) => 1 - Math.min(1, Math.max(0, (v - from) / (to - from)))

const PREVIEW_IMG = {
  'house-of-clio': '/bloom/clio.webp',
  'house-of-ethnics': '/bloom/ethnics.webp',
  'nxt-digital': '/bloom/nxt.webp',
  'darryl-montgomery': '/bloom/darryl.webp',
}

/**
 * Glass preview card for the hovered petal. It floats beside the flower on the
 * petal's side (never over it), joined to the petal by a hairline. Position is
 * read every frame from bloomAnchor, which the 3D scene writes.
 */
function PetalPreview() {
  const hovered = useBloom((s) => s.hovered)
  const smooth = useSmoothScroll()
  const project = projects.find((p) => p.id === hovered)
  const boxRef = useRef(null)
  const lineRef = useRef(null)
  const dotRef = useRef(null)
  const haloRef = useRef(null)
  const pressedIdRef = useRef(null)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  // warm the cache so the first hover is instant
  useEffect(() => {
    Object.values(PREVIEW_IMG).forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useLayoutEffect(() => {
    pressedIdRef.current = null
    if (!hovered) return
    let raf
    const tick = () => {
      const el = boxRef.current
      if (el) {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const w = el.offsetWidth
        const h = el.offsetHeight
        const { x, y, cx, r } = bloomAnchor
        const isNarrow = vw < 768
        let left
        let top
        if (isNarrow) {
          left = (vw - w) / 2
          top = Math.max(76, vh - h - 84)
        } else if (r > 0) {
          const right = x >= cx
          left = right ? cx + r + 32 : cx - r - 32 - w
          left = Math.min(Math.max(left, 24), vw - w - 24)
          top = Math.min(Math.max(y - h / 2, 92), vh - h - 120)
        } else {
          left = (vw - w) / 2
          top = Math.max(92, (vh - h) / 2)
        }
        el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
          if (lineRef.current && dotRef.current && !isNarrow && r > 0) {
            const ex = x >= cx ? left : left + w
            const ey = top + h / 2
            lineRef.current.setAttribute('x1', x)
            lineRef.current.setAttribute('y1', y)
            lineRef.current.setAttribute('x2', ex)
            lineRef.current.setAttribute('y2', ey)
            dotRef.current.setAttribute('cx', x)
            dotRef.current.setAttribute('cy', y)
            haloRef.current?.setAttribute('cx', x)
            haloRef.current?.setAttribute('cy', y)
          }
          setNarrow((n) => (n === isNarrow ? n : isNarrow))
        }
        raf = requestAnimationFrame(tick)
      }
      tick()
      return () => cancelAnimationFrame(raf)
    }, [hovered])

  const openProject = (e) => {
    // Ignore trailing synthetic clicks from the same tap that opened the card
    if (e.detail !== 0 && pressedIdRef.current !== project?.id) return
    pressedIdRef.current = null
    setBloom({ hovered: null })
    if (smooth?.scrollTo) smooth.scrollTo('#projects', { offset: -80 })
    else document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
      <div className="pointer-events-none absolute inset-0 z-20">
        <motion.svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          initial={false}
          animate={{ opacity: project && !narrow ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <line ref={lineRef} stroke="var(--hue-500)" strokeOpacity="0.7" strokeWidth="1.25" strokeDasharray="1 5" strokeLinecap="round" />
          <motion.circle
            ref={haloRef}
            r="6"
            fill="var(--hue-500)"
            animate={{ r: [6, 16], opacity: [0.45, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <circle ref={dotRef} r="4.5" fill="var(--color-paper)" stroke="var(--hue-500)" strokeWidth="2" />
        </motion.svg>

          <div ref={boxRef} className="pointer-events-none absolute left-0 top-0 w-[min(320px,84vw)] will-change-transform">
            <AnimatePresence mode="wait">
              {project && (
            <motion.button
              type="button"
              key={project.id}
              data-petal-preview
              onPointerDown={() => {
                pressedIdRef.current = project.id
              }}
              onClick={openProject}
              aria-label={`Open ${project.title} project`}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{ duration: 0.45, ease: EASE }}
              className="pointer-events-auto block w-full cursor-pointer rounded-[26px] bg-[linear-gradient(145deg,color-mix(in_srgb,_var(--hue-300)_95%,_transparent),color-mix(in_srgb,_var(--hue-500)_55%,_transparent)_42%,color-mix(in_srgb,_var(--color-ink)_95%,_transparent))] p-px text-left shadow-[0_44px_90px_-34px_color-mix(in_srgb,_var(--color-ink)_75%,_transparent),0_16px_36px_-14px_color-mix(in_srgb,_var(--hue-500)_60%,_transparent)] outline-none focus-visible:ring-2 focus-visible:ring-hue-400"
            >
              <div className="relative overflow-hidden rounded-[25px] bg-[linear-gradient(165deg,var(--color-ink-700)_0%,var(--color-ink-800)_52%,var(--color-ink-900)_100%)] p-2.5">
                {/* ambient light inside the card */}
                <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-hue-500/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-hue-300/15 blur-3xl" />

                <div className="relative aspect-[16/11] overflow-hidden rounded-[18px] ring-1 ring-paper-hi/10">
                  <motion.img
                    src={PREVIEW_IMG[project.id]}
                    alt=""
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1.02 }}
                    transition={{ duration: 1.2, ease: EASE }}
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,_var(--color-ink)_0%,_transparent)_45%,color-mix(in_srgb,_var(--color-ink-950)_85%,_transparent)_100%)]" />
                  {/* light sweep as the card lands */}
                  <motion.div
                    className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(105deg,transparent,color-mix(in_srgb,_var(--color-paper-hi)_38%,_transparent),transparent)]"
                    initial={{ x: '-30%' }}
                    animate={{ x: '330%' }}
                    transition={{ duration: 1.1, delay: 0.25, ease: MOTION.inOut }}
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-paper-hi/25 bg-paper-hi/15 px-2.5 py-1 text-[0.75rem] font-medium text-paper backdrop-blur-md">
                    {project.category}
                  </span>
                  <p className="absolute inset-x-3 bottom-2.5 font-display text-[1.2rem] font-semibold leading-tight text-paper">
                    {project.title}
                  </p>
                </div>

                <div className="relative px-1.5 pb-1 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="chip"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-paper-hi/10 pt-3">
                    <span className="font-display text-[0.85rem] font-medium text-paper">Open project</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--hue-300),var(--hue-500))] text-ink shadow-[0_6px_16px_-6px_color-mix(in_srgb,_var(--hue-300)_90%,_transparent)]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          )}
          </AnimatePresence>
        </div>
      </div>
      )
}

      function HoverLabel({touch}) {
  const hovered = useBloom((s) => s.hovered)
  const bloomed = useBloom((s) => s.bloomed)
      const text = hovered
      ? touch
      ? 'Tap the petal again to open the work.'
      : 'Click the petal to open the work.'
      : bloomed
      ? 'In full bloom.'
      : touch
      ? 'Tap a petal to preview. Hold to make it bloom.'
      : 'Drag to turn it. Press and hold to make it bloom.'
      return (
      <div className="flex min-h-6 items-end justify-center text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="text-sm text-ink-soft"
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>
      )
}

      export default function Hero() {
  const sectionRef = useRef(null)
      const device = useDevice()
      const reduce = useReducedMotion()
  const ready = useBloom((s) => s.ready)
  const live = useBloom((s) => s.phase === 'live')
      const has3D = device ? device.is3DEnabled : true

      // the DOM headline shows only if there is no 3D, or the 3D missed the preloader's deadline
      const domName = !has3D || (live && !ready)

  // tell the scene the DOM headline is already on screen, so its own name appears in place
  useEffect(() => {
    if (domName && has3D) setBloom({domShown: true })
  }, [domName, has3D])
      const uiVisible = live

      const {scrollYProgress} = useScroll({target: sectionRef, offset: ['start start', 'end end'] })
      const uiFade = useTransform(scrollYProgress, ramp(0, 0.15))
      // The pearl stage stays up through the Descent and switches off only once the
      // About paper covers the whole screen (later sections sit on the page navy).
      const pearl = useMotionValue(1)
  useEffect(() => {
    const onScroll = () => {
      const about = document.getElementById('about')
      pearl.set(about && about.getBoundingClientRect().top < 0 ? 0 : 1)
    }
      onScroll()
      window.addEventListener('scroll', onScroll, {passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pearl])

      return (
      <section id="home" ref={sectionRef} className="relative h-[240svh] md:h-[320vh]" aria-labelledby="hero-title">
        {/* Pearl stage, shown before WebGL paints and faded to navy at dusk */}
        {/* (portalled to <body> so it sits beneath the WebGL canvas, not inside the content layer) */}
        {createPortal(
          <motion.div aria-hidden="true" style={{ opacity: pearl }} className="bloom-atmosphere pointer-events-none fixed inset-0 -z-10" />,
          document.body
        )}

        <div data-bloom-frame className="sticky top-0 h-svh w-full overflow-hidden">
          <h1
            id="hero-title"
            className={`absolute inset-x-0 top-[17%] flex flex-col items-center font-display text-[clamp(5.2rem,25vw,9rem)] leading-[0.82] font-bold tracking-[-0.035em] text-ink uppercase md:top-[13%] [&>span]:bg-[linear-gradient(180deg,var(--color-ink),var(--color-iris-700)_62%,var(--color-orchid-600))] [&>span]:bg-clip-text [&>span]:text-transparent md:text-[clamp(7rem,18.5vw,21rem)] ${domName ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'
              }`}
          >
            <span data-bloom-line className="block">
              Kasim
            </span>
            <span data-bloom-line className="block">
              Husain
            </span>
          </h1>

          {has3D && <PetalPreview />}

          <motion.div
            style={{ opacity: uiFade }}
            className="absolute inset-x-0 bottom-0 grid grid-cols-1 items-end gap-5 px-5 pb-6 sm:px-8 md:grid-cols-3 md:px-12 md:pb-10"
          >
            <motion.p
              initial={false}
              animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 1, delay: reduce ? 0 : 1.45, ease: EASE }}
              className="order-2 max-w-[30ch] border-l-2 border-hue-500 pl-4 text-lead text-ink md:order-1"
            >
              Frontend engineer. I grow interfaces from first sketch to live product.
            </motion.p>

            <motion.div
              initial={false}
              animate={uiVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: reduce ? 0 : 1.85 }}
              className="order-1 md:order-2"
            >
              {has3D && <HoverLabel touch={device?.isTouch ?? false} />}
            </motion.div>

            <motion.div
              initial={false}
              animate={uiVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: reduce ? 0 : 1.65 }}
              className="order-3 hidden items-center justify-end gap-3 md:flex"
            >
              <span className="text-sm text-ink-soft">Scroll to explore</span>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/30">
                <motion.span
                  className="block h-2.5 w-2.5 rounded-full bg-hue-500"
                  animate={reduce ? undefined : { y: [-6, 6, -6] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Keyboard + screen-reader equivalents of the petals: focusing one opens its preview card */}
        <nav aria-label="Featured projects" className="absolute left-5 top-24 z-30 sm:left-8 md:left-12">
          <ul className="flex flex-col items-start gap-2">
            {projects.map((p) => (
              <li key={p.id}>
                <a
                  href="#projects"
                  onFocus={() => setBloom({ hovered: p.id })}
                  onBlur={() => setBloom({ hovered: null })}
                  className="sr-only rounded-full bg-ink-900 px-4 py-2 font-display text-sm font-semibold text-paper focus:not-sr-only focus:inline-flex"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      )
}
