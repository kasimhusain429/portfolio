import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RevealLine, RevealUp } from '../components/ui/Reveal'

/** 404: a path that never grew. Same night sky and type as the rest of the site. */
export default function NotFound() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Page not found · Kasim Husain'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <main id="main" data-hue="coral" className="relative grid min-h-svh place-items-center overflow-hidden text-paper">
      <div aria-hidden="true" className="bg-glow pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2" />
      <div className="container-page relative max-w-3xl text-center">
        <RevealUp as="p" className="eyebrow justify-center text-hue-300">
          404 — Off the path
        </RevealUp>
        <h1 className="mt-6 font-display text-h2 font-semibold">
          <RevealLine>Nothing grows</RevealLine>
          <RevealLine delay={0.1}>
            <span className="font-serif font-normal italic text-hue-300">here yet.</span>
          </RevealLine>
        </h1>
        <RevealUp as="p" delay={0.2} className="mx-auto mt-6 max-w-[40ch] text-lead text-mist">
          The page you were looking for isn&apos;t in the garden. The way back is just here.
        </RevealUp>
        <RevealUp delay={0.3} className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            Back to the bloom
          </Link>
          <a href="/#contact" className="btn btn-ghost-dark">
            Get in touch
          </a>
        </RevealUp>
      </div>
    </main>
  )
}
