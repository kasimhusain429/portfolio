/**
 * SceneManager — Global React Three Fiber canvas.
 *
 * A single persistent <Canvas> overlays the entire page.
 * Individual 3D scenes are conditionally rendered based on scroll position.
 * This prevents multiple WebGL contexts (which crash mobile).
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useDevice } from '../../hooks/useDevice'
import { ErrorBoundary } from '../ui/ErrorBoundary'

// Lazy-load heavy 3D scenes
const HeroScene3D = lazy(() => import('./HeroScene3D'))
const SkillConstellation3D = lazy(() => import('./SkillConstellation3D'))
const ContactPortal3D = lazy(() => import('./ContactPortal3D'))
const ProjectGallery3D = lazy(() => import('./ProjectGallery3D'))

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

function SceneContents({ postProcessing, bloomIntensity }) {
  const visible = useVisibleSections()

  return (
    <>
      {/* Ambient environment */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.3} />

      {/* Conditionally render scenes based on scroll position */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {visible.has('home') && <HeroScene3D />}
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          {visible.has('skills') && <SkillConstellation3D />}
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          {visible.has('projects') && <ProjectGallery3D />}
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          {visible.has('contact') && <ContactPortal3D />}
        </Suspense>
      </ErrorBoundary>

      {/* Post-processing — tier-gated */}
      {postProcessing && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            radius={0.8}
            mipmapBlur
          />
          <Vignette offset={0.3} darkness={0.7} />
        </EffectComposer>
      )}

      <Preload all />
    </>
  )
}

export default function SceneManager() {
  const device = useDevice()

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
        dpr={device.config.dpr}
        camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
        gl={{
          antialias: device.config.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        flat
      >
        <SceneContents
          postProcessing={device.config.postProcessing}
          bloomIntensity={device.config.bloomIntensity}
        />
      </Canvas>
    </div>
  )
}
