import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiExternalLink, FiArrowUpRight } from 'react-icons/fi'

/* ─── Mouse-tracking 3D tilt hook ──────────────────────────── */
function useTilt(strength = 14) {
  const ref = useRef(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springCfg = { stiffness: 200, damping: 24, mass: 0.5 }
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [ strength, -strength]), springCfg)
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-strength,  strength]), springCfg)

  /* Glare spotlight position */
  const glareX = useTransform(mouseX, [0, 1], ['0%',   '100%'])
  const glareY = useTransform(mouseY, [0, 1], ['0%',   '100%'])

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    mouseX.set((e.clientX - left) / width)
    mouseY.set((e.clientY - top)  / height)
  }
  const onLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return { ref, rotateX, rotateY, glareX, glareY, onMove, onLeave }
}

export default function ProjectCard({ project, index, onOpen }) {
  const tilt = useTilt(12)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      ref={tilt.ref}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformStyle: 'preserve-3d',
        perspective: '900px',
      }}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      whileHover={{ scale: 1.02, y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-(--shadow) backdrop-blur will-change-transform transition-colors duration-300 hover:border-indigo-500/30 hover:bg-(--card-strong) hover:shadow-[0_32px_80px_-35px_rgba(99,102,241,0.35)]"
    >
      {/* Glare layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${tilt.glareX} ${tilt.glareY}, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        }}
      />

      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() => onOpen(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(project)}
        aria-label={`View details for ${project.title}`}
        style={{ transform: 'translateZ(4px)' }}
      >
        <motion.img
          src={project.image}
          alt={project.title}
          onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
          className="h-52 w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.08]"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300" />

        {/* Category pill — elevated */}
        <div className="absolute left-3 top-3" style={{ transform: 'translateZ(8px)' }}>
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
            {project.category}
          </span>
        </div>

        {/* Live link */}
        {project.live && (
          <div className="absolute right-3 top-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ transform: 'translateZ(12px)' }}
          >
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Open live site"
            >
              <FiExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ transform: 'translateZ(6px)' }}>
          <h3 className="text-base font-semibold text-white drop-shadow-md">{project.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5" style={{ transform: 'translateZ(2px)' }}>
        <p className="text-sm leading-relaxed text-(--muted)">{project.description}</p>

        {/* Tech tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <motion.span
              key={t}
              whileHover={{ scale: 1.08, y: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted) transition hover:border-indigo-500/30 hover:text-(--fg)"
            >
              {t}
            </motion.span>
          ))}
        </div>

        {/* Footer row */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-(--muted) transition hover:text-(--fg)"
            >
              View case study
              <FiArrowUpRight
                size={13}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </button>

            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-cyan-400/10 to-purple-500/15 px-3 py-1.5 text-[11px] font-semibold text-(--fg) transition hover:from-indigo-500/25 hover:via-cyan-400/20 hover:to-purple-500/25"
              >
                Live <FiExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Animated bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 transition-transform duration-500 group-hover:scale-x-100" />
    </motion.article>
  )
}
