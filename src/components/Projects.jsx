import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiExternalLink, FiGithub } from 'react-icons/fi'
import ProjectCard from './ProjectCard'
import { projects } from '../data/projects'

function Modal({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-(--border) bg-(--card-strong) shadow-(--shadow-strong) backdrop-blur-xl"
          >
            <div className="relative">
              <img
                src={project.image}
                alt={project.title}
                className="h-64 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) backdrop-blur transition hover:bg-(--card-strong)"
                aria-label="Close modal"
              >
                <FiX />
              </button>

              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-(--muted)">PROJECT</div>
                    <div className="mt-2 text-2xl font-semibold text-(--fg)">{project.title}</div>
                    <div className="mt-2 text-sm text-(--muted)">{project.description}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 via-cyan-500 to-purple-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                    >
                      Live <FiExternalLink />
                    </a>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-4 py-2 text-sm font-semibold text-(--fg) transition hover:bg-(--card-strong)"
                    >
                      Code <FiGithub />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <div className="text-xs font-semibold tracking-widest text-(--muted)">STACK</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-(--muted)">FEATURES</div>
                    <ul className="mt-3 space-y-2 text-sm text-(--muted)">
                      {project.highlights.features.map((x) => (
                        <li key={x} className="leading-relaxed">{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-(--muted)">CHALLENGES</div>
                    <ul className="mt-3 space-y-2 text-sm text-(--muted)">
                      {project.highlights.challenges.map((x) => (
                        <li key={x} className="leading-relaxed">{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-(--muted)">RESULTS</div>
                    <ul className="mt-3 space-y-2 text-sm text-(--muted)">
                      {project.highlights.results.map((x) => (
                        <li key={x} className="leading-relaxed">{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Projects() {
  const [active, setActive] = useState(null)
  const data = useMemo(() => projects, [])

  return (
    <section id="projects" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-xs font-semibold tracking-widest text-(--muted)">PROJECTS</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
              Selected <span className="text-(--muted)">Work</span>
            </h2>
            {/* <div className="text-sm text-(--muted)">SaaS-style presentations with clean motion.</div> */}
          </div>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onOpen={setActive} />
          ))}
        </div>
      </div>

      <Modal project={active} onClose={() => setActive(null)} />
    </section>
  )
}
