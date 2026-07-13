import { motion } from 'framer-motion'
import { FiExternalLink, FiArrowUpRight } from 'react-icons/fi'

export default function ProjectCard({ project, index, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-(--shadow) backdrop-blur transition-all duration-300 hover:border-indigo-500/25 hover:bg-(--card-strong) hover:shadow-[0_28px_70px_-35px_rgba(99,102,241,0.3)]"
    >
      {/* Image */}
      <div
        className="relative cursor-pointer overflow-hidden"
        onClick={() => onOpen(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(project)}
        aria-label={`View details for ${project.title}`}
      >
        <img
          src={project.image}
          alt={project.title}
          onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
          className="h-52 w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.07]"
        />
        {/* Gradient overlay — lighter so the photo shows through */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Category pill */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
            {project.category}
          </span>
        </div>

        {/* Live link — visible on hover */}
        {project.live && (
          <div className="absolute right-3 top-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/50 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Open live site"
            >
              <FiExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Bottom title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-semibold text-white drop-shadow">{project.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-relaxed text-(--muted)">{project.description}</p>

        {/* Tech tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted) transition hover:border-indigo-500/30 hover:text-(--fg)"
            >
              {t}
            </span>
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

      {/* Bottom accent line — animates in on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px scale-x-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
    </motion.article>
  )
}
