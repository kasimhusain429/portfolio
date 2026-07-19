import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import SectionReveal from './SectionReveal'

const data = [
  {
    name: 'Aarav Mehta',
    role: 'Founder, SaaS Studio',
    text: 'The UI feels premium and fast. Motion is classy, the layout is conversion-focused. Exactly what we needed.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    accent: 'from-indigo-500/20 to-cyan-400/10',
  },
  {
    name: 'Sophia Chen',
    role: 'Product Designer',
    text: 'Impressive attention to spacing and typography. Components are clean and reusable — easy handoff and iteration.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    accent: 'from-purple-500/20 to-pink-400/10',
  },
  {
    name: 'Daniel Rivera',
    role: 'CTO, Startup',
    text: 'Performance was great out of the box. The portfolio looks like a premium SaaS website, not a template.',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
    rating: 5,
    accent: 'from-cyan-400/20 to-teal-400/10',
  },
]

/* 3D tilt for testimonial card */
function useTilt(strength = 7) {
  const ref = useRef(null)
  const rx = useMotionValue(0); const srx = useSpring(rx, { stiffness: 160, damping: 22 })
  const ry = useMotionValue(0); const sry = useSpring(ry, { stiffness: 160, damping: 22 })
  const onMove = (e) => {
    const el = ref.current; if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    rx.set(-((e.clientY - top)  / height - 0.5) * strength)
    ry.set( ((e.clientX - left) / width  - 0.5) * strength)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }
  return { ref, srx, sry, onMove, onLeave }
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0)
  const tilt = useTilt()

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % data.length), 4600)
    return () => clearInterval(t)
  }, [])

  const active = data[idx]

  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">

        <SectionReveal direction="up">
          <p className="text-xs font-semibold tracking-widest text-(--muted)">TESTIMONIALS</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
            Proof <span className="text-(--muted)">of Quality</span>
          </h2>
        </SectionReveal>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.3fr_0.7fr]">

          {/* Featured testimonial with 3D tilt */}
          <SectionReveal direction="left" delay={0.05}>
            <motion.div
              ref={tilt.ref}
              style={{ rotateX: tilt.srx, rotateY: tilt.sry, transformStyle: 'preserve-3d', perspective: '900px' }}
              onMouseMove={tilt.onMove}
              onMouseLeave={tilt.onLeave}
              className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-7 shadow-(--shadow) backdrop-blur will-change-transform"
            >
              {/* Gradient accent */}
              <motion.div
                key={active.name + '-accent'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${active.accent} opacity-40`}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.name}
                  initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                  style={{ transform: 'translateZ(12px)' }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 text-amber-300">
                    {Array.from({ length: active.rating }).map((_, i) => (
                      <FiStar key={i} className="fill-amber-300" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-4 text-base font-medium leading-relaxed text-(--fg)">
                    &ldquo;{active.text}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-4">
                    <img
                      src={active.image}
                      alt={active.name}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/10"
                      loading="lazy"
                    />
                    <div>
                      <div className="text-sm font-semibold text-(--fg)">{active.name}</div>
                      <div className="text-xs text-(--muted)">{active.role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </SectionReveal>

          {/* Selector list */}
          <SectionReveal direction="right" delay={0.1}>
            <div className="flex h-full flex-col justify-between gap-3">
              {data.map((t, i) => (
                <motion.button
                  key={t.name}
                  type="button"
                  onClick={() => setIdx(i)}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-4 text-left transition ${
                    i === idx
                      ? 'border-indigo-500/30 bg-(--card-strong)'
                      : 'border-(--border) bg-(--card) hover:bg-(--card-strong)'
                  }`}
                >
                  {i === idx && (
                    <motion.div
                      layoutId="testimonial-pill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/8 to-cyan-400/5"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <img src={t.image} alt={t.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" loading="lazy" />
                  <div className="relative min-w-0">
                    <div className="truncate text-sm font-semibold text-(--fg)">{t.name}</div>
                    <div className="truncate text-xs text-(--muted)">{t.role}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
