/**
 * SmoothScrollProvider — Lenis smooth scroll integration.
 *
 * Wraps the app with Lenis for butter-smooth inertial scrolling.
 * Syncs with GSAP ScrollTrigger for scroll-pinning.
 */
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'

const SmoothScrollContext = createContext(null)

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Sync Lenis with GSAP ScrollTrigger (if loaded)
    let gsapModule = null
    import('gsap').then((gsap) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsapModule = gsap.default
        gsapModule.registerPlugin(ScrollTrigger)

        lenis.on('scroll', ScrollTrigger.update)
        gsapModule.ticker.add((time) => {
          lenis.raf(time * 1000)
        })
        gsapModule.ticker.lagSmoothing(0)
      })
    })

    // Fallback RAF loop (before GSAP loads)
    let rafId
    function raf(time) {
      if (!gsapModule) {
        lenis.raf(time)
      }
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = useCallback((target, options = {}) => {
    lenisRef.current?.scrollTo(target, {
      offset: -88, // navbar offset
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    })
  }, [])

  const stop = useCallback(() => lenisRef.current?.stop(), [])
  const start = useCallback(() => lenisRef.current?.start(), [])

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef, scrollTo, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
