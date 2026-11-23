/**
 * SmoothScrollProvider: Lenis inertial scrolling on one requestAnimationFrame loop.
 *
 * Respects prefers-reduced-motion: wheel smoothing is off and programmatic
 * scrolls jump instead of gliding. (GSAP was only used to drive this loop, so it is gone.)
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import Lenis from 'lenis'

const SmoothScrollContext = createContext(null)
const easeOutExpo = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduce = prefersReduced()
    const lenis = new Lenis({
      duration: 1.2,
      easing: easeOutExpo,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !reduce,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    })

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
      easing: easeOutExpo,
      immediate: prefersReduced(),
      ...options,
    })
  }, [])

  const stop = useCallback(() => lenisRef.current?.stop(), [])
  const start = useCallback(() => lenisRef.current?.start(), [])
  const value = useMemo(() => ({ lenis: lenisRef, scrollTo, stop, start }), [scrollTo, stop, start])

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}
