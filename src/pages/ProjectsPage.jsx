import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'
import ProjectCard from '../components/ProjectCard'
import { projectCategories, projects } from '../data/projects'

export default function ProjectsPage() {
  const [filter, setFilter] = useState('All')

  const filtered = useMemo(() => {
    if (filter === 'All') return projects
    return projects.filter((p) => p.category === filter)
  }, [filter])

  return (
    <div className="min-h-screen bg-(--bg) text-(--fg)">
      <ScrollProgress />
      <Navbar />

      <main className="pt-28">
        <section className="py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold tracking-widest text-(--muted)">PROJECTS</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--fg) sm:text-4xl">
                All <span className="text-(--muted)">Projects</span>
              </h1>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {projectCategories.map((c) => {
                const active = c === filter
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-(--border) bg-(--card-strong) text-(--fg)'
                        : 'border-(--border) bg-(--card) text-(--muted) hover:bg-(--card-strong)'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div layout className="mt-10 columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
                {filtered.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.02 }}
                    className="break-inside-avoid"
                  >
                    <ProjectCard project={p} index={0} onOpen={() => {}} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
