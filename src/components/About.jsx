/**
 * About — Chapter 2: "Roots", painted as Ink Bloom (Concept C).
 *
 * The page content lives here; the ink itself (paper, roots, blooms, the
 * falling seed) is drawn by the WebGL layer InkRoots, which reads the
 * geometry this component measures. Without WebGL, a lighter SVG version of
 * the roots grows instead.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { buildRoots } from '../lib/roots'
import { ink, setInkGeom, subscribeInk, tipY } from '../lib/inkStore'
import { useDevice } from '../hooks/useDevice'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { AgileVisual, CraftVisual, ImpactVisual, RhythmVisual } from './about/RootVisuals'
import { RevealLine } from './ui/Reveal'
import { EASE as MOTION } from '../lib/motion'

const EASE = MOTION.out
const MOBILE_TRUNK_X = 26

const ROOTS = [
  {
    key: 'craft',
    label: 'Craft',
    title: 'Figma to production',
    body: 'Pixel-accurate builds straight from design files, across SaaS dashboards and e-commerce storefronts.',
    Visual: CraftVisual,
  },
  {
    key: 'impact',
    label: 'Impact',
    title: '30% faster loads',
    body: 'Code-splitting and lazy loading cut dashboard load times by 30% at Cypherox Technologies.',
    Visual: ImpactVisual,
  },
  {
    key: 'team',
    label: 'Way of working',
    title: 'Agile, side by side',
    body: 'Sprint rhythm with cross-functional teams, and reusable component libraries everyone can build on.',
    Visual: AgileVisual,
  },
  {
    key: 'rhythm',
    label: 'Obsession',
    title: 'Layout rhythm',
    body: 'Spacing scales, type rhythm and motion that serve the content, with performance kept in check.',
    Visual: RhythmVisual,
  },
]

const STATS = [
  { value: '2+', label: 'years shipping production React' },
  { value: '30%', label: 'faster dashboard loads' },
  { value: '5+', label: 'client sites launched' },
]

// Petal outline (rounded crown, pointed base) used to frame the portrait
const PETAL_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 140' preserveAspectRatio='none'><path d='M50 139C8 100 0 42 28 11C38 1 62 1 72 11C100 42 92 100 50 139Z'/></svg>",
)}")`
const maskStyle = {
  WebkitMaskImage: PETAL_MASK,
  maskImage: PETAL_MASK,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/** Position of an element's centre inside `root`, ignoring CSS transforms. */
function centreWithin(el, root) {
  let x = el.offsetWidth / 2
  let y = el.offsetHeight / 2
  let n = el
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent
  }
  return { x, y }
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setMobile(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return mobile
}


/* ─── Petal-framed portrait ───────────────────────────────── */
function PetalPortrait({ active }) {
  const reduce = useReducedMotion()
  const rx = useSpring(0, { stiffness: 150, damping: 18 })
  const ry = useSpring(0, { stiffness: 150, damping: 18 })
  const sx = useMotionValue(50)
  const sy = useMotionValue(30)
  const shine = useMotionTemplate`radial-gradient(55% 40% at ${sx}% ${sy}%, color-mix(in srgb, var(--color-paper-hi) 35%, transparent), transparent 70%)`

  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ry.set((x - 0.5) * 14)
    rx.set(-(y - 0.5) * 10)
    sx.set(x * 100)
    sy.set(y * 100)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
    sx.set(50)
    sy.set(30)
    ink.hover = -1
  }

  return (
    <motion.div
      className="relative [perspective:1100px]"
      initial={false}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9, y: active ? 0 : 36 }}
      transition={{ duration: 1.1, ease: EASE }}
      onPointerMove={onMove}
      onPointerEnter={() => (ink.hover = 0)}
      onPointerLeave={onLeave}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className="relative aspect-[100/140] w-full drop-shadow-[0_30px_40px_color-mix(in_srgb,_var(--color-ink)_28%,_transparent)]"
      >
        {/* rim light */}
        <div
          className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-paper-hi),var(--hue-300)_35%,var(--hue-500)_70%,var(--color-ink))]"
          style={maskStyle}
        />
        <div className="absolute inset-[3px] overflow-hidden bg-paper-2" style={maskStyle}>
          <img
            src="/about/kasim.webp"
            alt="Portrait of Kasim Husain"
            width="800"
            height="1200"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[50%_10%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,_var(--hue-300)_25%,_transparent),transparent_30%,transparent_62%,color-mix(in_srgb,_var(--color-ink)_45%,_transparent))]" />
          <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ background: shine }} />
        </div>
      </motion.div>

      <div className="absolute -right-3 bottom-[20%] flex items-center gap-2 rounded-full border border-hue-500/20 bg-paper/90 px-3.5 py-2 text-[0.8rem] font-medium text-ink shadow-[0_14px_30px_-12px_color-mix(in_srgb,_var(--color-ink)_45%,_transparent)] backdrop-blur-md md:-right-12">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-hue-500/60 motion-reduce:animate-none" />
          <span className="relative h-2 w-2 rounded-full bg-hue-500" />
        </span>
        Freelance frontend engineer
      </div>
    </motion.div>
  )
}

/* ─── A root card (pearl paper) ───────────────────────────── */
function RootCard({ root, index, fromTrunkLeft, active }) {
  const [hover, setHover] = useState(false)
  const hidden = fromTrunkLeft ? 'inset(0% 100% 0% 0% round 28px)' : 'inset(0% 0% 0% 100% round 28px)'
  const { Visual } = root
  return (
    <motion.article
      onPointerEnter={() => {
        setHover(true)
        ink.hover = index
      }}
      onPointerLeave={() => {
        setHover(false)
        ink.hover = -1
      }}
      initial={false}
      animate={{ clipPath: active ? 'inset(0% 0% 0% 0% round 28px)' : hidden, opacity: active ? 1 : 0.2 }}
      transition={{ duration: 1, ease: EASE }}
      className="group relative rounded-[28px] bg-[linear-gradient(150deg,var(--color-paper-hi),color-mix(in_srgb,_var(--hue-300)_85%,_transparent)_45%,color-mix(in_srgb,_var(--hue-500)_55%,_transparent))] p-px shadow-[0_34px_60px_-34px_color-mix(in_srgb,_var(--color-ink)_55%,_transparent),0_10px_24px_-14px_color-mix(in_srgb,_var(--hue-500)_35%,_transparent)] transition-transform duration-500 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden rounded-[27px] bg-[linear-gradient(165deg,color-mix(in_srgb,_var(--color-paper-hi)_95%,_transparent),color-mix(in_srgb,_var(--color-paper)_92%,_transparent)_55%,color-mix(in_srgb,_var(--color-paper-2)_92%,_transparent))] p-6 backdrop-blur-md md:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-hue-300/60 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-80"
        />
        <p className="eyebrow relative text-hue-700">{root.label}</p>
        <h3 className="relative mt-3 font-display text-h3 font-semibold text-ink">
          {root.title}
        </h3>
        <p className="relative mt-3 max-w-[38ch] text-body text-ink-soft">{root.body}</p>
        <div className="relative mt-5 h-px bg-[linear-gradient(90deg,color-mix(in_srgb,_var(--hue-500)_45%,_transparent),color-mix(in_srgb,_var(--hue-500)_0%,_transparent))]" />
        <div aria-hidden="true" className="relative mt-5 h-[92px] rounded-2xl bg-paper-2/70 p-3 ring-1 ring-inset ring-hue-500/15">
          <Visual on={active || hover} />
        </div>
      </div>
    </motion.article>
  )
}

/* ─── Section ─────────────────────────────────────────────── */
export default function About() {
  const sectionRef = useRef(null)
  const trunkRef = useRef(null)
  const trunkGlowRef = useRef(null)
  const trunkG = useRef(null)
  const tipRef = useRef(null)
  const branchG = useRef([])
  const branchGlowPath = useRef([])
  const branchPath = useRef([])
  const rootletRefs = useRef([])
  const reduce = useReducedMotion()
  const mobile = useIsMobile()
  const device = useDevice()
  const inkFailed = useSyncExternalStore(subscribeInk, () => ink.failed)
  const webgl = (device ? device.is3DEnabled : true) && !inkFailed
  const smooth = useSmoothScroll()
  const [geom, setGeom] = useState(null)
  const [active, setActive] = useState([false, false, false, false, false]) // portrait + 4 roots

  // Measure anchors + bloom targets → build the root geometry (re-runs on resize & font ready)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let cancelled = false
    const measure = () => {
      if (cancelled) return
      const w = section.clientWidth
      const h = section.offsetHeight
      const isMobile = w < 768
      const trunkX = isMobile ? MOBILE_TRUNK_X : w / 2
      const end = section.querySelector('[data-root="end"]')
      const endY = end ? centreWithin(end, section).y : h - 120
      const anchors = ['portrait', ...ROOTS.map((r) => r.key)].map((key) => {
        const el = section.querySelector(`[data-root="${key}"]`)
        return { key, ...(el ? centreWithin(el, section) : { x: trunkX, y: 0 }) }
      })
      const blooms = [...section.querySelectorAll('[data-bloom]')]
        .sort((a, b) => a.dataset.bloom - b.dataset.bloom)
        .map((el) => ({ ...centreWithin(el, section), w: el.offsetWidth, h: el.offsetHeight }))
      const g = { w, h, endY, trunkX, blooms, ...buildRoots({ trunkX, endY, anchors, mobile: isMobile }) }
      setGeom(g)
      setInkGeom(section, g)
    }
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(section)
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure, { passive: true })
    return () => {
      cancelled = true
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Growth → which nodes are reached (+ the SVG fallback when there is no WebGL)
  useEffect(() => {
    if (!geom) return
    const section = sectionRef.current
    const trunk = trunkRef.current
    const trunkGlow = trunkGlowRef.current
    let L = 0
    let lut = null
    if (trunk) {
      L = trunk.getTotalLength()
      const N = Math.max(2, Math.ceil(L / 6))
      lut = new Float32Array(N + 1)
      for (let k = 0; k <= N; k++) lut[k] = trunk.getPointAtLength((k / N) * L).y
      const da = `${L} ${L + 4}`
      trunk.style.strokeDasharray = da
      if (trunkGlow) trunkGlow.style.strokeDasharray = da
      if (trunkG.current) trunkG.current.style.strokeDasharray = da
    }
    const lenAtY = (y) => {
      const N = lut.length - 1
      let lo = 0
      let hi = N
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (lut[mid] < y) lo = mid + 1
        else hi = mid
      }
      return (lo / N) * L
    }
    const bLens = geom.branches.map((_, i) => branchPath.current[i]?.getTotalLength() || 0)
    const rLens = geom.rootlets.map((_, i) => rootletRefs.current[i]?.getTotalLength() || 0)
    geom.branches.forEach((_, i) => {
      const da = `${bLens[i]} ${bLens[i] + 4}`
      const g = branchG.current[i]
      const gp = branchGlowPath.current[i]
      const bp = branchPath.current[i]
      if (g) g.style.strokeDasharray = da
      if (gp) gp.style.strokeDasharray = da
      if (bp) bp.style.strokeDasharray = da
    })
    geom.rootlets.forEach((_, i) => {
      const r = rootletRefs.current[i]
      if (r) r.style.strokeDasharray = `${rLens[i]} ${rLens[i] + 4}`
    })

    let raf = 0
    let last = ''
    const update = () => {
      raf = 0
      const ty = tipY(section.getBoundingClientRect(), geom.endY, reduce)
      const act = geom.branches.map((b, i) => {
        const p = clamp01((ty - b.y0) / b.span)
        const g = branchG.current[i]
        const gp = branchGlowPath.current[i]
        const bp = branchPath.current[i]
        const off = `${bLens[i] * (1 - p)}`
        if (gp) gp.style.strokeDashoffset = off
        if (bp) bp.style.strokeDashoffset = off
        if (g) {
          g.style.strokeDashoffset = off
          g.style.opacity = p > 0.001 ? '1' : '0'
        }
        return p > 0.82
      })
      if (trunk) {
        const drawn = lenAtY(ty)
        const off = `${L - drawn}`
        trunk.style.strokeDashoffset = off
        if (trunkGlow) trunkGlow.style.strokeDashoffset = off
        if (trunkG.current) {
          trunkG.current.style.strokeDashoffset = off
          trunkG.current.style.opacity = drawn > 1 ? '1' : '0'
        }
        const pt = trunk.getPointAtLength(drawn)
        if (tipRef.current) {
          tipRef.current.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
          tipRef.current.style.opacity = drawn > 2 && ty < geom.endY - 2 ? '1' : '0'
        }
        geom.rootlets.forEach((r, i) => {
          const el = rootletRefs.current[i]
          if (!el) return
          const p = clamp01((ty - r.y0) / r.span)
          el.style.strokeDashoffset = `${rLens[i] * (1 - p)}`
          el.style.opacity = p > 0.001 ? '1' : '0'
        })
      }
      const key = act.join()
      if (key !== last) {
        last = key
        setActive(act)
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    const offLenis = smooth?.onScroll?.(schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    window.visualViewport?.addEventListener('resize', schedule, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      offLenis?.()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [geom, reduce, webgl, smooth])

  // Stir the ink with the pointer; click to drop pigment
  useEffect(() => {
    const section = sectionRef.current
    if (!section || reduce) return
    let lx = 0
    let ly = 0
    const onMove = (e) => {
      const r = section.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const speed = Math.hypot(x - lx, y - ly)
      lx = x
      ly = y
      ink.mouse.x = x
      ink.mouse.y = y
      ink.stir = Math.min(1, ink.stir + speed * 0.006)
    }
    const onClick = (e) => {
      if (e.target.closest('a, button')) return
      const r = section.getBoundingClientRect()
      ink.drops.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() })
      if (ink.drops.length > 6) ink.drops.shift()
    }
    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('click', onClick)
    return () => {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('click', onClick)
    }
  }, [reduce])

  const goWork = (e) => {
    e.preventDefault()
    if (smooth?.scrollTo) smooth.scrollTo('#projects', { offset: -80 })
    else document.getElementById('projects')?.scrollIntoView()
  }
  const goContact = (e) => {
    e.preventDefault()
    if (smooth?.scrollTo) smooth.scrollTo('#contact', { offset: -80 })
    else document.getElementById('contact')?.scrollIntoView()
  }

  const anchorDot = (on) =>
    `block h-3 w-3 rounded-full border-2 transition-all duration-700 ${
      on
        ? 'border-paper bg-ink-900 shadow-[0_0_0_4px_color-mix(in_srgb,_var(--hue-500)_28%,_transparent),0_6px_14px_-4px_color-mix(in_srgb,_var(--color-ink)_60%,_transparent)]'
        : 'border-hue-500/40 bg-paper'
    }`

  return (
    <section
      id="about"
      data-hue="teal"
      ref={sectionRef}
      aria-labelledby="about-title"
      className={`relative overflow-hidden pb-[210px] pt-[20vh] sm:pb-[260px] md:pb-[340px] md:pt-[28vh] ${
        webgl
          ? 'bg-transparent'
          : 'bg-[linear-gradient(180deg,var(--color-iris-300)_0%,var(--color-paper-2)_8%,var(--color-paper)_46%,var(--color-paper-2)_78%,var(--hue-500)_91%,var(--color-ink-900)_98%)]'
      }`}
    >
      {/* SVG fallback roots (no WebGL) */}
      {geom && !webgl && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0"
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          fill="none"
          strokeLinecap="round"
        >
          {geom.rootlets.map((r, i) => (
            <path
              key={`r${i}`}
              ref={(el) => {
                rootletRefs.current[i] = el
              }}
              d={r.d}
              stroke="var(--hue-400)"
              strokeWidth={r.w * 1.4}
              style={{ opacity: 0 }}
            />
          ))}
          {geom.branches.map((b, i) => (
            <g
              key={b.key}
              ref={(el) => {
                branchG.current[i] = el
              }}
              style={{ opacity: 0 }}
            >
              <path
                ref={(el) => {
                  branchGlowPath.current[i] = el
                }}
                d={b.d}
                stroke="var(--hue-300)"
                strokeWidth="9"
                strokeOpacity="0.5"
              />
              <path
                ref={(el) => {
                  branchPath.current[i] = el
                }}
                d={b.d}
                stroke="var(--hue-500)"
                strokeWidth="3"
              />
            </g>
          ))}
          <g ref={trunkG} style={{ opacity: 0 }}>
            <path ref={trunkGlowRef} d={geom.trunk} stroke="var(--hue-300)" strokeWidth="14" strokeOpacity="0.5" />
            <path ref={trunkRef} d={geom.trunk} stroke="var(--color-ink)" strokeWidth="4" />
          </g>
          <g ref={tipRef} style={{ opacity: 0 }}>
            <circle r="6" fill="var(--color-ink)" />
          </g>
        </svg>
      )}

      <div className="container-page relative max-w-[1280px]">
        <div className="pl-14 sm:pl-12 md:pl-0">
          {/* Intro + portrait at the first fork */}
          <div className="md:grid md:grid-cols-2 md:items-center md:gap-x-24">
            <div className="md:pr-6">
              <p className="eyebrow text-hue-700">02 — About</p>
              <h2 id="about-title" className="mt-5 font-display text-h2 font-semibold text-ink">
                <RevealLine>What grows</RevealLine>
                <RevealLine delay={0.12} className="font-light text-hue-700">
                  the work
                </RevealLine>
              </h2>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 1, delay: 0.25, ease: EASE }}
                className="mt-7 max-w-[44ch] text-lead text-ink-soft"
              >
                I'm Kasim, a frontend engineer with 2+ years in production. I now freelance, building sites and web apps
                for brands and startups; before that, at Cypherox Technologies, I built reusable component libraries,
                connected REST APIs and tuned dashboards for speed. Everything I ship grows from the same four roots.
              </motion.p>
              <motion.dl
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 1, delay: 0.4, ease: EASE }}
                className="mt-10 grid max-w-[540px] grid-cols-3 gap-4"
              >
                {STATS.map((s) => (
                  <div key={s.value} className="flex flex-col-reverse justify-end border-t border-hue-600/35 pt-3">
                    <dt className="mt-2 text-caption text-ink-soft">{s.label}</dt>
                    <dd className="bg-[linear-gradient(135deg,var(--color-ink),var(--hue-700))] bg-clip-text font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.6rem)] font-semibold leading-none tracking-[-0.03em] text-transparent">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </div>

            <div
              data-bloom="0"
              className="relative mt-[12vh] w-full max-w-[340px] md:mt-[12vh] md:ml-14 md:max-w-[360px] md:justify-self-start"
            >
              <span data-root="portrait" className="absolute -left-[26px] top-[30%] md:-left-[24px] md:top-[42%]">
                <span className={anchorDot(active[0])} />
              </span>
              <PetalPortrait active={active[0]} />
            </div>
          </div>

          {/* The four roots */}
          <ol className="relative mt-[14vh] flex flex-col gap-[12vh] md:mt-[24vh] md:gap-[20vh]">
            {ROOTS.map((root, i) => {
              const left = i % 2 === 0
              return (
                <li key={root.key} className="md:grid md:grid-cols-2 md:gap-x-48">
                  <div
                    data-bloom={i + 1}
                    className={`relative w-full max-w-[460px] ${
                      left ? 'md:col-start-1 md:justify-self-end' : 'md:col-start-2 md:justify-self-start'
                    }`}
                  >
                    <span
                      data-root={root.key}
                      className={`absolute top-10 -left-[33px] ${left ? 'md:left-auto md:-right-[33px]' : 'md:-left-[33px]'}`}
                    >
                      <span className={anchorDot(active[i + 1])} />
                    </span>
                    <RootCard root={root} index={i + 1} active={active[i + 1]} fromTrunkLeft={mobile || !left} />
                  </div>
                </li>
              )
            })}
          </ol>

          {/* The seed at the end of the root */}
          <div className="relative mt-[14vh] md:mt-[20vh] md:flex md:flex-col md:items-center md:text-center">
            <span data-root="end" className="absolute -left-[58px] top-1 sm:-left-[62px] md:static md:mb-10">
              <span className="block h-4 w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--hue-300),var(--hue-500)_45%,var(--color-ink))] shadow-[0_0_0_6px_color-mix(in_srgb,_var(--hue-500)_22%,_transparent),0_10px_24px_-6px_color-mix(in_srgb,_var(--color-ink)_60%,_transparent)]" />
            </span>
            <p className="font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
              Still growing.
            </p>
            <p className="mt-4 max-w-[40ch] text-lead text-ink-soft">
              Currently freelancing, building React products for brands and startups.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:justify-center">
              <a
                href="#contact"
                onClick={goContact}
                className="btn btn-primary"
              >
                Start a project
              </a>
              <a
                href="#projects"
                onClick={goWork}
                className="btn btn-ghost-light"
              >
                See the work
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
