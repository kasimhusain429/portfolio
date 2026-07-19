import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevice } from '../../hooks/useDevice'

/* ─── Infinite Grid (desktop only) ───────────────────────── */
function InfiniteGrid() {
  const meshRef = useRef()
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY / (window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const gridMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.6 },
          uColor: { value: new THREE.Color('#0a192f') },
          uAccent: { value: new THREE.Color('#00E5FF') },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uOpacity;
          uniform vec3 uColor;
          uniform vec3 uAccent;
          varying vec2 vUv;
          varying vec3 vWorldPos;

          float grid(vec2 p, float spacing) {
            vec2 g = abs(fract(p / spacing - 0.5) - 0.5) / fwidth(p / spacing);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }

          void main() {
            float g = grid(vWorldPos.xz, 2.0);
            float dist = length(vWorldPos.xz) * 0.04;
            float fade = exp(-dist * dist);
            
            float pulse = sin(length(vWorldPos.xz) * 0.5 - uTime * 2.0);
            pulse = smoothstep(0.8, 1.0, pulse);
            
            vec3 finalColor = mix(uColor, uAccent, pulse);
            float alpha = g * fade * uOpacity * (1.0 + pulse * 2.0);

            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
      }),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return
    gridMaterial.uniforms.uTime.value = state.clock.elapsedTime
    gridMaterial.uniforms.uOpacity.value = Math.max(0, 0.6 - scrollRef.current * 0.6)
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -5]} material={gridMaterial}>
      <planeGeometry args={[60, 60, 1, 1]} />
    </mesh>
  )
}

/* ─── Morphing Icosahedron ───────────────────────────────── */
function MorphingIcosahedron({ isMobile }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const groupRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, prevX: 0, prevY: 0 })

  // Reduce geometry detail on mobile
  const geoDetail = isMobile ? 12 : 24
  const wireDetail = isMobile ? 4 : 6
  const sphereSize = isMobile ? 1.8 : 2.2
  const wireSize = isMobile ? 1.85 : 2.25
  const coreSize = isMobile ? 1.4 : 1.8

  // Custom noise-driven displacement shader
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uDistort: { value: isMobile ? 0.2 : 0.3 },
          uMouseVelocity: { value: 0 },
          uColor1: { value: new THREE.Color('#020810') },
          uColor2: { value: new THREE.Color('#00E5FF') },
          uOpacity: { value: 0.85 },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uDistort;
          uniform float uMouseVelocity;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vDisplacement;

          // Simplex 3D noise
          vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 1.0/7.0;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x4 = x_ * ns.x + ns.yyyy;
            vec4 y4 = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x4) - abs(y4);
            vec4 b0 = vec4(x4.xy, y4.xy);
            vec4 b1 = vec4(x4.zw, y4.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          void main() {
            vNormal = normalize(normalMatrix * normal);
            
            float distortionStrength = uDistort + uMouseVelocity * 0.8;
            float noise = snoise(position * 1.5 + uTime * 0.4) * distortionStrength;
            float noise2 = snoise(position * 3.0 - uTime * 0.6) * distortionStrength * 0.3;
            
            vDisplacement = noise + noise2;
            vec3 newPos = position + normal * (noise + noise2);
            vPosition = newPos;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uOpacity;
          uniform float uMouseVelocity;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying float vDisplacement;

          void main() {
            // Fresnel rim lighting
            vec3 viewDir = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
            
            // Mix colors based on displacement + fresnel
            float colorMix = smoothstep(-0.3, 0.3, vDisplacement) * 0.6 + fresnel * 0.4;
            vec3 color = mix(uColor1, uColor2, colorMix);
            
            // Add rim glow
            color += uColor2 * fresnel * (0.4 + uMouseVelocity * 0.6);
            
            float alpha = uOpacity + fresnel * 0.15;
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    [isMobile]
  )

  useEffect(() => {
    const onMove = (e) => {
      // Use first touch for touch devices
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      const nx = (clientX / window.innerWidth) * 2 - 1
      const ny = -(clientY / window.innerHeight) * 2 + 1
      mouseRef.current.vx = (nx - mouseRef.current.x) * 8
      mouseRef.current.vy = (ny - mouseRef.current.y) * 8
      mouseRef.current.x = nx
      mouseRef.current.y = ny
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return

    const el = document.getElementById('home')
    let progress = 0
    if (el) {
      const rect = el.getBoundingClientRect()
      progress = Math.max(0, Math.min(1, -rect.top / rect.height))
    }

    // Mouse velocity magnitude (decays each frame)
    const velocity = Math.sqrt(
      mouseRef.current.vx ** 2 + mouseRef.current.vy ** 2
    )
    mouseRef.current.vx *= 0.92
    mouseRef.current.vy *= 0.92
    const clampedVelocity = Math.min(velocity, 2)

    // Update uniforms
    shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime
    shaderMaterial.uniforms.uMouseVelocity.value = THREE.MathUtils.lerp(
      shaderMaterial.uniforms.uMouseVelocity.value,
      clampedVelocity,
      0.1
    )

    // Subtle tilt toward mouse (reduced on mobile)
    const tiltFactor = isMobile ? 0.08 : 0.15
    const targetRotX = mouseRef.current.y * tiltFactor - progress * 0.5
    const targetRotY = mouseRef.current.x * tiltFactor + state.clock.elapsedTime * 0.08
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06)

    // Float + scroll-driven exit
    const floatY = Math.sin(state.clock.elapsedTime * 1.2) * 0.12
    const flyY = Math.pow(progress, 3) * 18
    const flyZ = -4 - progress * 10

    groupRef.current.position.y = floatY + flyY + 0.3
    groupRef.current.position.z = flyZ

    // Scale down on scroll
    const targetScale = THREE.MathUtils.lerp(1, 0.3, progress)
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08)
    )

    // Opacity fade on scroll
    shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.85, 0, progress)
  })

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 1.8, 0.3, -4]}>
      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.3}>
        {/* Solid morphing body */}
        <mesh ref={meshRef} material={shaderMaterial}>
          <icosahedronGeometry args={[sphereSize, geoDetail]} />
        </mesh>

        {/* Wireframe overlay — cyan accent lines */}
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[wireSize, wireDetail]} />
          <meshBasicMaterial
            color="#00E5FF"
            wireframe
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>

        {/* Inner glow core */}
        <mesh>
          <icosahedronGeometry args={[coreSize, isMobile ? 6 : 12]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.03}
          />
        </mesh>
      </Float>
    </group>
  )
}

/* ─── Main Hero Scene ─────────────────────────────────── */
export default function HeroScene3D() {
  const { camera } = useThree()
  const groupRef = useRef()
  const device = useDevice()
  const isMobile = device?.isMobile || false

  useFrame(() => {
    const el = document.getElementById('home')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
    
    // Camera dolly out slightly on scroll
    const targetZ = THREE.MathUtils.lerp(8, 12, progress)
    const targetY = THREE.MathUtils.lerp(0, 2, progress)
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.1)
  })

  return (
    <group ref={groupRef}>
      {/* InfiniteGrid is too shader-heavy for mobile */}
      {!isMobile && <InfiniteGrid />}
      <MorphingIcosahedron isMobile={isMobile} />
    </group>
  )
}
