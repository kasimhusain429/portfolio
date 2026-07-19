/**
 * App.jsx — Root application with providers and global systems.
 *
 * Architecture:
 *   ThemeProvider → DeviceProvider → SmoothScrollProvider
 *     → SceneManager (persistent R3F Canvas)
 *     → CustomCursor
 *     → AnimatedRoutes (page content)
 */
import { lazy, Suspense, useState, useCallback } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './providers/ThemeProvider'
import { DeviceProvider } from './hooks/useDevice'
import { SmoothScrollProvider } from './providers/SmoothScrollProvider'
import Home from './pages/Home'
import Preloader from './components/Preloader'

// Lazy-load heavy 3D layer
const SceneManager = lazy(() => import('./components/3d/SceneManager'))
const CustomCursor = lazy(() => import('./components/ui/CustomCursor'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))

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
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/projects"
          element={
            <Suspense fallback={<div className="min-h-screen bg-app" />}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <ProjectsPage />
              </motion.div>
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const onPreloaderComplete = useCallback(() => setLoaded(true), [])

  return (
    <ThemeProvider>
      <DeviceProvider>
        <BrowserRouter>
          <SmoothScrollProvider>
            {/* Preloader */}
            {!loaded && <Preloader onComplete={onPreloaderComplete} />}

            {/* Persistent 3D Canvas — renders behind all HTML content */}
            <Suspense fallback={null}>
              <SceneManager />
            </Suspense>

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
    </ThemeProvider>
  )
}
