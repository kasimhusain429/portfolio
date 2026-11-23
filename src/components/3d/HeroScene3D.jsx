/**
 * HeroScene3D — "Bloom"
 *
 * A glass flower whose four large petals carry Kasim's real projects.
 *   seed → bloom intro, heliotropic cursor tracking, proximity opening,
 *   petal hover / click, drag to spin, press-and-hold to fully bloom,
 *   and a scroll choreography that releases the petals and lets dusk fall.
 *
 * The name "KASIM HUSAIN" is also drawn in-scene (measured from the DOM
 * headline) so the glass petals refract it.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'
import { bloomAnchor, getBloom, setBloom } from '../../lib/bloomStore'
import { ink } from '../../lib/inkStore'
import * as palette from '../../lib/palette'
import { useSmoothScroll } from '../../providers/SmoothScrollProvider'

// Iris is the hero's dominant hue; each petal then carries its own spectrum hue (see PETAL_HUES)
const PAL = { navy: palette.iris[700], corn: palette.iris[500], peri: palette.iris[300], pearl: palette.paper.base }
const warm = (h) => ({ navy: h[600], corn: h[500], peri: h[300] })
const cool = (h) => ({ navy: h[700], corn: h[500], peri: h[300] })
const PETAL_HUES = [cool(palette.iris), cool(palette.orchid), cool(palette.coral), warm(palette.marigold)]
const PETAL_PROJECTS = ['house-of-clio', 'house-of-ethnics', 'nxt-digital', 'darryl-montgomery']
const CAM_Z = 8
const NAME_Z = -0.6

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
const rand = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* Damped spring (gives the organic overshoot when petals open) */
function spring(s, target, dt, k = 70, c = 9) {
  s.v += (target - s.x) * k * dt
  s.v *= Math.exp(-c * dt)
  s.x += s.v * dt
  return s.x
}

/* ─── Geometry ────────────────────────────────────────────── */
function petalOutline(w, l, scale = 1, cy = 0) {
  const s = new THREE.Shape()
  const P = (x, y) => [x * scale, (y - cy) * scale + cy]
  s.moveTo(...P(0, 0))
  s.bezierCurveTo(...P(w * 1.25, l * 0.2), ...P(w * 0.95, l * 0.86), ...P(0, l))
  s.bezierCurveTo(...P(-w * 0.95, l * 0.86), ...P(-w * 1.25, l * 0.2), ...P(0, 0))
  return s
}

/** cup the petal (edges toward the flower axis, -Z) and curl the tip outward (+Z) */
function bend(geo, l, cup, curl) {
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const t = Math.max(0, p.getY(i) / l)
    p.setZ(i, p.getZ(i) - cup * x * x + curl * Math.pow(t, 2.4) * l)
  }
  p.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function makePetal({ w, l, depth, cup, curl, withScreen }) {
  const glass = new THREE.ExtrudeGeometry(petalOutline(w, l), {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.35,
    bevelSize: Math.min(w, l) * 0.028,
    bevelSegments: 4,
    curveSegments: 40,
  })
  glass.translate(0, 0, -depth / 2)
  bend(glass, l, cup, curl)

  let screen = null
  if (withScreen) {
    screen = new THREE.ShapeGeometry(petalOutline(w, l, 0.84, l * 0.5), 40)
    // square image mapped without stretching; u mirrored because we see the -Z face
    const uv = screen.attributes.uv
    const pos = screen.attributes.position
    for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 - pos.getX(i) / l, pos.getY(i) / l)
    bend(screen, l, cup, curl)
  }
  return { glass, screen }
}

/* ─── Small canvas textures ──────────────────────────────── */
function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  stops.forEach(([o, col]) => g.addColorStop(o, col))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ─── Petal light layer ──────────────────────────────────
 * Lives inside each glass petal: a slow liquid gradient in the palette,
 * radiating veins and an iridescent rim. On hover
 * the project image "develops" in, recoloured as a palette duotone.
 */
const PROJECT_PETAL = { w: 0.95, l: 2.55, depth: 0.12, cup: 0.32, curl: 0.12 }

/** soft petal-shaped mask in the light layer's UV space (1 inside, falls off at the edge) */
function petalMaskTexture() {
  const S = 256
  const { w, l } = PROJECT_PETAL
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.fillStyle = 'black' // luminance mask, not a palette colour
  ctx.fillRect(0, 0, S, S)
  ctx.filter = 'blur(9px)'
  ctx.fillStyle = 'white'
  ctx.beginPath()
  petalOutline(w, l, 0.84, l * 0.5)
    .getPoints(64)
    .forEach((pt, i) => {
      const X = (0.5 - pt.x / l) * S
      const Y = (1 - pt.y / l) * S
      if (i) ctx.lineTo(X, Y)
      else ctx.moveTo(X, Y)
    })
  ctx.closePath()
  ctx.fill()
  return new THREE.CanvasTexture(c)
}

const LIGHT_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const LIGHT_FRAG = /* glsl */ `
  uniform float uTime, uHover, uDim, uSeed, uGlow;
  uniform sampler2D uMask;
  uniform vec3 cNavy, cCorn, cPeri, cPearl;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
    return s;
  }
  vec3 ramp(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c = mix(cNavy, cCorn, smoothstep(0.0, 0.42, t));
    c = mix(c, cPeri, smoothstep(0.38, 0.78, t));
    return mix(c, cPearl, smoothstep(0.74, 1.0, t));
  }

  void main() {
    float m = texture2D(uMask, vUv).r;
    float v = vUv.y;
    float x = vUv.x - 0.5;
    float t = uTime * 0.11 + uSeed * 7.0;

    // liquid gradient: cornflower body, periwinkle tip, drifting like ink in glass
    float n = fbm(vec2(x * 3.0 + uSeed, v * 2.4 - t));
    float n2 = fbm(vec2(x * 6.0 - t * 0.6, v * 4.5 + uSeed));
    vec3 col = ramp(0.24 + 0.52 * v + (n - 0.5) * 0.7);
    col = mix(col, cPearl, smoothstep(0.6, 0.92, n2) * 0.4);

    // veins fanning out from the base, plus the midrib
    float a = x / (v + 0.12);
    float vein = pow(abs(sin(a * 9.0 + n * 2.4)), 44.0) * smoothstep(0.04, 0.3, v) * (1.0 - v * 0.6) * (0.4 + n2);
    float rib = exp(-abs(x) * 60.0) * (1.0 - v * 0.75);
    col += (vein * 0.2 + rib * 0.35) * mix(cPeri, cPearl, 0.6);

    // light pouring out of the core
    col += cPeri * exp(-v * 4.5) * uGlow;

    // iridescent rim
    float rim = smoothstep(0.12, 0.5, m) * (1.0 - smoothstep(0.5, 0.92, m));
    vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.18, 0.36) + n * 1.2 + t * 0.9 + v));
    irid = mix(cPeri, cPeri * irid * 1.3 + cPearl * 0.25, 0.55);
    col = mix(col, irid + 0.2, rim * 0.85);

    // fresnel sheen
    float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.5);
    col += cPeri * fr * 0.3;


    col *= uDim * mix(0.6, 1.0, smoothstep(0.0, 0.35, m));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function makeLightMaterial({ seed = 0, mask, hue = PAL }) {
  return new THREE.ShaderMaterial({
    vertexShader: LIGHT_VERT,
    fragmentShader: LIGHT_FRAG,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uDim: { value: 1 },
      uGlow: { value: 0.9 },
      uSeed: { value: seed },
      uMask: { value: mask },
      cNavy: { value: new THREE.Color(hue.navy) },
      cCorn: { value: new THREE.Color(hue.corn) },
      cPeri: { value: new THREE.Color(hue.peri) },
      cPearl: { value: new THREE.Color(PAL.pearl) },
    },
  })
}

/* ─── Atmosphere ─────────────────────────────────────────
 * Screen-space gradient field behind everything (and refracted by the glass):
 * pearl-lavender sky → periwinkle → soft cornflower floor, two drifting light
 * blooms, a luminous halo behind the flower, cornflower edges, and dithering
 * to keep the gradients band-free. uDusk carries it to a wet periwinkle sky
 * that meets the About section's paper edge.
 */
const ATMOS_FRAG = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime, uDusk;
  uniform vec3 cNavy, cCorn, cPeri, cPearl, cOrchid, cCoral, cGold;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  float bloom(vec2 uv, vec2 c, float k, float asp) {
    vec2 q = (uv - c) * vec2(asp, 1.0);
    return exp(-dot(q, q) * k);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float asp = uRes.x / uRes.y;
    float t = uTime * 0.05;

    vec3 sky = mix(cPearl, cPeri, 0.14);
    vec3 floorC = mix(cPeri, cCorn, 0.34);
    vec3 col = mix(floorC, sky, smoothstep(0.0, 0.82, uv.y));

    // drifting light blooms
    col = mix(col, cCorn, 0.32 * bloom(uv, vec2(0.16 + 0.04 * sin(t * 1.3), 0.8 + 0.03 * cos(t)), 2.6, asp));
    col = mix(col, cOrchid, 0.42 * bloom(uv, vec2(0.86 + 0.03 * cos(t * 1.1), 0.3 + 0.04 * sin(t * 0.9)), 2.2, asp));
    col = mix(col, cCoral, 0.4 * bloom(uv, vec2(0.97, 0.06), 3.4, asp));
    col = mix(col, cGold, 0.55 * bloom(uv, vec2(0.05, 0.14), 3.4, asp));

    // luminous halo behind the flower
    col = mix(col, mix(cPearl, cPeri, 0.25), 0.55 * bloom(uv, vec2(0.5, 0.44), 4.5, asp));

    // soft cornflower edges for depth
    vec2 e = (uv - 0.5) * vec2(asp * 0.75, 1.0);
    col = mix(col, cCorn, smoothstep(0.55, 1.15, length(e)) * 0.3);

    // dusk: → a soft, wet periwinkle sky above the paper horizon
    col = mix(col, mix(cPeri, cPearl, 0.3 + 0.25 * uv.y), uDusk * 0.85);

    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

function makeAtmosphere() {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: ATMOS_FRAG,
    depthWrite: false,
    uniforms: {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uDusk: { value: 0 },
      cNavy: { value: new THREE.Color(PAL.navy) },
      cCorn: { value: new THREE.Color(PAL.corn) },
      cPeri: { value: new THREE.Color(PAL.peri) },
      cPearl: { value: new THREE.Color(PAL.pearl) },
      cOrchid: { value: new THREE.Color(palette.orchid[300]) },
      cCoral: { value: new THREE.Color(palette.coral[300]) },
      cGold: { value: new THREE.Color(palette.marigold[300]) },
    },
  })
}

/* ─── Pollen: layered depth particles ────────────────────
 * Tiny sharp sparkles, mid glowing pollen and large soft bokeh discs in the
 * palette (navy specks included for depth); they twinkle, sway and rise.
 */
const POLLEN_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime, uPixel, uScale, uRise;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;
  void main() {
    vec3 p = position;
    float speed = 0.06 + aSeed * 0.2;
    p.y = mod(p.y + 6.0 + uTime * speed + uRise * (0.6 + aSeed), 12.0) - 6.0;
    p.x += sin(uTime * 0.35 + aSeed * 20.0) * 0.3;
    p.z += cos(uTime * 0.27 + aSeed * 12.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = max(1.0, aSize * uPixel * uScale / -mv.z);
    vSoft = smoothstep(0.22, 0.5, aSize);
    float twinkle = 0.6 + 0.4 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 40.0);
    vAlpha = mix(twinkle, 0.85, vSoft) * mix(0.95, 0.32, vSoft) * smoothstep(6.0, 4.5, abs(p.y));
    vColor = aColor;
  }
`
const POLLEN_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    float dot_ = mix(pow(glow, 2.2) + smoothstep(0.16, 0.08, d) * 0.6, smoothstep(0.5, 0.38, d), vSoft);
    float ring = smoothstep(0.5, 0.45, d) * smoothstep(0.36, 0.45, d) * 0.5 * vSoft;
    float a = clamp(dot_ + ring, 0.0, 1.0) * vAlpha * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`

/* ─── Materials (shared) ─────────────────────────────────── */
function useMaterials() {
  return useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      color: palette.paper.hi,
      transmission: 1,
      thickness: 0.3,
      roughness: 0.05,
      ior: 1.5,
      iridescence: 0.9,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [120, 420],
      attenuationColor: new THREE.Color(PAL.peri),
      attenuationDistance: 8,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.25,
    })
    // crown + loose petals: luminous iridescent crystal (cheaper than transmission)
    const crystal = new THREE.MeshPhysicalMaterial({
      color: palette.iris[300],
      emissive: new THREE.Color(PAL.corn),
      emissiveIntensity: 0.32,
      roughness: 0.08,
      clearcoat: 1,
      iridescence: 1,
      iridescenceIOR: 1.35,
      transparent: true,
      opacity: 0.88,
      envMapIntensity: 1.4,
    })
    const core = new THREE.MeshPhysicalMaterial({
      color: palette.paper[2],
      emissive: new THREE.Color(PAL.corn),
      emissiveIntensity: 1.2,
      roughness: 0.15,
      clearcoat: 1,
      flatShading: true,
    })
    return { glass, crystal, core }
  }, [])
}

/* ─── In-scene name (refracted by the petals) ────────────── */
function NameLines({ shared }) {
  const { size, camera } = useThree()
  const group = useRef()
  const lines = useRef([])

  useEffect(() => {
    let cancelled = false
    const build = () => {
      if (cancelled || !group.current) return
      const frame = document.querySelector('[data-bloom-frame]')
      const els = document.querySelectorAll('[data-bloom-line]')
      if (!frame || !els.length) return
      const fr = frame.getBoundingClientRect()
      // visible world height at the name's depth, for the resting camera
      const vh = 2 * (CAM_Z - NAME_Z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      const toW = vh / fr.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      lines.current.forEach(({ mesh }) => {
        mesh.geometry.dispose()
        mesh.material.map.dispose()
        mesh.material.dispose()
      })
      group.current.clear()
      lines.current = []

      els.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        const fs = parseFloat(cs.fontSize)
        const padY = fs * 0.25
        const c = document.createElement('canvas')
        c.width = Math.ceil(r.width * dpr)
        c.height = Math.ceil((r.height + padY * 2) * dpr)
        const ctx = c.getContext('2d')
        ctx.font = `${cs.fontWeight} ${fs * dpr}px ${cs.fontFamily}`
        const ls = parseFloat(cs.letterSpacing)
        if (!Number.isNaN(ls) && 'letterSpacing' in ctx) ctx.letterSpacing = `${ls * dpr}px`
        const grad = ctx.createLinearGradient(0, c.height * 0.2, 0, c.height * 0.85)
        grad.addColorStop(0, palette.ink.base)
        grad.addColorStop(0.62, palette.iris[700])
        grad.addColorStop(1, palette.orchid[600])
        ctx.fillStyle = grad
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        const raw = el.textContent.trim()
        const text = cs.textTransform === 'uppercase' ? raw.toUpperCase() : raw
        ctx.fillText(text, c.width / 2, c.height / 2 + fs * 0.35 * dpr)
        const tex = new THREE.CanvasTexture(c)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4

        const w = r.width * toW
        const h = (r.height + padY * 2) * toW
        const x = (r.left + r.width / 2 - fr.left - fr.width / 2) * toW
        const y = -(r.top + r.height / 2 - fr.top - fr.height / 2) * toW
        const bottom = y - (r.height / 2 + padY * 0.4) * toW
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          alphaTest: 0.5,
          toneMapped: false,
          clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), -bottom)],
        })
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
        mesh.position.set(x, y - h, NAME_Z)
        group.current.add(mesh)
        const shown = getBloom().domShown
        lines.current.push({ mesh, x, y, h, rise: { x: shown ? 0 : -h, v: 0 }, instant: shown, dir: i === 0 ? -1 : 1, span: fr.width * toW })
      })
      shared.current.nameReady = true
    }
    const run = () => document.fonts.ready.then(build)
    run()
    return () => {
      cancelled = true
    }
  }, [size.width, size.height, camera, shared])

  useFrame((state, dt) => {
    const sh = shared.current
    const t = state.clock.elapsedTime - sh.start
    lines.current.forEach((l, i) => {
      const off = l.instant ? 0 : spring(l.rise, t > 0.95 + i * 0.12 ? 0 : -l.h, Math.min(dt, 0.05), 45, 10)
      const split = smooth(range(sh.progress, 0, 0.35)) * l.span * 0.3 * l.dir
      l.mesh.position.set(l.x + split, l.y + off, NAME_Z)
    })
  })

  return <group ref={group} />
}

/* ─── A petal (glass shell + optional light layer) ───────── */
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const PETAL_TIMING = { crown: [0.25, 0.06], inner: [0.5, 0.09], project: [0.7, 0.11] }

function Petal({ geo, material, light, azimuth, rest, index, kind, shared, projectId, size = 1 }) {
  const hinge = useRef()
  const lift = useRef()
  const open = useRef({ x: 0.05, v: 0 })
  const grow = useRef({ x: 0.001, v: 0 })
  const fx = useRef({ hover: 0, dim: 1, present: 0 })
  const lightMesh = useRef()

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const sh = shared.current
    const t = state.clock.elapsedTime - sh.start
    const [d0, step] = PETAL_TIMING[kind]
    const started = t > d0 + index * step
    const hov = !!projectId && sh.hovered === projectId
    const other = !!sh.hovered && !hov && (kind === 'project' || kind === 'inner')
    easing.damp(fx.current, 'hover', hov ? 1 : 0, hov ? 0.32 : 0.22, dt)
    easing.damp(fx.current, 'present', hov ? 1 : 0, 0.28, dt)
    easing.damp(fx.current, 'dim', other ? 0.68 : 1, 0.25, dt)

    let target = started ? rest : 0.08
    if (other) target -= 0.14 // neighbours bow back so the chosen petal stands clear
    if (kind === 'project') target += sh.proximity * 0.14 + sh.bloom * 0.28
    if (kind === 'inner') target += sh.proximity * 0.08 + sh.bloom * 0.3
    if (kind === 'crown') target += sh.bloom * 0.2 + sh.proximity * 0.05
    target += smooth(range(sh.progress, 0.15, 0.45)) * 0.35
    hinge.current.rotation.x = spring(open.current, target, dt, kind === 'project' ? 38 : 55, 7.5)
    const g = spring(grow.current, started ? 1 : 0.35, dt, 60, 10)

    const p = sh.progress
    if (kind === 'project') {
      // release: fly outward along the petal's own length, past the screen edge
      const d = smooth(range(p, 0.42 + index * 0.06, 0.72 + index * 0.06))
      const pr = fx.current.present
      lift.current.position.set(0, d * 11, d * 2)
      lift.current.rotation.set(-d * 0.8, d * (index % 2 ? 1.6 : -1.6), 0)
      lift.current.scale.setScalar(g * size * (1 + pr * 0.04))
      // where the hovered petal sits on screen, for the DOM preview card
      if (hov) {
        const c = _v1.set(0, PROJECT_PETAL.l * 0.55, 0).applyMatrix4(lift.current.matrixWorld).project(state.camera)
        bloomAnchor.x = (c.x * 0.5 + 0.5) * state.size.width
        bloomAnchor.y = (-c.y * 0.5 + 0.5) * state.size.height
      }
    } else {
      const out = kind === 'inner' ? range(p, 0.5, 0.75) : range(p, 0.6, 0.85)
      lift.current.scale.setScalar(g * size * (1 - smooth(out)) + 0.0001)
    }

    if (lightMesh.current) {
      const u = lightMesh.current.material.uniforms
      u.uTime.value = state.clock.elapsedTime
      u.uHover.value = fx.current.hover
      u.uDim.value = fx.current.dim
      u.uGlow.value = 0.85 + sh.bloom * 0.9 + sh.proximity * 0.35 + fx.current.hover * 0.7
    }
  })

  return (
    <group rotation-y={azimuth}>
      <group ref={hinge}>
        <group ref={lift}>
          <mesh geometry={geo.glass} material={material} userData={{ projectId }} />
          {light && geo.screen && <mesh ref={lightMesh} geometry={geo.screen} material={light} userData={{ projectId }} />}
        </group>
      </group>
    </group>
  )
}

function Pollen({ count, shared }) {
  const ref = useRef()
  const clock = useRef(0)
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const seed = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const specks = [palette.iris[500], palette.orchid[500], palette.coral[500], palette.marigold[500], palette.iris[300], palette.paper.hi, palette.iris[700]].map((c) => new THREE.Color(c))
    for (let i = 0; i < count; i++) {
      const z = -6 + rand(i, 3) * 11
      pos.set([(rand(i, 1) - 0.5) * 22, -6 + rand(i, 2) * 12, z], i * 3)
      const r = rand(i, 5)
      // ~7% large bokeh (mostly near the camera), ~25% mid pollen, the rest fine sparkles
      size[i] = r > 0.93 ? 0.28 + rand(i, 6) * 0.32 : r > 0.68 ? 0.085 + rand(i, 6) * 0.06 : 0.035 + rand(i, 6) * 0.035
      if (r > 0.93) pos[i * 3 + 2] = 1.5 + rand(i, 9) * 3
      seed[i] = rand(i, 8)
      const c = specks[Math.floor(rand(i, 7) * specks.length)]
      col.set([c.r, c.g, c.b], i * 3)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    const material = new THREE.ShaderMaterial({
      vertexShader: POLLEN_VERT,
      fragmentShader: POLLEN_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPixel: { value: 1 },
        uScale: { value: 400 },
        uRise: { value: 0 },
        uOpacity: { value: 0 },
      },
    })
    return { geometry, material }
  }, [count])

  useFrame((state, dt) => {
    const sh = shared.current
    clock.current += Math.min(dt, 0.05) * (1 + sh.bloom * 4) * (sh.reduced ? 0.25 : 1)
    const u = ref.current.material.uniforms
    u.uTime.value = clock.current
    u.uPixel.value = state.gl.getPixelRatio()
    u.uScale.value = (state.size.height * 0.5) / Math.tan(THREE.MathUtils.degToRad(state.camera.fov / 2))
    u.uRise.value = sh.progress * 3
    u.uOpacity.value = Math.max(0, Math.min(1, (state.clock.elapsedTime - sh.start) / 2))
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}


/* ─── Main scene ─────────────────────────────────────────── */
export default function HeroScene3D() {
  const { viewport, size, camera } = useThree()
  const smoothScroll = useSmoothScroll()
  const narrow = size.width < 768
  const mobile = narrow || size.width * size.height < 700_000

  const mats = useMaterials()

  const geos = useMemo(
    () => ({
      project: makePetal({ ...PROJECT_PETAL, withScreen: true }),
      crown: makePetal({ w: 0.32, l: 1.25, depth: 0.08, cup: 0.9, curl: 0.18 }),
      loose: makePetal({ w: 0.18, l: 0.55, depth: 0.04, cup: 0.9, curl: 0.2 }),
    }),
    []
  )

  const glow = useMemo(
    () =>
      radialTexture([
        [0, palette.alpha(palette.paper.hi, 1)],
        [0.25, palette.alpha(palette.iris[300], 0.85)],
        [0.6, palette.alpha(palette.iris[500], 0.25)],
        [1, palette.alpha(palette.iris[500], 0)],
      ]),
    []
  )
  const floorTex = useMemo(
    () =>
      radialTexture([
        [0, palette.alpha(palette.iris[600], 0.8)],
        [0.3, palette.alpha(palette.orchid[500], 0.42)],
        [0.6, palette.alpha(palette.orchid[300], 0.25)],
        [1, palette.alpha(palette.orchid[300], 0)],
      ]),
    []
  )
  const mask = useMemo(() => petalMaskTexture(), [])
  const lights = useMemo(
    () => [
      ...PETAL_PROJECTS.map((_, i) => makeLightMaterial({ seed: i, mask, hue: PETAL_HUES[i % PETAL_HUES.length] })),
      ...[0, 1, 2, 3].map((i) => makeLightMaterial({ seed: 4 + i * 1.7, mask, hue: PETAL_HUES[(i + 1) % PETAL_HUES.length] })),
    ],
    [mask]
  )
  const atmosphere = useMemo(() => makeAtmosphere(), [])

  const shared = useRef({ start: Infinity, reduced: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, progress: 0, proximity: 0, bloom: 0, bloomAt: -10, hovered: null, yaw: 0, yawVel: 0 })
  const root = useRef()
  const tilt = useRef()
  const spin = useRef()
  const core = useRef()
  const coreGlow = useRef()
  const backdrop = useRef()
  const loose = useRef()
  const floor = useRef()
  const pointer = useRef({ down: false, moved: false, held: false, holdTimer: 0, target: null })

  // Crown petals on a golden-angle spiral
  const crown = useMemo(
    () => Array.from({ length: mobile ? 8 : 11 }, (_, i) => ({ az: i * 2.39996, rest: 0.32 + (i % 3) * 0.09 })),
    [mobile]
  )
  const looseDefs = useMemo(
    () =>
      Array.from({ length: mobile ? 3 : 5 }, (_, i) => ({
        pos: [(i % 2 ? 1 : -1) * (3.4 + ((i * 1.7) % 2.5)), -1.6 + ((i * 1.3) % 3.4), -1 + ((i * 2.1) % 3)],
        rot: [i * 1.1, i * 0.7, i * 0.3],
        s: 0.8 + (i % 3) * 0.35,
      })),
    [mobile]
  )

  /* Pointer: hover, click, drag to spin, press-and-hold to bloom */
  const petalId = (e) => e.object?.userData?.projectId || null
  const onOver = (e) => {
    const id = petalId(e)
    if (!id || e.pointerType === 'touch' || shared.current.progress > 0.04) return
    e.stopPropagation()
    shared.current.hovered = id
    setBloom({ hovered: id })
    document.body.style.cursor = 'pointer'
  }
  const onOut = (e) => {
    if (!petalId(e) || e.pointerType === 'touch') return
    shared.current.hovered = null
    setBloom({ hovered: null })
    document.body.style.cursor = ''
  }
  const onDown = (e) => {
    e.stopPropagation()
    const pt = pointer.current
    Object.assign(pt, { down: true, moved: false, held: false, x: e.clientX, y: e.clientY, lastX: e.clientX, target: petalId(e) })
    clearTimeout(pt.holdTimer)
    pt.holdTimer = setTimeout(() => {
      if (pt.down && !pt.moved) {
        shared.current.bloomAt = performance.now() / 1000
        pt.held = true
        setBloom({ bloomed: true })
      }
    }, 550)
  }

  useEffect(() => {
    const pt = pointer.current
    const move = (e) => {
      if (!pt.down) return
      if (Math.hypot(e.clientX - pt.x, e.clientY - pt.y) > 6) pt.moved = true
      if (pt.moved) {
        shared.current.yawVel = (e.clientX - pt.lastX) * 0.012
        shared.current.yaw += shared.current.yawVel
      }
      pt.lastX = e.clientX
    }
    const up = (e) => {
      if (!pt.down) return
      clearTimeout(pt.holdTimer)
      pt.down = false
      if (pt.moved || pt.held) return
      const sh = shared.current
      const touch = e.pointerType === 'touch'
      if (touch && pt.target && sh.hovered !== pt.target) {
        sh.hovered = pt.target // first tap: preview
        sh.previewAt = performance.now()
        setBloom({ hovered: pt.target })
        return
      }
      if (pt.target) {
        if (smoothScroll?.scrollTo) smoothScroll.scrollTo('#projects', { offset: -80 })
        else document.getElementById('projects')?.scrollIntoView()
      } else if (touch && sh.hovered) {
        sh.hovered = null
        setBloom({ hovered: null })
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
      setBloom({ ready: false, hovered: null })
    }
  }, [smoothScroll])

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const sh = shared.current
    const t = state.clock.elapsedTime
    // the intro begins the moment the preloader opens (reduced motion: already in bloom)
    if (!sh.started && getBloom().phase === 'live') {
      sh.started = true
      sh.start = sh.reduced ? t - 10 : t
    }
    // the store is the source of truth for hover (pointer, touch preview, keyboard focus)
    const storeHover = getBloom().hovered
    if (storeHover !== sh.hovered) sh.hovered = storeHover
    if (sh.nameReady && !sh.announced) {
      sh.announced = true
      setBloom({ ready: true })
    }
    const life = t - sh.start

    // Scroll progress through the pinned hero
    const el = document.getElementById('home')
    let target = 0
    if (el) {
      const r = el.getBoundingClientRect()
      target = clamp01(-r.top / Math.max(1, r.height - window.innerHeight))
    }
    easing.damp(sh, 'progress', target, 0.1, dt)
    const p = sh.progress
    // hover never survives scrolling; touch previews also close themselves
    if (sh.hovered && (p > 0.04 || (sh.previewAt && performance.now() - sh.previewAt > 6000))) {
      sh.previewAt = 0
      sh.hovered = null
      setBloom({ hovered: null })
      document.body.style.cursor = ''
    }

    // Press-and-hold bloom decays after a few seconds
    const sinceBloom = performance.now() / 1000 - sh.bloomAt
    easing.damp(sh, 'bloom', sinceBloom < 2.6 ? 1 : 0, sinceBloom < 2.6 ? 0.25 : 0.8, dt)
    if (sinceBloom > 2.6 && sh.bloom < 0.05 && sh.bloom > 0.0001) setBloom({ bloomed: false })

    // Proximity: how close the cursor is to the flower on screen
    const flowerY = narrow ? 0 : -0.15
    const dist = Math.hypot(state.pointer.x * (size.width / size.height), state.pointer.y - flowerY)
    easing.damp(sh, 'proximity', clamp01(1 - (dist - 0.25) / 0.9), 0.3, dt)

    // Camera dolly
    easing.damp3(camera.position, [0, -p * 0.3, CAM_Z - smooth(range(p, 0, 0.45)) * 1.4], 0.2, dt)
    camera.lookAt(0, -p * 0.3, 0)

    // Placement
    const scale = narrow ? Math.min(viewport.width * 0.185, 0.8) : Math.min(viewport.width * 0.084, 1.18)
    const baseY = narrow ? viewport.height * 0.01 : -0.45
    root.current.scale.setScalar(scale)
    const calm = sh.reduced ? 0 : 1
    root.current.position.set(0, baseY + smooth(range(p, 0, 0.35)) * 0.6 + Math.sin(t * 0.8) * 0.04 * calm, 0.4)

    // Flower centre and radius in CSS pixels, for placing the preview card beside it
    if (sh.hovered) {
      const c = _v1.setFromMatrixPosition(root.current.matrixWorld).project(camera)
      const e = _v2.setFromMatrixPosition(root.current.matrixWorld)
      e.x += PROJECT_PETAL.l * scale * 1.15
      e.project(camera)
      bloomAnchor.cx = (c.x * 0.5 + 0.5) * size.width
      bloomAnchor.cy = (-c.y * 0.5 + 0.5) * size.height
      bloomAnchor.r = Math.abs(e.x - c.x) * 0.5 * size.width
    }

    // Heliotropism (turns toward the cursor) + drag spin with inertia
    sh.yawVel *= Math.exp(-2.2 * dt)
    if (!pointer.current.down) sh.yaw += sh.yawVel
    const lean = smooth(range(p, 0.12, 0.45)) * 0.55
    easing.dampE(
      tilt.current.rotation,
      [1.22 + lean * 0.5 - state.pointer.y * 0.14, state.pointer.x * 0.32, -state.pointer.x * 0.05],
      0.45,
      dt
    )
    spin.current.rotation.y = sh.yaw + p * 1.4 + Math.sin(t * 0.25) * 0.08 * calm + Math.PI / 4

    // Core: seed → heartbeat
    const beat = 1 + Math.sin(t * 1.6) * 0.04 * calm + sh.bloom * 0.35 + sh.proximity * 0.1
    // the core condenses into a seed, then hands over to the ink layer as it starts to fall
    const seedScale = 1 - smooth(range(p, 0.65, 0.92)) * 0.7
    const coreS = Math.max((life < 0.4 ? 0.55 : 1) * beat * seedScale * (ink.fallT > 0.01 ? 0 : 1), 0.0001)
    easing.damp3(core.current.scale, [coreS, coreS, coreS], 0.15, dt)
    core.current.material.emissiveIntensity = 1.1 + sh.bloom * 1.6 + sh.proximity * 0.5
    coreGlow.current.scale.setScalar((1.7 + sh.bloom * 1.4 + sh.proximity * 0.3) * coreS)
    const cs = _v2.setFromMatrixPosition(core.current.matrixWorld).project(camera)
    ink.heroSeed.x = (cs.x * 0.5 + 0.5) * size.width
    ink.heroSeed.y = (-cs.y * 0.5 + 0.5) * size.height

    // Loose petals drift
    loose.current.children.forEach((m, i) => {
      m.rotation.x += dt * (0.15 + i * 0.03) * calm
      m.rotation.y += dt * 0.1 * calm
    })
    loose.current.position.y = Math.sin(t * 0.4) * 0.15 - p * 2.5

    // Atmosphere: resolution, slow drift, and dusk (pearl → periwinkle → navy)
    const au = backdrop.current.material.uniforms
    state.gl.getDrawingBufferSize(au.uRes.value)
    au.uTime.value = t * calm
    au.uDusk.value = smooth(range(p, 0.72, 1))
    floor.current.material.opacity = 1 - smooth(range(p, 0.55, 0.85))
    loose.current.scale.setScalar(Math.max(0.0001, 1 - smooth(range(p, 0.7, 0.95))))
  })

  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, 3]} scale={[12, 5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={5} color={PAL.corn} position={[0, 1.5, -6]} scale={[14, 3, 1]} />
        <Lightformer intensity={2.5} color={PAL.peri} position={[7, 1, 2]} scale={[3, 9, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer intensity={1.8} color={palette.coral[300]} position={[-7, 2, 1]} scale={[3, 9, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={1} color={PAL.pearl} position={[0, -4, 3]} scale={[12, 3, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
      <directionalLight position={[2, 6, 5]} intensity={1.2} />
      <pointLight position={[0, -0.2, 0.6]} color={PAL.corn} intensity={6} distance={4} />

      {/* Opaque atmosphere so the glass has colour to refract; also carries the dusk */}
      <mesh ref={backdrop} position={[0, 0, -6]} material={atmosphere}>
        <planeGeometry args={[120, 120]} />
      </mesh>

      <NameLines shared={shared} />

      <group ref={root}>
        {/* floor light pool */}
        <mesh ref={floor} position={[0, -2.1, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[9, 5]} />
          <meshBasicMaterial map={floorTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        <group ref={tilt}>
          <group ref={spin}>
            {PETAL_PROJECTS.map((id, i) => (
              <group key={id} onPointerOver={onOver} onPointerOut={onOut} onPointerDown={onDown}>
                <Petal
                  geo={geos.project}
                  material={mats.glass}
                  light={lights[i]}
                  azimuth={i * (Math.PI / 2)}
                  rest={0.98}
                  index={i}
                  kind="project"
                  shared={shared}
                  projectId={id}
                />
              </group>
            ))}
            <group onPointerDown={onDown}>
              {/* second, smaller ring of light petals between the project petals */}
              {[0, 1, 2, 3].map((i) => (
                <Petal
                  key={`i${i}`}
                  geo={geos.project}
                  material={mats.glass}
                  light={lights[4 + i]}
                  azimuth={i * (Math.PI / 2) + Math.PI / 4}
                  rest={0.6}
                  index={i}
                  kind="inner"
                  shared={shared}
                  size={0.7}
                />
              ))}
              {crown.map((c, i) => (
                <Petal
                  key={`c${i}`}
                  geo={geos.crown}
                  material={mats.crystal}
                  azimuth={c.az}
                  rest={c.rest}
                  index={i}
                  kind="crown"
                  shared={shared}
                />
              ))}
            </group>
            <mesh ref={core} position={[0, 0.25, 0]} material={mats.core} onPointerDown={onDown}>
              <icosahedronGeometry args={[0.3, 1]} />
            </mesh>
            <sprite ref={coreGlow} position={[0, 0.3, 0]}>
              <spriteMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
            </sprite>
          </group>
        </group>
      </group>

      <group ref={loose}>
        {looseDefs.map((d, i) => (
          <mesh key={i} geometry={geos.loose.glass} material={mats.crystal} position={d.pos} rotation={d.rot} scale={d.s} />
        ))}
      </group>

      <Pollen count={mobile ? 180 : 520} shared={shared} />
    </>
  )
}
