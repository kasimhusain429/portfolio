/**
 * Petal geometry: a thin parametric surface shaped like a real petal, not an
 * extruded slab. Across the petal s runs from one margin (-1) to the other
 * (1), and v from the base (0) to the tip (1). uv = (s * 0.5 + 0.5, v), so
 * lines of constant s fan out from the base and meet at the tip, which is how
 * the shader draws the veins.
 *
 * Orientation matches the flower rig in HeroScene3D: the length runs along
 * +Y and the inner (upper) face looks toward -Z and is the front face. Cupping
 * lifts the margins toward -Z and a recurved tip bends toward +Z.
 */
import * as THREE from 'three'
import { smoothstep } from '../../../lib/motion'

/* Smooth value noise, used to bake each petal's slow colour variation into a
   vertex attribute (aGrain) so the fragment shader doesn't compute it per pixel. */
const hash = (x, y) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return h - Math.floor(h)
}
function valueNoise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  let fx = x - ix
  let fy = y - iy
  fx = fx * fx * (3 - 2 * fx)
  fy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}
function fbm(x, y) {
  let sum = 0
  let amp = 0.5
  for (let i = 0; i < 4; i++) {
    sum += amp * valueNoise(x, y)
    x *= 2.03
    y *= 2.03
    amp *= 0.5
  }
  return sum
}

/**
 * Half-width along the petal as a fraction of the widest point: `claw` at the
 * base, 1 at `belly`, closing to a point at the tip. Lower `fullness` gives a
 * rounder blade and a blunter tip.
 */
export function petalWidth(v, belly, fullness, claw) {
  const p = Math.log(0.5) / Math.log(belly)
  const blade = Math.pow(Math.sin(Math.PI * Math.pow(v, p)), fullness)
  return blade + claw * Math.pow(1 - v, 3) * (1 - blade)
}

/**
 * @param {object} spec
 * @param {number} spec.length    base to tip
 * @param {number} spec.width     half-width at the widest point
 * @param {number} [spec.belly]   where the petal is widest (0..1)
 * @param {number} [spec.fullness] blade fullness (lower = rounder)
 * @param {number} [spec.claw]    width of the base as a fraction of `width`
 * @param {number} [spec.cup]     margins lift toward the flower's axis
 * @param {number} [spec.keel]    soft crease along the midrib
 * @param {number} [spec.bow]     lengthwise hollow (a shallow boat shape)
 * @param {number} [spec.curl]    the tip recurves outward
 * @param {number} [spec.ruffle]  waviness of the margins
 * @param {number} [spec.waves]   number of waves along each margin
 * @param {number} [spec.twist]   twist about the midrib by the tip (radians)
 * @param {number} [spec.sway]    sideways drift of the midrib (fraction of width)
 * @param {number} [spec.seed]    varies the ruffle phase
 */
export function makePetalGeometry({
  length,
  width,
  belly = 0.45,
  fullness = 0.7,
  claw = 0.14,
  cup = 0.3,
  keel = 0.05,
  bow = 0.04,
  curl = 0.1,
  ruffle = 0.02,
  waves = 2.2,
  twist = 0,
  sway = 0,
  seed = 0,
  segU = 22,
  segV = 36,
}) {
  const cols = segU + 1
  const rows = segV + 1
  const position = new Float32Array(cols * rows * 3)
  const uv = new Float32Array(cols * rows * 2)
  const grain = new Float32Array(cols * rows)
  const phase = seed * 2.17

  for (let j = 0; j < rows; j++) {
    const v = j / segV
    const half = width * petalWidth(v, belly, fullness, claw)
    const midrib = sway * width * Math.sin(Math.PI * v)
    const lengthwise = bow * length * Math.sin(Math.PI * v) + curl * length * Math.pow(v, 2.4)
    const angle = twist * Math.pow(v, 1.5)
    const ca = Math.cos(angle)
    const sa = Math.sin(angle)
    const ruffleIn = smoothstep((v - 0.12) / 0.43)

    for (let i = 0; i < cols; i++) {
      // sine spacing puts more vertices near the margins, where the silhouette is
      const s = Math.sin(((i / segU) * 2 - 1) * (Math.PI / 2))
      const a = Math.abs(s)
      const x = s * half
      const z =
        -cup * half * s * s -
        keel * half * (Math.sqrt(s * s + 0.01) - 0.1) +
        ruffle * width * a * a * a * Math.sin(Math.PI * 2 * (waves * v + 0.18 * s) + phase) * ruffleIn
      const k = j * cols + i
      position[k * 3] = midrib + x * ca - z * sa
      position[k * 3 + 1] = v * length
      position[k * 3 + 2] = x * sa + z * ca + lengthwise
      uv[k * 2] = s * 0.5 + 0.5
      uv[k * 2 + 1] = v
      grain[k] = fbm(s * 1.8 + seed * 3.7, v * 2.4 - seed * 1.3)
    }
  }

  const index = []
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * cols + i
      const b = a + 1
      const d = a + cols
      const c = d + 1
      // wound so the front face is the inner face (-Z)
      index.push(a, d, b, b, d, c)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  geometry.setAttribute('aGrain', new THREE.BufferAttribute(grain, 1))
  geometry.setIndex(index)
  geometry.computeVertexNormals()
  return geometry
}
