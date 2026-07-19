import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Image, Text, Float, MeshReflectorMaterial, Sparkles, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { projects } from '../../data/projects'
import { ErrorBoundary } from '../ui/ErrorBoundary'

/**
 * Text scramble effect — characters randomly shuffle before resolving
 */
function useTextScramble(text, active) {
  const [display, setDisplay] = useState(text)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'
  const frameRef = useRef(null)
  const iterRef = useRef(0)

  useEffect(() => {
    if (!active) {
      setDisplay(text)
      iterRef.current = 0
      return
    }

    iterRef.current = 0
    const maxIters = text.length * 3

    const scramble = () => {
      iterRef.current++
      const progress = iterRef.current / maxIters

      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' '
            // Characters resolve left-to-right
            if (i / text.length < progress) return char
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )

      if (iterRef.current < maxIters) {
        frameRef.current = requestAnimationFrame(scramble)
      }
    }

    frameRef.current = requestAnimationFrame(scramble)
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, text])

  return display
}

function ProjectCard({ project, index }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const textGroupRef = useRef()
  const frameRef = useRef()
  const { camera } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const [isFocused, setIsFocused] = useState(false)

  // Cinematic Layout: Alternate slightly left and right
  const isLeft = index % 2 === 0
  const x = isLeft ? -1.8 : 1.8
  const z = -index * 30
  const yOffset = isLeft ? 0.4 : -0.4

  // Text scramble for project title
  const scrambledTitle = useTextScramble(project.title.toUpperCase(), isFocused)
  const scrambledRole = useTextScramble(project.role || 'PROJECT', isFocused)

  useFrame(() => {
    if (!groupRef.current) return

    groupRef.current.getWorldPosition(v)
    const distToCamera = camera.position.z - v.z

    const focalDistance = 12
    const depthOfField = 15
    const diff = Math.abs(distToCamera - focalDistance)
    const focusProgress = Math.max(0, 1 - (diff / depthOfField))

    // Track focus state for text scramble
    const focused = focusProgress > 0.5
    if (focused !== isFocused) setIsFocused(focused)

    const targetScale = 1 + focusProgress * 0.15
    const targetOpacity = 0.05 + focusProgress * 0.95

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1)

    if (meshRef.current) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, targetOpacity, 0.1)
    }
    if (frameRef.current) {
      frameRef.current.material.opacity = THREE.MathUtils.lerp(frameRef.current.material.opacity, targetOpacity, 0.1)
      frameRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(frameRef.current.material.emissiveIntensity, focusProgress * 1.5, 0.1)
    }

    if (textGroupRef.current) {
      const textOpacity = Math.max(0, (focusProgress - 0.4) * 2.5)
      // Iterate over children to set fill opacity
      textGroupRef.current.children.forEach(child => {
        if (child.fillOpacity !== undefined) {
          child.fillOpacity = THREE.MathUtils.lerp(child.fillOpacity, textOpacity, 0.1)
        }
      })
      textGroupRef.current.position.lerp(new THREE.Vector3(0, -3.2 + focusProgress * 0.4, 0), 0.1)
    }
  })

  return (
    <group position={[x, yOffset, z]}>
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.15} floatingRange={[-0.05, 0.05]}>
        <group ref={groupRef} onClick={() => window.open(project.live, '_blank')} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>

          <ErrorBoundary fallback={
            <mesh scale={[7, 4.4, 1]}>
              <planeGeometry />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          }>

            {/* Glassmorphic Frame */}
            <RoundedBox ref={frameRef} args={[7.3, 4.7, 0.15]} radius={0.05} smoothness={4} position={[0, 0, -0.08]}>
              <meshStandardMaterial
                color="#0a0a0a"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={0.1}
                emissive="#00E5FF"
                emissiveIntensity={0}
              />
            </RoundedBox>

            <React.Suspense fallback={
              <mesh scale={[7, 4.4, 1]}>
                <planeGeometry />
                <meshBasicMaterial color="#111111" />
              </mesh>
            }>
              <Image
                ref={meshRef}
                url={project.image}
                transparent
                opacity={0.1}
                scale={[7, 4.4]}
              />
            </React.Suspense>

            <React.Suspense fallback={null}>
              <group ref={textGroupRef} position={[0, -3.2, 0.1]}>
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.4}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  fillOpacity={0}
                  fontWeight="bold"
                >
                  {scrambledTitle}
                </Text>
                <Text
                  position={[0, -0.5, 0]}
                  fontSize={0.18}
                  color="#00E5FF"
                  anchorX="center"
                  anchorY="middle"
                  fillOpacity={0}
                  letterSpacing={0.2}
                  fontWeight="bold"
                >
                  {scrambledRole}
                </Text>
              </group>
            </React.Suspense>

          </ErrorBoundary>
        </group>
      </Float>
    </group>
  )
}

export default function ProjectGallery3D() {
  const groupRef = useRef()
  const spotLightARef = useRef()
  const spotLightBRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const el = document.getElementById('projects')
    if (!el) return

    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight

    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - vh)))
    const entranceProgress = Math.max(0, Math.min(1, (vh - rect.top) / vh))

    // Entrance: fly up from below
    const targetY = THREE.MathUtils.lerp(-20, 0, Math.min(entranceProgress * 1.5, 1))

    // Fly-through depth
    const maxZ = (projects.length - 1) * 30 + 35
    const targetZ = progress * maxZ

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08)

    // Animated spotlight panning for dynamic reflections
    const t = state.clock.elapsedTime
    if (spotLightARef.current) {
      spotLightARef.current.position.x = Math.sin(t * 0.3) * 20
      spotLightARef.current.position.z = Math.cos(t * 0.2) * 30 - 30
    }
    if (spotLightBRef.current) {
      spotLightBRef.current.position.x = Math.cos(t * 0.25) * 20
      spotLightBRef.current.position.z = Math.sin(t * 0.15) * 30 - 50
    }

    // Exit cinematic: tilt camera up when past the last project
    if (progress > 0.85) {
      const exitProgress = (progress - 0.85) / 0.15
      const targetRotX = -exitProgress * 0.3
      state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.05)
    } else {
      state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, 0, 0.05)
    }
  })

  return (
    <>
      {/* Atmospheric Fog */}
      <fog attach="fog" args={['#050505', 15, 60]} />

      <group ref={groupRef} position={[0, -20, 0]}>
        {/* Particles for depth */}
        <Sparkles count={400} scale={[40, 20, 100]} position={[0, 0, -40]} size={3} speed={0.2} opacity={0.3} color="#00E5FF" />

        {/* Premium Reflective Floor */}
        <mesh position={[0, -4.5, -40]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[150, 200]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={100}
            roughness={0.8}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.6}
          />
        </mesh>

        <ambientLight intensity={0.4} />

        {/* Animated spotlights that pan for dynamic reflections */}
        <spotLight ref={spotLightARef} position={[-15, 20, 10]} intensity={3} penumbra={1} color="#00E5FF" distance={100} />
        <spotLight ref={spotLightBRef} position={[15, 20, -50]} intensity={3} penumbra={1} color="#FF00E5" distance={100} />

        {projects.map((project, idx) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={idx}
          />
        ))}
      </group>
    </>
  )
}
