/**
 * App.jsx — Root application with providers and global systems.
 *
 * Architecture:
 *   DeviceProvider → SmoothScrollProvider
 *     → SceneManager (persistent R3F Canvas)
 *     → CustomCursor
 *     → AnimatedRoutes (page content)
 */
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { DeviceProvider } from './hooks/useDevice'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import Home from './pages/Home'
import Preloader from './components/Preloader'
import HueField from './components/HueField'
import JourneyRail from './components/JourneyRail'
import NotFound from './pages/NotFound'
import { DUR, EASE } from './lib/motion'

// Lazy-load heavy 3D layer
const SceneManager = lazy(() => import('./components/3d/SceneManager'))
const CustomCursor = lazy(() => import('./components/ui/CustomCursor'))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: DUR.fast, ease: EASE.out }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

function HomeLayers() {
  const { pathname } = useLocation()
  if (pathname !== '/') return null
  return (
    <>
      {/* Seed preloader: waits for fonts + the 3D scene's first frames, then blooms open */}
      <Preloader />
      {/* Persistent 3D Canvas — renders behind all HTML content */}
      <Suspense fallback={null}>
        <SceneManager />
      </Suspense>
      {/* Section rail that travels with you (large screens) */}
      <JourneyRail />
    </>
  )
}

export default function App() {

  return (
    // reducedMotion="user": every Framer animation drops its transforms when the OS asks for less motion
    <MotionConfig reducedMotion="user">
      <DeviceProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SmoothScrollProvider>
            {/* The night sky behind the dark sections: hues hand off as you scroll */}
            <HueField />

            {/* Preloader, 3D canvas and section rail belong to the home page only (not the 404) */}
            <HomeLayers />

            {/* Custom cursor — desktop only */}
            <Suspense fallback={null}>
              <CustomCursor />
            </Suspense>

            {/* Page content */}
            <div className="relative z-10">
              <AnimatedRoutes />
            </div>
          </SmoothScrollProvider>
        </BrowserRouter>
      </DeviceProvider>
    </MotionConfig>
  )
}
