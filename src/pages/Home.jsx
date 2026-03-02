import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import TimelineHighlights from '../components/TimelineHighlights'
import Testimonials from '../components/Testimonials'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'

export default function Home() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--fg)">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <TimelineHighlights />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
