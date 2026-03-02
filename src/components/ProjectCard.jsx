import { motion } from 'framer-motion'
import { FiExternalLink, FiGithub } from 'react-icons/fi'

export default function ProjectCard({ project, index, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(project)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-(--border) bg-(--card) text-left shadow-(--shadow) backdrop-blur transition duration-300 hover:bg-(--card-strong)"
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-80" />
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) backdrop-blur transition hover:bg-(--card-strong)"
            aria-label="Live demo"
          >
            <FiExternalLink />
          </a>
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--border) bg-(--card) text-(--fg) backdrop-blur transition hover:bg-(--card-strong)"
            aria-label="GitHub"
          >
            <FiGithub />
          </a>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-(--fg)">{project.title}</h3>
          <span className="rounded-full border border-(--border) bg-(--card) px-2 py-1 text-[10px] font-semibold text-(--muted)">
            {project.category}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-(--muted)">{project.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-(--border) bg-(--card) px-2.5 py-1 text-[11px] font-medium text-(--muted)"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs font-medium text-(--muted)">Click for details</span>
          <span className="h-8 w-8 rounded-xl bg-linear-to-r from-indigo-500/20 via-cyan-400/15 to-purple-500/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </motion.button>
  )
}
