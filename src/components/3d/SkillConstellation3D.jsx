import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Skill node data with 3D positions ─────────────────── */
const SKILL_NODES = [
  { id: 'react', name: 'React.js', value: 95, category: 'frontend', pos: [-3, 1.5, 0] },
  { id: 'nextjs', name: 'Next.js', value: 88, category: 'frontend', pos: [-4, 0, -1] },
  { id: 'typescript', name: 'TypeScript', value: 82, category: 'frontend', pos: [-2.5, -1, 0.5] },
  { id: 'tailwind', name: 'Tailwind', value: 93, category: 'frontend', pos: [-4.5, 1, 1] },
  { id: 'javascript', name: 'JavaScript', value: 92, category: 'frontend', pos: [-2, 0.5, -0.8] },

  { id: 'redux', name: 'Redux', value: 84, category: 'state', pos: [0, 1.5, 0.5] },
  { id: 'reactquery', name: 'React Query', value: 80, category: 'state', pos: [1, 0, -0.5] },
  { id: 'context', name: 'Context API', value: 90, category: 'state', pos: [-0.5, -0.5, 1] },
  { id: 'restapi', name: 'REST APIs', value: 88, category: 'state', pos: [0.5, -1.5, 0] },
  { id: 'axios', name: 'Axios', value: 86, category: 'state', pos: [1.5, 1, 0.8] },

  { id: 'git', name: 'Git', value: 90, category: 'tools', pos: [3.5, 1, -0.5] },
  { id: 'figma', name: 'Figma→Code', value: 88, category: 'tools', pos: [4, -0.5, 0.5] },
  { id: 'vite', name: 'Vite', value: 82, category: 'tools', pos: [3, -1.5, -0.3] },
  { id: 'framer', name: 'Framer Motion', value: 85, category: 'tools', pos: [4.5, 0.5, 1] },
  { id: 'nodejs', name: 'Node.js', value: 68, category: 'tools', pos: [2.5, 0, -1] },
]

const CONNECTIONS = [
  ['react', 'nextjs'], ['react', 'typescript'], ['react', 'redux'],
  ['react', 'context'], ['react', 'tailwind'], ['nextjs', 'typescript'],
  ['redux', 'reactquery'], ['redux', 'context'], ['restapi', 'axios'],
  ['restapi', 'reactquery'], ['javascript', 'typescript'], ['javascript', 'react'],
  ['git', 'figma'], ['vite', 'react'], ['framer', 'react'],
  ['tailwind', 'figma'], ['nodejs', 'restapi'], ['axios', 'restapi'],
]

const BASE_COLOR = new THREE.Color('#333333')
const ACCENT_COLOR = new THREE.Color('#00E5FF')

/* ─── Individual Skill Node ──────────────────────────────── */
function SkillNode({ node, delay, onHover }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const size = 0.08 + (node.value / 100) * 0.15

  useFrame((state) => {
    if (!meshRef.current) return
    // Gentle float
    meshRef.current.position.y =
      node.pos[1] + Math.sin(state.clock.elapsedTime * 0.8 + node.pos[0]) * 0.08
    // Pulse on hover
    const targetScale = hovered ? size * 2.0 : size
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    )
    
    // Lerp color
    const targetColor = hovered ? ACCENT_COLOR : BASE_COLOR
    meshRef.current.material.color.lerp(targetColor, 0.1)
    meshRef.current.material.emissive.lerp(targetColor, 0.1)
  })

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.pos}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHover?.(node)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          onHover?.(null)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={BASE_COLOR}
          emissive={BASE_COLOR}
          emissiveIntensity={hovered ? 2 : 0.2}
          transparent
          opacity={0.9}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <Html position={[node.pos[0], node.pos[1] + 0.5, node.pos[2]]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-xl border border-[#00E5FF]/30 bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(0,229,255,0.2)] backdrop-blur-md">
            {node.name}
            <span className="ml-2 text-[#00E5FF]">{node.value}%</span>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ─── Connection Lines ───────────────────────────────────── */
function ConnectionLines({ hoveredNode }) {
  const linesRef = useRef()

  const { positions, colors } = useMemo(() => {
    const pos = []
    const col = []
    const nodeMap = Object.fromEntries(SKILL_NODES.map((n) => [n.id, n]))

    CONNECTIONS.forEach(([from, to]) => {
      const a = nodeMap[from]
      const b = nodeMap[to]
      if (!a || !b) return
      pos.push(a.pos[0], a.pos[1], a.pos[2])
      pos.push(b.pos[0], b.pos[1], b.pos[2])
      
      col.push(BASE_COLOR.r, BASE_COLOR.g, BASE_COLOR.b)
      col.push(BASE_COLOR.r, BASE_COLOR.g, BASE_COLOR.b)
    })

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    }
  }, [])

  useFrame((state) => {
    if (!linesRef.current) return
    // Fade in lines
    const targetOpacity = hoveredNode ? 0.35 : 0.15
    linesRef.current.material.opacity = THREE.MathUtils.lerp(
      linesRef.current.material.opacity, 
      targetOpacity, 
      0.05
    )
    
    const colorsAttr = linesRef.current.geometry.attributes.color
    const t = state.clock.elapsedTime

    // Highlight lines connected to hovered node with pulsing wave
    if (hoveredNode) {
      let i = 0
      CONNECTIONS.forEach(([from, to]) => {
        const isConnected = from === hoveredNode.id || to === hoveredNode.id
        
        if (isConnected) {
          // Traveling pulse wave: sine oscillation from source to destination vertex
          const pulse1 = Math.sin(t * 4) * 0.5 + 0.5
          const pulse2 = Math.sin(t * 4 - 1.5) * 0.5 + 0.5
          
          const c1 = BASE_COLOR.clone().lerp(ACCENT_COLOR, pulse1)
          const c2 = BASE_COLOR.clone().lerp(ACCENT_COLOR, pulse2)
          
          colorsAttr.setXYZ(i * 2, c1.r, c1.g, c1.b)
          colorsAttr.setXYZ(i * 2 + 1, c2.r, c2.g, c2.b)
        } else {
          colorsAttr.setXYZ(i * 2, BASE_COLOR.r, BASE_COLOR.g, BASE_COLOR.b)
          colorsAttr.setXYZ(i * 2 + 1, BASE_COLOR.r, BASE_COLOR.g, BASE_COLOR.b)
        }
        i++
      })
      colorsAttr.needsUpdate = true
    } else {
       for(let i=0; i<colorsAttr.count; i++) {
         colorsAttr.setXYZ(i, BASE_COLOR.r, BASE_COLOR.g, BASE_COLOR.b)
       }
       colorsAttr.needsUpdate = true
    }
  })

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

/* ─── Main Constellation Scene ───────────────────────────── */
export default function SkillConstellation3D() {
  const groupRef = useRef()
  const [hoveredNode, setHoveredNode] = useState(null)

  // Robust scroll tracking without GSAP lazy-load issues
  useFrame(() => {
    if (!groupRef.current) return
    const el = document.getElementById('skills')
    if (!el) return
    
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    
    // Check if #skills is visible in the viewport
    const visible = rect.top < vh && rect.bottom > 0
    if (!visible) {
       groupRef.current.position.y = -10
       return
    }

    // Scroll progress: 0 when just entering bottom, 1 when just leaving top
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh)))
    
    // Force hide if it's almost out of the screen to prevent overlap with the next sticky section
    if (progress > 0.9) {
      groupRef.current.visible = false
      return
    }
    
    groupRef.current.visible = true
    
    let targetY = -3
    if (progress < 0.3) {
      // Entrance: animate y from -10 to -3
      targetY = THREE.MathUtils.lerp(-10, -3, progress / 0.3)
    } else if (progress > 0.7) {
      // Exit: animate y from -3 to +20 (move up completely out of screen much faster)
      targetY = THREE.MathUtils.lerp(-3, 20, (progress - 0.7) / 0.3)
    }
    
    // Animate rotation to rotate the constellation as user scrolls
    const targetRotY = progress * Math.PI
    
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
  })

  const onHover = useCallback((node) => setHoveredNode(node), [])

  return (
    <group ref={groupRef} position={[0, -10, -10]}>
      <ConnectionLines hoveredNode={hoveredNode} />
      {SKILL_NODES.map((node, i) => (
        <SkillNode
          key={node.id}
          node={node}
          delay={i * 0.05}
          onHover={onHover}
        />
      ))}
    </group>
  )
}
