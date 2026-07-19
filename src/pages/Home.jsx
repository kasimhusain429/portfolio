import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Achievements from '../components/Achievements'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'

export default function Home() {
  return (
    <div className="bg-app min-h-screen">
      {/* Scroll progress glow bar */}
      <ScrollProgress />

      {/* Floating glassmorphic navbar */}
      <Navbar />

      <main>
        {/* 1 — Cinematic 3D hero */}
        <Hero />

        {/* 2 — About with sticky overlap reveal */}
        <About />

        {/* 3 — Tech Stack Universe */}
        <Skills />

        {/* 4 — 3D Project Gallery Wrapper */}
        <Projects />

        {/* 5 — Horizontal Cinematic Timeline */}
        <Experience />

        {/* 6 — Achievements & Metrics */}
        <Achievements />

        {/* 7 — Contact form */}
        <Contact />
      </main>

      {/* Footer with scroll-linked reveal */}
      <Footer />
    </div>
  )
}
