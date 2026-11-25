/**
 * HeroScene3D — "Bloom"
 *
 * A single violet bloom whose four outer petals carry Kasim's real projects.
 *   seed → bloom intro, heliotropic cursor tracking, proximity opening,
 *   petal hover / click, drag to spin, press-and-hold to fully bloom,
 *   and a scroll choreography that releases the petals and lets dusk fall.
 *
 * The flower is built like a real one (bloom/): thin satin petals in one hue,
 * deep at the throat and pale at the tips, in three rings around a heart of
 * stamens. The name "KASIM HUSAIN" is drawn in-scene too (measured from the
 * DOM headline) so it can sit behind the flower and part as you scroll.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'
import { bloomAnchor, getBloom, setBloom } from '../../lib/bloomStore'
import * as palette from '../../lib/palette'
import { useSmoothScroll } from '../../providers/SmoothScrollProvider'
import FlowerHeart from './bloom/FlowerHeart'
import { clamp01, radialTexture, rand, range, smooth, spring } from './bloom/helpers'
import { makePetalGeometry } from './bloom/petalGeometry'
import { makePetalMaterial, PETAL_TONE } from './bloom/petalMaterial'

// Iris is the hero's hue, and the whole flower stays inside it
const PAL = { navy: palette.iris[700], corn: palette.iris[500], peri: palette.iris[300], pearl: palette.paper.base }
const PETAL_PROJECTS = ['house-of-clio', 'house-of-ethnics', 'nxt-digital', 'darryl-montgomery']
const CAM_Z = 8
const NAME_Z = -0.6

/* ─── Petal shapes ───────────────────────────────────────────
 * Outer ring: the four project petals (their length also sizes the preview
 * anchor). Inner ring: four smaller petals between them. Crown: narrow,
 * deeply cupped petals around the heart. Loose: stray petals drifting by.
 */
const PROJECT_PETAL = { length: 2.55, width: 0.98, belly: 0.47, fullness: 0.6, claw: 0.12, cup: 0.3, keel: 0.06, bow: 0.035, curl: 0.09, ruffle: 0.03, waves: 2.2 }
const INNER_PETAL = { ...PROJECT_PETAL, width: 0.88, fullness: 0.68, cup: 0.42, curl: 0.05 }
const CROWN_PETAL = { length: 1.25, width: 0.36, belly: 0.52, fullness: 0.7, claw: 0.22, cup: 0.65, keel: 0.08, bow: 0.04, curl: 0.07, ruffle: 0.02, waves: 1.6, segU: 14, segV: 24 }
const LOOSE_PETAL = { length: 0.62, width: 0.25, belly: 0.5, fullness: 0.6, claw: 0.2, cup: 0.55, keel: 0.05, bow: 0.05, curl: 0.16, ruffle: 0.03, waves: 1.5, segU: 10, segV: 16 }
const LOOSE_COUNT = { desktop: 5, mobile: 3 }

/** Crown: two whorls of four cupped around the heart, each sitting in the gaps of the ring outside it, slightly irregular like a real bloom */
const CROWN = Array.from({ length: 8 }, (_, i) => {
  const outer = i < 4
  return {
    az: (i % 4) * (Math.PI / 2) + (outer ? 0 : Math.PI / 4) + (rand(i, 7) - 0.5) * 0.16,
    rest: (outer ? 0.55 : 0.38) + (rand(i, 8) - 0.5) * 0.06,
    size: outer ? 1 : 0.86,
  }
})

/** no two petals alike: a little twist, a wandering midrib, slightly different lengths */
function petalPart(spec, seed, tone) {
  const geometry = makePetalGeometry({
    ...spec,
    seed,
    length: spec.length * (1 + (rand(seed, 3) - 0.5) * 0.05),
    twist: (rand(seed, 1) - 0.5) * 0.18,
    sway: (rand(seed, 2) - 0.5) * 0.08,
  })
  return { geometry, material: makePetalMaterial({ seed, tone }) }
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
 * flower's own colours (pearl, lavender, a little gold, a few deep iris specks
 * for depth); they twinkle, sway and rise.
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

/* ─── In-scene name (sits behind the flower, parts on scroll) ─ */
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

/* ─── A petal ───────────────────────────────────────────────
 * Hinged at the heart's rim. It opens on a spring, breathes slowly, leans
 * toward the visitor when its project is hovered, and on scroll the project
 * petals release and tumble away while the inner rings fold into the heart.
 */
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const PETAL_TIMING = { crown: [0.25, 0.06], inner: [0.5, 0.09], project: [0.7, 0.11] }
const PETAL_BASE = { crown: 0.05, inner: 0.09, project: 0.12 } // petals attach around the heart, not at one point
const BREATH_PHASE = { crown: 0, inner: 1.3, project: 2.6 }

function Petal({ geometry, material, azimuth, rest, index, kind, shared, projectId, size = 1 }) {
  const hinge = useRef()
  const lift = useRef()
  const mesh = useRef()
  const open = useRef({ x: 0.05, v: 0 })
  const grow = useRef({ x: 0.001, v: 0 })
  const fx = useRef({ hover: 0, dim: 1, present: 0 })

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05)
    const sh = shared.current
    const now = state.clock.elapsedTime
    const t = now - sh.start
    const calm = sh.reduced ? 0 : 1
    const [d0, step] = PETAL_TIMING[kind]
    const started = t > d0 + index * step
    const hov = !!projectId && sh.hovered === projectId
    const other = !!sh.hovered && !hov && (kind === 'project' || kind === 'inner')
    easing.damp(fx.current, 'hover', hov ? 1 : 0, hov ? 0.32 : 0.22, dt)
    easing.damp(fx.current, 'present', hov ? 1 : 0, 0.28, dt)
    easing.damp(fx.current, 'dim', other ? 0.72 : 1, 0.25, dt)

    let target = started ? rest : 0.08
    if (other) target -= 0.14 // neighbours bow back so the chosen petal stands clear
    if (kind === 'project') target += sh.proximity * 0.14 + sh.bloom * 0.28
    if (kind === 'inner') target += sh.proximity * 0.08 + sh.bloom * 0.3
    if (kind === 'crown') target += sh.bloom * 0.2 + sh.proximity * 0.05
    target += smooth(range(sh.progress, 0.15, 0.45)) * 0.35
    // a slow breath, each petal on its own phase
    if (started) target += Math.sin(now * 0.7 + index * 2.1 + BREATH_PHASE[kind]) * 0.02 * calm
    hinge.current.rotation.x = spring(open.current, target, dt, kind === 'project' ? 38 : 55, 7.5)
    const g = spring(grow.current, started ? 1 : 0.35, dt, 60, 10)

    const p = sh.progress
    let release
    if (kind === 'project') {
      // release: fly outward along the petal's own length, past the screen edge, tumbling as it goes
      release = smooth(range(p, 0.42 + index * 0.06, 0.72 + index * 0.06))
      const pr = fx.current.present
      lift.current.position.set(0, release * 11, release * 2 - pr * 0.1)
      lift.current.rotation.set(-release * 0.8, release * (index % 2 ? 1.6 : -1.6), Math.sin(now * 2.3 + index * 1.7) * release * 0.45 * calm)
      lift.current.scale.setScalar(g * size * (1 + pr * 0.04))
      // where the hovered petal sits on screen, for the DOM preview card
      if (hov) {
        const c = _v1.set(0, PROJECT_PETAL.length * 0.55, 0).applyMatrix4(lift.current.matrixWorld).project(state.camera)
        bloomAnchor.x = (c.x * 0.5 + 0.5) * state.size.width
        bloomAnchor.y = (-c.y * 0.5 + 0.5) * state.size.height
      }
    } else {
      release = kind === 'inner' ? range(p, 0.5, 0.75) : range(p, 0.6, 0.85)
      lift.current.scale.setScalar(g * size * (1 - smooth(release)) + 0.0001)
    }

    const u = mesh.current.material.userData.uniforms
    u.uTime.value = now
    u.uHover.value = fx.current.hover
    u.uDim.value = fx.current.dim
    u.uGlow.value = 0.85 + sh.bloom * 0.9 + sh.proximity * 0.35 + fx.current.hover * 0.5
    u.uFlutter.value = calm * (0.012 + sh.bloom * 0.012 + release * 0.04)
  })

  return (
    <group rotation-y={azimuth}>
      <group position-z={PETAL_BASE[kind]}>
        <group ref={hinge}>
          <group ref={lift}>
            <mesh ref={mesh} geometry={geometry} material={material} userData={{ projectId }} />
          </group>
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
    const specks = [palette.paper.hi, palette.paper.hi, palette.iris[300], palette.iris[300], palette.iris[400], palette.marigold[300], palette.iris[600]].map((c) => new THREE.Color(c))
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

  // every petal gets its own shape and material (one shared shader program)
  const petals = useMemo(
    () => ({
      project: PETAL_PROJECTS.map((_, i) => petalPart(PROJECT_PETAL, i, PETAL_TONE.project)),
      inner: [0, 1, 2, 3].map((i) => petalPart(INNER_PETAL, 4 + i, PETAL_TONE.inner)),
      crown: CROWN.map((_, i) => petalPart(CROWN_PETAL, 8 + i, PETAL_TONE.crown)),
      loose: Array.from({ length: LOOSE_COUNT.desktop }, (_, i) => petalPart(LOOSE_PETAL, 20 + i, PETAL_TONE.loose)),
    }),
    []
  )

  // a soft violet shadow under the flower
  const floorTex = useMemo(
    () =>
      radialTexture([
        [0, palette.alpha(palette.iris[700], 0.5)],
        [0.35, palette.alpha(palette.iris[600], 0.22)],
        [0.7, palette.alpha(palette.iris[400], 0.08)],
        [1, palette.alpha(palette.iris[400], 0)],
      ]),
    []
  )
  const atmosphere = useMemo(() => makeAtmosphere(), [])

  // R3F only disposes what it builds from JSX, so free the flower's GPU copies when the hero unmounts
  useEffect(
    () => () => {
      Object.values(petals)
        .flat()
        .forEach(({ geometry, material }) => {
          geometry.dispose()
          material.dispose()
        })
      floorTex.dispose()
    },
    [petals, floorTex]
  )

  const shared = useRef({ start: Infinity, reduced: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, progress: 0, proximity: 0, bloom: 0, bloomAt: -10, hovered: null, yaw: 0, yawVel: 0 })
  const root = useRef()
  const tilt = useRef()
  const spin = useRef()
  const backdrop = useRef()
  const loose = useRef()
  const floor = useRef()
  const pointer = useRef({ down: false, moved: false, held: false, holdTimer: 0, target: null })

  const looseDefs = useMemo(
    () =>
      Array.from({ length: mobile ? LOOSE_COUNT.mobile : LOOSE_COUNT.desktop }, (_, i) => ({
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
      e.x += PROJECT_PETAL.length * scale * 1.15
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

    // Loose petals drift and tumble, rocking like real petals on the air
    loose.current.children.forEach((m, i) => {
      const d = looseDefs[i]
      m.rotation.set(
        d.rot[0] + Math.sin(t * 0.5 + i * 1.3) * 0.6 * calm,
        d.rot[1] + t * 0.12 * calm,
        d.rot[2] + Math.sin(t * 0.8 + i * 2.2) * 0.35 * calm
      )
      const u = m.material.userData.uniforms
      u.uTime.value = t
      u.uFlutter.value = 0.02 * calm
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
        <Lightformer intensity={1.8} color={palette.paper.hi} position={[-7, 2, 1]} scale={[3, 9, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={1} color={PAL.pearl} position={[0, -4, 3]} scale={[12, 3, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
      <directionalLight position={[2, 6, 5]} intensity={1.2} />
      <pointLight position={[0, -0.2, 0.6]} color={PAL.corn} intensity={6} distance={4} />

      {/* Opaque atmosphere behind everything; also carries the dusk */}
      <mesh ref={backdrop} position={[0, 0, -6]} material={atmosphere}>
        <planeGeometry args={[120, 120]} />
      </mesh>

      <NameLines shared={shared} />

      <group ref={root}>
        {/* soft shadow pool under the flower */}
        <mesh ref={floor} position={[0, -2.1, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[9, 5]} />
          <meshBasicMaterial map={floorTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        <group ref={tilt}>
          <group ref={spin}>
            {PETAL_PROJECTS.map((id, i) => (
              <group key={id} onPointerOver={onOver} onPointerOut={onOut} onPointerDown={onDown}>
                <Petal
                  {...petals.project[i]}
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
              {/* second, smaller ring between the project petals */}
              {petals.inner.map((part, i) => (
                <Petal
                  key={`i${i}`}
                  {...part}
                  azimuth={i * (Math.PI / 2) + Math.PI / 4}
                  rest={0.6}
                  index={i}
                  kind="inner"
                  shared={shared}
                  size={0.7}
                />
              ))}
              {CROWN.map((c, i) => (
                <Petal
                  key={`c${i}`}
                  {...petals.crown[i]}
                  azimuth={c.az}
                  rest={c.rest}
                  index={i}
                  kind="crown"
                  shared={shared}
                  size={c.size}
                />
              ))}
            </group>
            <FlowerHeart shared={shared} mobile={mobile} onPointerDown={onDown} />
          </group>
        </group>
      </group>

      <group ref={loose}>
        {looseDefs.map((d, i) => (
          <mesh key={i} {...petals.loose[i]} position={d.pos} rotation={d.rot} scale={d.s} />
        ))}
      </group>

      <Pollen count={mobile ? 180 : 520} shared={shared} />
    </>
  )
}
