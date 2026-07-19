/**
 * useDevice — Device capability detection hook.
 *
 * Detects GPU tier, mobile/desktop, touch support, and WebGL availability.
 * Returns a tier (1=high, 2=mid, 3=low) that controls 3D scene quality.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DeviceContext = createContext(null)

function detectCapabilities() {
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const cores = navigator.hardwareConcurrency || 2
  const dpr = window.devicePixelRatio || 1
  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  ).matches

  // WebGL detection
  let webglAvailable = false
  let webgl2Available = false
  let gpuRenderer = ''
  try {
    const canvas = document.createElement('canvas')
    const gl2 = canvas.getContext('webgl2')
    if (gl2) {
      webgl2Available = true
      webglAvailable = true
      const dbg = gl2.getExtension('WEBGL_debug_renderer_info')
      if (dbg) gpuRenderer = gl2.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
    } else {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      webglAvailable = !!gl
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info')
        if (dbg) gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
      }
    }
  } catch {
    // WebGL not available
  }

  // Detect low-end GPU keywords
  const isLowEndGPU = /swiftshader|software|llvmpipe|mesa/i.test(gpuRenderer)

  // Determine tier
  let tier = 2 // default mid
  if (prefersReducedMotion || !webglAvailable || isLowEndGPU) {
    tier = 3
  } else if (isMobile || cores <= 2 || (!webgl2Available && dpr <= 1)) {
    tier = 3
  } else if (cores >= 8 && webgl2Available && dpr >= 1.5 && !isMobile) {
    tier = 1
  }

  return {
    tier,
    isMobile,
    isTouch,
    cores,
    dpr: Math.min(dpr, 2), // cap at 2x for R3F
    webglAvailable,
    webgl2Available,
    gpuRenderer,
    prefersReducedMotion,
  }
}

/**
 * Tier-based configuration for 3D scenes.
 */
export const TIER_CONFIG = {
  1: {
    particleCount: 5000,
    dpr: [1, 2],
    shadows: true,
    postProcessing: true,
    bloomIntensity: 0.6,
    antialias: true,
  },
  2: {
    particleCount: 2000,
    dpr: [1, 1.5],
    shadows: false,
    postProcessing: true,
    bloomIntensity: 0.4,
    antialias: false,
  },
  3: {
    particleCount: 0, // No 3D particles — use CSS fallback
    dpr: [1, 1],
    shadows: false,
    postProcessing: false,
    bloomIntensity: 0,
    antialias: false,
  },
}

export function DeviceProvider({ children }) {
  const [capabilities, setCapabilities] = useState(null)

  useEffect(() => {
    setCapabilities(detectCapabilities())
  }, [])

  const value = useMemo(() => {
    if (!capabilities) return null
    return {
      ...capabilities,
      config: TIER_CONFIG[capabilities.tier],
      is3DEnabled: capabilities.tier <= 2 && capabilities.webglAvailable,
    }
  }, [capabilities])

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}

export function useDevice() {
  return useContext(DeviceContext)
}
