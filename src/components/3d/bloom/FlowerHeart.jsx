/**
 * FlowerHeart: the centre of the bloom. A small glowing pistil ringed by
 * stamens (cream filaments, soft gold anthers), the one warm note in an
 * otherwise single-hue flower. It beats softly and flares while the flower is
 * held. As the hero scrolls away the stamens fold in and the pistil condenses
 * into the seed that the About section's ink layer catches (ink.heroSeed).
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import * as THREE from 'three'
import { ink } from '../../../lib/inkStore'
import * as palette from '../../../lib/palette'
import { radialTexture, rand, range, smooth, spring } from './helpers'

const STAMEN_H = 0.48
const ANTHER_TOP = STAMEN_H + 0.07
const color = (hex) => new THREE.Color(hex)
const _seed = new THREE.Vector3()

/** vertex colours: `bottom` → `top` between heights y0 and y1 */
function paint(geometry, bottom, top, y0, y1) {
  const p = geometry.attributes.position
  const colors = new Float32Array(p.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < p.count; i++) {
    c.copy(bottom).lerp(top, range(p.getY(i), y0, y1))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

/** arc a stamen part outward (+X) toward the tip, the same way for filament and anther */
function arc(geometry) {
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / ANTHER_TOP
    p.setX(i, p.getX(i) + 0.08 * t * t)
  }
  return geometry
}

/** a stamen in two parts that share instance matrices: a tapered filament and its anther */
function makeStamenParts() {
  const profile = [
    [0.0001, 0],
    [0.011, 0.004],
    [0.0085, STAMEN_H * 0.5],
    [0.006, STAMEN_H],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const filament = paint(new THREE.LatheGeometry(profile, 6), color(palette.iris[300]), color(palette.paper.hi), 0, STAMEN_H)
  const anther = new THREE.SphereGeometry(0.026, 10, 8)
  anther.scale(0.8, 1.65, 0.8)
  anther.translate(0, STAMEN_H + 0.03, 0)
  paint(anther, color(palette.marigold[500]), color(palette.marigold[300]), STAMEN_H - 0.01, ANTHER_TOP)
  return { filament: arc(filament), anther: arc(anther) }
}

/** stamens on a golden-angle spiral: inner ones stand upright, outer ones splay */
function stamenMatrices(count) {
  const Y = new THREE.Vector3(0, 1, 0)
  const Z = new THREE.Vector3(0, 0, 1)
  const tilt = new THREE.Quaternion()
  return Array.from({ length: count }, (_, i) => {
    const f = (i + 0.5) / count
    const az = i * 2.39996
    const r = 0.06 + 0.15 * Math.sqrt(f)
    const lean = 0.12 + 0.75 * f + (rand(i, 4) - 0.5) * 0.12
    const q = new THREE.Quaternion().setFromAxisAngle(Y, -az).multiply(tilt.setFromAxisAngle(Z, -lean))
    const height = 0.82 + rand(i, 5) * 0.3 - f * 0.2
    return new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(az) * r, 0, Math.sin(az) * r), q, new THREE.Vector3(1, height, 1))
  })
}

function makePistilGeometry() {
  const profile = [
    [0.0001, 0],
    [0.07, 0.006],
    [0.1, 0.03],
    [0.108, 0.065],
    [0.095, 0.1],
    [0.06, 0.122],
    [0.0001, 0.128],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(profile, 28)
}

export default function FlowerHeart({ shared, mobile, onPointerDown }) {
  const pistil = useRef()
  const stamens = useRef()
  const glow = useRef()
  const unfurl = useRef({ x: 0.0001, v: 0 })
  const count = mobile ? 40 : 64

  const parts = useMemo(
    () => ({
      ...makeStamenParts(),
      stamenMaterial: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.6,
        emissive: color(palette.marigold[300]),
        emissiveIntensity: 0.12,
      }),
      pistilGeometry: makePistilGeometry(),
      pistilMaterial: new THREE.MeshPhysicalMaterial({
        color: color(palette.paper.hi).lerp(color(palette.marigold[300]), 0.6),
        emissive: color(palette.marigold[300]),
        emissiveIntensity: 0.2,
        roughness: 0.42,
        sheen: 0.6,
        sheenColor: color(palette.paper.hi),
      }),
      glowTexture: radialTexture([
        [0, palette.alpha(palette.marigold[300], 0.45)],
        [0.25, palette.alpha(palette.marigold[300], 0.2)],
        [0.55, palette.alpha(palette.iris[300], 0.1)],
        [1, palette.alpha(palette.iris[300], 0)],
      ]),
    }),
    []
  )
  const matrices = useMemo(() => stamenMatrices(count), [count])

  // R3F only disposes what it builds from JSX: free these geometries, materials and the glow texture ourselves
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts])

  useLayoutEffect(() => {
    for (const mesh of stamens.current.children) {
      matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [matrices])

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const sh = shared.current
    const t = state.clock.elapsedTime
    const life = t - sh.start
    const p = sh.progress
    const calm = sh.reduced ? 0 : 1

    // the pistil beats softly, then condenses into a seed and hands over to the ink layer as it falls
    const beat = 1 + Math.sin(t * 1.6) * 0.035 * calm + sh.bloom * 0.25 + sh.proximity * 0.08
    const seedScale = 1 - smooth(range(p, 0.65, 0.92)) * 0.7
    const coreS = Math.max((life < 0.4 ? 0.55 : 1) * beat * seedScale * (ink.fallT > 0.01 ? 0 : 1), 0.0001)
    easing.damp3(pistil.current.scale, [coreS, coreS, coreS], 0.15, dt)
    pistil.current.material.emissiveIntensity = 0.2 + sh.bloom * 1.1 + sh.proximity * 0.3
    glow.current.scale.setScalar((1.1 + sh.bloom * 1.2 + sh.proximity * 0.3) * coreS)

    // stamens unfurl once the petals open, spread a little in full bloom, and fold away on release
    const open = spring(unfurl.current, life > 0.9 ? 1 : 0.0001, dt, 40, 9)
    const fold = 1 - smooth(range(p, 0.45, 0.7))
    const s = Math.max(open * fold, 0.0001)
    stamens.current.scale.set(s * (1 + sh.bloom * 0.12), s * (1 + sh.bloom * 0.06), s * (1 + sh.bloom * 0.12))

    // where the seed is on screen, for the ink layer's hand-off
    const cs = _seed.setFromMatrixPosition(pistil.current.matrixWorld).project(state.camera)
    ink.heroSeed.x = (cs.x * 0.5 + 0.5) * state.size.width
    ink.heroSeed.y = (-cs.y * 0.5 + 0.5) * state.size.height
  })

  return (
    <group position={[0, 0.04, 0]}>
      <group ref={stamens} onPointerDown={onPointerDown}>
        <instancedMesh key={`f${count}`} args={[parts.filament, parts.stamenMaterial, count]} />
        <instancedMesh key={`a${count}`} args={[parts.anther, parts.stamenMaterial, count]} />
      </group>
      <mesh ref={pistil} geometry={parts.pistilGeometry} material={parts.pistilMaterial} onPointerDown={onPointerDown} />
      <sprite ref={glow} position={[0, 0.12, 0]}>
        <spriteMaterial map={parts.glowTexture} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}
