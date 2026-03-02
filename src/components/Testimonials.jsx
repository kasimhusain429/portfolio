import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'

const data = [
  {
    name: 'Aarav Mehta',
    role: 'Founder, SaaS Studio',
    text: 'The UI feels premium and fast. Motion is classy, and the layout is conversion-focused. Exactly what we needed.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 5,
  },
  {
    name: 'Sophia Chen',
    role: 'Product Designer',
    text: 'Impressive attention to spacing and typography. Components are clean and reusable—easy handoff and iteration.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 5,
  },
  {
    name: 'Daniel Rivera',
    role: 'CTO, Startup',
    text: 'Performance was great out of the box. The portfolio looks like a premium SaaS website, not a template.',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
    rating: 5,
  },
]

export default function Testimonials() {
  const items = useMemo(() => data, [])
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 4200)
    return () => clearInterval(t)
  }, [items.length])

  const active = items[i]

  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">TESTIMONIALS</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
            Proof <span className="text-(--muted)">of Quality</span>
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-(--shadow) backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={active.image}
                    alt={active.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold text-(--fg)">{active.name}</div>
                    <div className="text-xs text-(--muted)">{active.role}</div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-(--muted)">“{active.text}”</p>

                <div className="mt-5 flex items-center gap-1 text-amber-300">
                  {Array.from({ length: active.rating }).map((_, idx) => (
                    <FiStar key={idx} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid gap-3">
            {items.map((x, idx) => (
              <button
                key={x.name}
                type="button"
                onClick={() => setI(idx)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  idx === i
                    ? 'border-(--border) bg-(--card-strong)'
                    : 'border-(--border) bg-(--card) hover:bg-(--card-strong)'
                }`}
              >
                <img src={x.image} alt={x.name} className="h-9 w-9 rounded-xl object-cover" loading="lazy" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-(--fg)">{x.name}</div>
                  <div className="truncate text-xs text-(--muted)">{x.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
