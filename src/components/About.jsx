import { motion } from 'framer-motion'
import Kasim from '../assets/Kasim_image.png'

export default function About() {
  return (
    <section id="about" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-r from-indigo-500/20 via-cyan-400/12 to-purple-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-(--border) bg-(--card) shadow-(--shadow-strong) backdrop-blur-xl">
              <img
                src={Kasim}
                alt="Kasim Husain — React Developer"
                onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                className="h-[460px] w-full object-cover object-top opacity-0 transition-opacity duration-500"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-(--border) bg-(--card-strong) px-4 py-3 backdrop-blur">
                <div className="text-xs font-semibold text-(--muted)">Currently at</div>
                <div className="mt-0.5 text-sm font-semibold text-(--fg)">Cypherox Technologies Pvt. Ltd.</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-(--muted)">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  React.js Developer · Jun 2024 – Present
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            <p className="text-xs font-semibold tracking-widest text-(--muted)">ABOUT</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-(--fg) sm:text-4xl">
              About <span className="text-(--muted)">Me</span>
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-(--muted)">
              <p>
                I&apos;m a{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-cyan-200 to-purple-300 bg-clip-text font-semibold text-transparent">
                  React.js / Front-End Developer
                </span>{' '}
                with 2+ years of experience turning Figma designs into production-ready web applications
                — from SaaS dashboards to hospitality and e-commerce sites.
              </p>
              <p>
                At{' '}
                <span className="font-semibold text-(--fg)">Cypherox Technologies</span>, I build and
                maintain a 20+ component library, integrate REST APIs, and ship responsive internal tools
                used daily by 100+ active users — all within 2-week Agile sprints.
              </p>
              <p>
                I care deeply about layout rhythm, motion restraint, and performance. I refactored core
                dashboard views with code splitting and lazy loading, cutting initial page load time by ~30%.
              </p>
              <p>
                Proficient in{' '}
                <span className="font-medium text-(--fg)">
                  React.js, Next.js, TypeScript, Redux, Tailwind CSS
                </span>{' '}
                and a strong eye for pixel-accurate UI.
              </p>
            </div>

            {/* Key highlights — bullet list, not duplicating Hero stats */}
            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
              className="mt-7 space-y-2.5"
            >
              {[
                'Figma-to-production across SaaS, hospitality, e-commerce & consulting verticals',
                '20+ reusable components maintained across multiple internal products at Cypherox',
                'Code-split dashboard refactor cut initial page load by ~30%',
                'Ships in 2-week Agile sprints, integrating REST APIs with backend teams',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-(--muted)">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-400" />
                  {point}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
