/**
 * SceneManager — Global React Three Fiber canvas.
 *
 * A single persistent <Canvas> overlays the entire page.
 * Individual 3D scenes are conditionally rendered based on scroll position.
 * This prevents multiple WebGL contexts (which crash mobile).
 *
 * Mobile strategy:
 *   - Tier 2 mobile: render only HeroScene3D (lightweight)
 *   - Tier 3 / no WebGL: return null (CSS fallbacks in each section)
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Preload } from '@react-three/drei'
import { useDevice } from '../../hooks/useDevice'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { useBloom } from '../../lib/bloomStore'
import { setInkFailed } from '../../lib/inkStore'

// Lazy-load heavy 3D scenes
// Start fetching the hero scene immediately (it is visible on first paint)
const heroSceneImport = import('./HeroScene3D')
const HeroScene3D = lazy(() => heroSceneImport)
const InkRoots = lazy(() => import('./InkRoots'))

/**
 * Tracks which sections are near the viewport so we only render
 * the 3D scene that's currently relevant.
 */
function useVisibleSections() {
  const [visible, setVisible] = useState(new Set(['home']))

  useEffect(() => {
    const sectionIds = ['home', 'about', 'experience', 'skills', 'projects', 'contact']
    const observers = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const io = new IntersectionObserver(
        ([entry]) => {
          setVisible((prev) => {
            const next = new Set(prev)
            if (entry.isIntersecting) {
              next.add(id)
            } else {
              next.delete(id)
            }
            return next
          })
        },
        {
          rootMargin: '200px 0px 200px 0px', // pre-load slightly off-screen
          threshold: 0,
        }
      )
      io.observe(el)
      observers.push(io)
    })

    return () => observers.forEach((io) => io.disconnect())
  }, [])

  return visible
}

function SceneContents() {
  const visible = useVisibleSections()

  return (
    <>
      {/* Ambient environment */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />

      {/* Hero scene — always rendered (lightweight enough for mobile) */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {visible.has('home') && <HeroScene3D />}
        </Suspense>
      </ErrorBoundary>

      {/* About: Ink Bloom layer (HUD pass, also on mobile) */}
        <ErrorBoundary onError={setInkFailed}>
          <Suspense fallback={null}>{visible.has('about') && <InkRoots />}</Suspense>
        </ErrorBoundary>

        {/* (No post-processing: the ink layer renders its own HUD pass on top) */}

        <Preload all />
      </>
      )
}

      export default function SceneManager() {
  const device = useDevice()
  const ready = useBloom((s) => s.ready)

  // Warm the About scene's code once the hero is on screen and the main thread is idle,
  // so scrolling (or jumping) into About never shows an empty frame while it downloads.
  useEffect(() => {
    if (!ready || !device?.is3DEnabled) return
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200))
      const cancel = window.cancelIdleCallback || clearTimeout
    const id = idle(() => import('./InkRoots'), {timeout: 4000 })
    return () => cancel(id)
  }, [ready, device])

      // Adaptive resolution: start crisp, step down if the frame rate struggles
      const maxDpr = Math.min(window.devicePixelRatio || 1, device?.tier === 1 ? 2 : 1.5)
      const [dpr, setDpr] = useState(maxDpr)

      // Don't render Canvas on low-end devices or if WebGL is unavailable
      if (!device || !device.is3DEnabled) return null

      return (
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ isolation: 'isolate' }}
        aria-hidden="true"
      >
        <Canvas
          eventSource={document.getElementById('root')}
          eventPrefix="client"
          dpr={dpr}
          camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
          gl={{
            antialias: device.config.antialias,
            alpha: true,
            powerPreference: device.isMobile ? 'low-power' : 'high-performance',
            stencil: false,
            localClippingEnabled: true, // hero name reveal uses clipping planes
            depth: true,
          }}
          style={{ background: "transparent" }}
          flat
        >
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(maxDpr)}
            onFallback={() => setDpr(1)}
          >
            <SceneContents />
          </PerformanceMonitor>
        </Canvas>
      </div>
      )
}
