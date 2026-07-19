import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

export default function ContactPortal3D() {
  const groupRef = useRef()
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('contact')
      if (!el) return
      
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      
      // Calculate how far the contact section is from the bottom of the screen
      // 0 = just entered from bottom, 1 = reached the top of viewport
      scrollRef.current = Math.max(0, Math.min(1, (vh - rect.top) / vh))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    // Animate the liquid metal mass rising up from below as the user scrolls into the contact section
    // When scrollRef is 0 (not visible), it stays hidden at y=-20
    // When scrollRef approaches 1, it smoothly rises to y=-4
    const targetY = THREE.MathUtils.lerp(-20, -4, scrollRef.current)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)
    
    // Slowly rotate the entire mass for a calm, oceanic feel
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    groupRef.current.rotation.z = state.clock.elapsedTime * 0.02
  })

  return (
    <group ref={groupRef} position={[0, -20, -10]}>
      
      {/* Dramatic Cinematic Lighting to reflect off the liquid metal */}
      <ambientLight intensity={0.1} />
      
      {/* Cyan Highlight */}
      <directionalLight position={[-10, 10, 10]} intensity={4} color="#00E5FF" />
      
      {/* Magenta Fill Light from below/side */}
      <directionalLight position={[10, -5, -5]} intensity={2.5} color="#FF00E5" />
      
      {/* Bright top rim light */}
      <spotLight position={[0, 15, 0]} intensity={5} penumbra={0.5} color="#ffffff" distance={40} angle={0.8} />

      {/* Floating particles to add depth over the liquid surface */}
      <Sparkles count={150} scale={[20, 10, 20]} position={[0, 6, 0]} size={3} speed={0.4} opacity={0.3} color="#00E5FF" />

      {/* The Liquid Metal Surface */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          {/* High poly sphere for smooth fluid distortion */}
          <sphereGeometry args={[8, 128, 128]} />
          <MeshDistortMaterial
            color="#020202"          // Deep obsidian base
            metalness={1.0}          // Absolute mirror reflection
            roughness={0.15}         // Very glossy, slight blur for realism
            distort={0.4}            // Strength of the fluid ripples
            speed={1.5}              // Speed of the ripples
            clearcoat={1}            // Adds an extra layer of liquid gloss
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
      
    </group>
  )
}
