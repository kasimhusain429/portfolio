/**
 * useSectionScroll — tracks a pinned section's scroll progress directly from
 * getBoundingClientRect() across native scroll, Lenis, and mobile viewport shifts.
 *
 * Returns { progress, enter }:
 *   - progress: 0..1 across the pinned scroll ('start start' -> 'end end')
 *   - enter:    0..1 as the section enters the viewport ('start end' -> 'start start')
 */
import { useEffect } from 'react'
import { useMotionValue } from 'framer-motion'
import { useSmoothScroll } from '../providers/SmoothScrollProvider'
import { clamp01 } from '../lib/motion'

export function useSectionScroll(sectionRef) {
  const progress = useMotionValue(0)
  const enter = useMotionValue(0)
  const smooth = useSmoothScroll()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    let raf = 0
    const measure = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.visualViewport?.height || window.innerHeight || 1
      const travel = Math.max(1, rect.height - vh)
      const nextP = clamp01(-rect.top / travel)
      const nextE = clamp01((vh - rect.top) / Math.max(1, vh))
      if (nextP !== progress.get()) progress.set(nextP)
      if (nextE !== enter.get()) enter.set(nextE)
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }

    measure()
    const offLenis = smooth?.onScroll?.(schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    ro.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    window.visualViewport?.addEventListener('resize', schedule, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      offLenis?.()
      ro.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [sectionRef, progress, enter, smooth])

  return { progress, enter }
}
