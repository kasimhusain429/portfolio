import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { FiExternalLink, FiArrowUpRight, FiX } from 'react-icons/fi'
import SplitText from './ui/SplitText'
import { useIsMobile } from '../hooks/useDevice'
import { projects } from '../data/projects'

/* ─── Desktop: tall scroll section for 3D fly-through ─────── */
function ProjectsDesktop() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 0.8], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100])

  return (
    <section id="projects" ref={sectionRef} className="relative z-10 flex min-h-[250vh] flex-col pointer-events-none">
      <motion.div
        style={{ opacity, y }}
        className="sticky top-20 z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 pt-10"
      >
        <p className="text-[10px] font-bold tracking-[0.4em] text-[#00E5FF] uppercase">Selected Work</p>
        <h2 className="mt-4 flex flex-col text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl mix-blend-difference">
          <SplitText mode="char" stagger={0.03}>Digital</SplitText>
          <SplitText mode="char" stagger={0.03}>Experiences</SplitText>
        </h2>
      </motion.div>

      {/* The rest of the section provides the scroll height for the 3D gallery GSAP ScrollTrigger */}
      <div className="absolute inset-0 pointer-events-auto" />
    </section>
  )
}

/* ─── Mobile: card grid with project details ──────────────── */
function ProjectsMobile() {
  const [selected, setSelected] = useState(null)

  return (
    <section id="projects" className="relative py-24 px-4 overflow-hidden">
      {/* CSS ambient effects */}
      <div className="mobile-glow" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-12">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#00E5FF] uppercase">Selected Work</p>
          <h2 className="mt-4 flex flex-col text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
            <SplitText mode="char" stagger={0.03}>Digital</SplitText>
            <SplitText mode="char" stagger={0.03}>Experiences</SplitText>
          </h2>
        </div>

        {/* Project card grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {projects.map((project, i) => (
            <MobileProjectCard
              key={project.id}
              project={project}
              index={i}
              onOpen={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

/* ─── Mobile project card ─────────────────────────────────── */
function MobileProjectCard({ project, index, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur transition-colors active:bg-white/[0.06]"
      onClick={onOpen}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="h-44 w-full object-cover transition-transform duration-500 sm:h-48"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Category pill */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
            {project.category}
          </span>
        </div>

        {/* Live link */}
        {project.live && (
          <div className="absolute right-3 top-3">
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur transition active:bg-white/20"
              aria-label="Open live site"
            >
              <FiExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white drop-shadow-md sm:text-base">{project.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs leading-relaxed text-white/50 line-clamp-2 sm:text-sm">{project.description}</p>

        {/* Tech tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/40"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="group/btn inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/40 transition active:text-white"
            >
              View details
              <FiArrowUpRight size={12} className="transition-transform group-active/btn:translate-x-0.5 group-active/btn:-translate-y-0.5" />
            </button>

            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-cyan-400/10 to-purple-500/15 px-2.5 py-1 text-[10px] font-semibold text-white/80 transition active:from-indigo-500/25"
              >
                Live <FiExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-indigo-500/20 via-cyan-400/20 to-purple-500/20" />
    </motion.article>
  )
}

/* ─── Project detail modal ────────────────────────────────── */
function ProjectModal({ project, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition active:bg-white/10"
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        {/* Image */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={project.image}
            alt={project.title}
            className="h-48 w-full object-cover sm:h-56"
          />
        </div>

        {/* Content */}
        <div className="mt-4">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#00E5FF]">
            {project.category}
          </span>
          <h3 className="mt-3 text-xl font-black uppercase tracking-tight text-white">{project.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">{project.description}</p>

          {/* Highlights */}
          {project.highlights && (
            <div className="mt-5 space-y-4">
              {project.highlights.features && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF]">Features</h4>
                  <ul className="mt-2 space-y-1.5">
                    {project.highlights.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs text-white/60">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00E5FF]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {project.highlights.results && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Results</h4>
                  <ul className="mt-2 space-y-1.5">
                    {project.highlights.results.map((r, i) => (
                      <li key={i} className="flex gap-2 text-xs text-white/60">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tech tags */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/50"
              >
                {t}
              </span>
            ))}
          </div>

          {/* CTA */}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00E5FF] py-3 text-xs font-black uppercase tracking-widest text-black transition active:bg-[#00c8e0]"
            >
              View Live Site <FiExternalLink size={13} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const isMobile = useIsMobile()
  return isMobile ? <ProjectsMobile /> : <ProjectsDesktop />
}
