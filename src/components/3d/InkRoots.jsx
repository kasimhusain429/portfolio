/* eslint-disable react-hooks/immutability -- three.js scene objects and uniforms are mutated every frame by design */
/**
 * InkRoots — "Ink Bloom" layer for the About section (Concept C).
 *
 * Rendered as a HUD pass over the shared canvas, in screen pixels, glued to
 * the About section's position on the page:
 *   - paper: mist/pearl watercolour paper with a torn, wet top edge that
 *     rises over the hero like the ground, and ink pooling into navy at the end
 *   - the Descent: the hero's seed falls onto the paper edge, lands as an
 *     ink drop and soaks outward; the root grows from that point
 *   - ink roots: ribbons with a navy core feathering into cornflower and a
 *     periwinkle bleed; the wet front wicks forward as you scroll
 *   - watercolour blooms spread beneath the portrait and each card
 *   - the cursor stirs the ink; clicks drop pigment that blooms
 */
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Hud, OrthographicCamera } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'
import { ink, subscribeInk, tipY } from '../../lib/inkStore'
import * as palette from '../../lib/palette'

// About is the teal section: roots grow in teal ink on paper, under an iris sky, and flood into the night ink below.
const PAL = {
  navy: palette.teal[700],
  corn: palette.teal[500],
  hya: palette.teal[400],
  peri: palette.teal[300],
  mist: palette.paper[2],
  pearl: palette.paper.base,
  sky: palette.iris[300],
  skyDeep: palette.iris[500],
  deep: palette.ink[900],
}
const clamp01 = (v) => Math.min(1, Math.max(0, v))

/* ─── GLSL ───────────────────────────────────────────────── */
const NOISE = /* glsl */ `
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
`
const COLORS = /* glsl */ `uniform vec3 cNavy, cCorn, cHya, cPeri, cMist, cPearl, cSky, cSkyDeep, cDeep;`

const PAPER_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = vec2(position.x, -position.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const PAPER_FRAG = /* glsl */ `
  uniform vec2 uSize, uImpactAt;
  uniform float uTime, uImpact;
  ${COLORS}
  varying vec2 vP;
  ${NOISE}
  void main() {
    vec2 p = vP;
    // torn, wet top edge
    float edge = (fbm(vec2(p.x * 0.006, 1.7)) - 0.5) * 46.0 + (noise(vec2(p.x * 0.05, 3.1)) - 0.5) * 8.0;
    float a = smoothstep(edge - 4.0, edge + 22.0, p.y);
    if (a <= 0.001) discard;

    vec3 col = mix(cPearl, cMist, 0.42);
    float w1 = fbm(p * 0.0011 + vec2(0.0, uTime * 0.006));
    float w2 = fbm(p * 0.0007 + vec2(5.2, -uTime * 0.004));
    col = mix(col, cPeri, smoothstep(0.42, 0.78, w1) * 0.45);
    col = mix(col, cHya, smoothstep(0.55, 0.85, w2) * 0.22);
    // wet iris band under the edge, meeting the hero's sky
    col = mix(col, cSky, (1.0 - smoothstep(0.0, 300.0, p.y - edge)) * 0.55);
    // dried watercolour line along the torn edge: the horizon the seed lands on
    float line = exp(-max(p.y - edge - 6.0, 0.0) / 7.0) * (0.75 + 0.25 * noise(vec2(p.x * 0.03, 2.0)));
    col = mix(col, mix(cSkyDeep, cSky, 0.45), line * 0.6);
    // paper fibres + tooth
    float fib = noise(vec2(p.x * 0.6, p.y * 0.04)) * 0.6 + noise(p * 0.9) * 0.4;
    col *= 0.972 + fib * 0.045;

    // the seed's ink drop soaks outward from the impact point
    float d = length(p - uImpactAt) + (fbm(p * 0.02) - 0.5) * 80.0;
    float R = uImpact * 560.0;
    float on = step(0.001, uImpact);
    col = mix(col, cPeri, (1.0 - smoothstep(R * 0.5, R, d)) * 0.32 * on);
    col = mix(col, cHya, smoothstep(R * 0.72, R * 0.95, d) * (1.0 - smoothstep(R * 0.95, R * 1.03, d)) * 0.4 * on);

    // ink floods the bottom: teal deepens into the next section's night ink
    float b = uSize.y - p.y + (fbm(vec2(p.x * 0.004, 9.0)) - 0.5) * 140.0;
    col = mix(col, cCorn, (1.0 - smoothstep(140.0, 620.0, b)) * 0.9);
    col = mix(col, cNavy, 1.0 - smoothstep(120.0, 420.0, b));
    // pure night ink along the whole bottom edge (b wobbles ±70px with the noise), so it meets the sky below seamlessly
    col = mix(col, cDeep, 1.0 - smoothstep(80.0, 340.0, b));

    col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

const RIBBON_VERT = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uStir;
  varying vec2 vUv;
  varying vec2 vP;
  void main() {
    vec2 sp = vec2(position.x, -position.y);
    // stirring: ink swirls around the cursor like a brush through water
    vec2 d = sp - uMouse;
    float f = exp(-dot(d, d) / (150.0 * 150.0)) * uStir;
    vec2 dir = normalize(d + 1e-4);
    sp += vec2(-dir.y, dir.x) * f * 26.0 + dir * f * 8.0;
    vUv = uv;
    vP = sp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(sp.x, -sp.y, 0.0, 1.0);
  }
`
const RIBBON_FRAG = /* glsl */ `
  uniform float uGrow, uTime, uSeed, uHalo, uDark, uFront;
  ${COLORS}
  varying vec2 vUv;
  varying vec2 vP;
  ${NOISE}
  void main() {
    float s = vUv.x;
    float e = abs(vUv.y);
    float n = fbm(vP * 0.035 + uSeed);
    float n2 = noise(vP * 0.09 + uSeed * 3.0);

    // wicking front: the wet edge creeps ahead unevenly
    float front = uGrow - s + (n - 0.5) * uFront;
    if (front < -2.0) discard;
    float grown = smoothstep(-2.0, 14.0, front);

    // brush pressure varies along the stroke
    float core = (1.0 / uHalo) * (0.72 + 0.56 * noise(vec2(s * 0.012, uSeed * 5.0)));
    float rag = (n - 0.5) * 0.4 * core;
    float body = 1.0 - smoothstep(core * 0.6 + rag, core + rag, e);
    float rim = body * smoothstep(core * 0.3, core * 0.92 + rag, e);
    float halo = (1.0 - smoothstep(core * 0.8, 1.0, e + (n2 - 0.5) * 0.25)) * (1.0 - body);
    float pool = exp(-max(front, 0.0) / 10.0) * body;

    vec3 inkC = mix(cCorn, cNavy, clamp(uDark * (1.0 - e / core) + rim * 0.45 + pool * 0.6, 0.0, 1.0));
    vec3 col = mix(mix(cHya, cPeri, n2), inkC, body);
    float a = (body * (0.82 + 0.18 * n2) + halo * 0.5) * grown;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

const BLOOM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const BLOOM_FRAG = /* glsl */ `
  uniform float uReveal, uPulse, uFade, uSeed, uTime, uDeep, uLobe;
  uniform vec2 uPx;
  ${COLORS}
  varying vec2 vUv;
  ${NOISE}
  void main() {
    vec2 q = vUv;
    vec2 np = q * uPx * 0.006 + uSeed * 7.0;
    float n = fbm(np + vec2(uTime * 0.02, 0.0));
    float n2 = fbm(np * 3.0);
    float ang = atan(q.y, q.x);
    float lobes = (0.07 * sin(ang * 5.0 + uSeed * 6.0) + 0.05 * sin(ang * 3.0 - uSeed * 2.0)) * uLobe;
    float r = length(q) + (n - 0.5) * 0.26 - lobes;
    float R = uReveal * (0.86 + uPulse * 0.1);
    if (R < 0.001 || r > R + 0.02) discard;
    float body = 1.0 - smoothstep(R - 0.07, R, r);
    float rim = smoothstep(R - 0.24, R - 0.02, r) * body;
    float centre = 1.0 - smoothstep(0.0, R * 0.85, r);
    vec3 col = mix(cPeri, cCorn, clamp(rim * 0.85 + (1.0 - centre) * 0.2 + uDeep * 0.25, 0.0, 1.0));
    col = mix(col, cHya, n2 * 0.35);
    float a = body * (0.22 + rim * 0.5 + n2 * 0.12 + uPulse * 0.12 + uDeep * 0.12) * uFade;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

/* ─── Builders ───────────────────────────────────────────── */
function ribbonGeometry(pts, w0, w1, halo) {
  const n = pts.length
  const ss = new Float32Array(n)
  const ys = new Float32Array(n)
  let L = 0
  for (let i = 0; i < n; i++) {
    if (i) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    ss[i] = L
    ys[i] = pts[i].y
  }
  const pos = new Float32Array(n * 6)
  const uv = new Float32Array(n * 4)
  const index = []
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(n - 1, i + 1)]
    let tx = b.x - a.x
    let ty = b.y - a.y
    const tl = Math.hypot(tx, ty) || 1
    tx /= tl
    ty /= tl
    const nx = -ty
    const ny = tx
    const k = L ? ss[i] / L : 0
    const hw = (w0 + (w1 - w0) * k) * halo * 0.5
    const p = pts[i]
    pos.set([p.x + nx * hw, -(p.y + ny * hw), 0, p.x - nx * hw, -(p.y - ny * hw), 0], i * 6)
    uv.set([ss[i], -1, ss[i], 1], i * 4)
    if (i < n - 1) {
      const q = i * 2
      index.push(q, q + 1, q + 2, q + 1, q + 3, q + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeBoundingSphere()
  return { geometry: g, L, ss, ys }
}

/** arc length at which a (monotonic-in-y) ribbon reaches height y */
function sAtY(ys, ss, y) {
  let lo = 0
  let hi = ys.length - 1
  if (y <= ys[0]) return 0
  if (y >= ys[hi]) return ss[hi]
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (ys[mid] < y) lo = mid
    else hi = mid
  }
  const t = (y - ys[lo]) / (ys[hi] - ys[lo] || 1)
  return ss[lo] + (ss[hi] - ss[lo]) * t
}

function radialTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  // a glossy ink drop: paper highlight, teal body deepening to a dark core, soft teal glow
  g.addColorStop(0, palette.alpha(palette.paper.base, 1))
  g.addColorStop(0.07, palette.alpha(palette.teal[300], 1))
  g.addColorStop(0.17, palette.alpha(palette.teal[500], 1))
  g.addColorStop(0.3, palette.alpha(palette.teal[700], 1))
  g.addColorStop(0.36, palette.alpha(palette.teal[500], 0.6))
  g.addColorStop(0.62, palette.alpha(palette.teal[300], 0.28))
  g.addColorStop(1, palette.alpha(palette.teal[300], 0))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ─── The ink world ──────────────────────────────────────── */
function InkWorld() {
  const geom = useSyncExternalStore(subscribeInk, () => ink.geom)
  const { size } = useThree()
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  // uniforms shared by every material (updated once per frame)
  const shared = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uStir: { value: 0 },
      cNavy: { value: new THREE.Color(PAL.navy) },
      cCorn: { value: new THREE.Color(PAL.corn) },
      cHya: { value: new THREE.Color(PAL.hya) },
      cPeri: { value: new THREE.Color(PAL.peri) },
      cMist: { value: new THREE.Color(PAL.mist) },
      cPearl: { value: new THREE.Color(PAL.pearl) },
      cSky: { value: new THREE.Color(PAL.sky) },
      cSkyDeep: { value: new THREE.Color(PAL.skyDeep) },
      cDeep: { value: new THREE.Color(PAL.deep) },
    }),
    [],
  )

  const built = useMemo(() => {
    if (!geom) return null
    const mobile = geom.w < 768
    const root = new THREE.Group()
    const mk = (vert, frag, uniforms, order) => {
      const m = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: { ...shared, ...uniforms },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      m.userData.order = order
      return m
    }

    // paper
    const paperGeo = new THREE.PlaneGeometry(geom.w, geom.h)
    paperGeo.translate(geom.w / 2, -geom.h / 2, 0)
    const paperMat = mk(
      PAPER_VERT,
      PAPER_FRAG,
      {
        uSize: { value: new THREE.Vector2(geom.w, geom.h) },
        uImpactAt: { value: new THREE.Vector2(geom.trunkX, 0) },
        uImpact: { value: 0 },
      },
      0,
    )
    const paper = new THREE.Mesh(paperGeo, paperMat)
    paper.renderOrder = 0
    root.add(paper)

    // blooms (splash at the impact point, portrait + 4 cards, pigment drops)
    const bloom = (x, y, rx, ry, seed, order, deep = 0, lobe = 1) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        mk(
          BLOOM_VERT,
          BLOOM_FRAG,
          {
            uReveal: { value: 0 },
            uPulse: { value: 0 },
            uFade: { value: 1 },
            uSeed: { value: seed },
            uDeep: { value: deep },
            uLobe: { value: lobe },
            uPx: { value: new THREE.Vector2(rx, ry) },
          },
          order,
        ),
      )
      m.position.set(x, -y, 0)
      m.scale.set(rx, ry, 1)
      m.renderOrder = order
      m.userData.anim = { reveal: 0, pulse: 0 }
      root.add(m)
      return m
    }
    const splash = bloom(geom.trunkX, 8, mobile ? 130 : 210, mobile ? 110 : 160, 0.37, 1, 0.4, 0.3)
    const blooms = geom.blooms.map((b, i) =>
      bloom(b.x, b.y, b.w / 2 + (i === 0 ? 120 : 90), b.h / 2 + (i === 0 ? 110 : 80), 1.3 + i * 0.77, 1),
    )
    const drops = Array.from({ length: 6 }, (_, i) => {
      const m = bloom(-999, -999, 70, 70, 4.1 + i, 2, 0.6)
      m.visible = false
      return m
    })

    // ink ribbons
    const ribbon = (pts, w0, w1, halo, dark, front, seed, order) => {
      const r = ribbonGeometry(pts, w0, w1, halo)
      const mat = mk(
        RIBBON_VERT,
        RIBBON_FRAG,
        {
          uGrow: { value: 0 },
          uSeed: { value: seed },
          uHalo: { value: halo },
          uDark: { value: dark },
          uFront: { value: front },
        },
        order,
      )
      const mesh = new THREE.Mesh(r.geometry, mat)
      mesh.renderOrder = order
      mesh.frustumCulled = false
      root.add(mesh)
      return { mesh, ...r }
    }
    const rootlets = geom.rootlets.map((r, i) => ribbon(r.pts, r.w * 3.2, 0.6, 2.6, 0.5, 8, 10 + i * 0.37, 3))
    const branches = geom.branches.map((b, i) => ribbon(b.pts, mobile ? 6 : 8, 2.2, 3, 0.78, 22, 3 + i * 1.1, 4))
    const trunk = ribbon(geom.trunkPts, mobile ? 10 : 15, mobile ? 4 : 5, 3, 0.92, 34, 0.5, 5)

    return { root, paper, splash, blooms, drops, rootlets, branches, trunk }
  }, [geom, shared])

  useEffect(
    () => () => {
      built?.root.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose()
          o.material.dispose()
        }
      })
    },
    [built],
  )

  // falling seed + short light trail (screen space, outside the section group)
  const seed = useMemo(() => {
    const tex = radialTexture()
    const group = new THREE.Group()
    const parts = Array.from({ length: 7 }, (_, i) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          opacity: i ? 0.5 - i * 0.06 : 1,
        }),
      )
      m.renderOrder = 10 - i
      group.add(m)
      return m
    })
    group.visible = false
    return { group, parts, trail: [] }
  }, [])

  useFrame((state, dt) => {
    if (!built || !ink.section) return
    dt = Math.min(dt, 0.05)
    const W = size.width
    const H = size.height
    const vh = window.innerHeight
    const rect = ink.section.getBoundingClientRect()
    const now = performance.now()
    shared.uTime.value = state.clock.elapsedTime

    // glue the section group to the page
    built.root.position.set(rect.left - W / 2, H / 2 - rect.top, 0)

    // the Descent: seed falls as the paper's edge rises, then lands as an ink drop
    const fall = reduce ? 1 : clamp01((vh * 0.98 - rect.top) / (vh * 0.38))
    ink.fallT = fall
    const impact = reduce ? 1 : clamp01((vh * 0.6 - rect.top) / (vh * 0.42))
    built.paper.material.uniforms.uImpact.value = impact
    const sp = built.splash.userData.anim
    easing.damp(sp, 'reveal', impact > 0 ? 0.35 + impact * 0.65 : 0, 0.35, dt)
    built.splash.material.uniforms.uReveal.value = sp.reveal

    const sx0 = ink.heroSeed.x ?? W / 2
    const sy0 = ink.heroSeed.y ?? vh * 0.5
    const ex = rect.left + geom.trunkX
    const ey = rect.top + 4
    const falling = fall > 0 && fall < 1
    seed.group.visible = falling
    if (falling) {
      const e = fall * fall
      const x = sx0 + (ex - sx0) * e + Math.sin(fall * Math.PI * 3) * 10 * (1 - fall)
      const y = sy0 + (ey - sy0) * e
      seed.trail.unshift([x, y])
      seed.trail.length = Math.min(seed.trail.length, seed.parts.length * 2)
      seed.parts.forEach((m, i) => {
        const p = seed.trail[Math.min(i * 2, seed.trail.length - 1)]
        m.position.set(p[0] - W / 2, H / 2 - p[1], 0)
        const s = (i ? 40 - i * 4 : 60) * (1 - fall * 0.2)
        m.scale.set(s, s, 1)
      })
    } else seed.trail.length = 0

    // stir decays; drops age
    ink.stir *= Math.exp(-dt * 1.8)
    shared.uStir.value = reduce ? 0 : ink.stir
    shared.uMouse.value.set(ink.mouse.x, ink.mouse.y)

    // growth
    const ty = tipY(rect, geom.endY, reduce)
    built.trunk.mesh.material.uniforms.uGrow.value = sAtY(built.trunk.ys, built.trunk.ss, ty) + (ty > 2 ? 4 : -40)
    const act = geom.branches.map((b, i) => {
      const p = clamp01((ty - b.y0) / b.span)
      const r = built.branches[i]
      r.mesh.material.uniforms.uGrow.value = p > 0 ? p * r.L + 6 : -40
      return p > 0.9
    })
    geom.rootlets.forEach((rl, i) => {
      const p = clamp01((ty - rl.y0) / rl.span)
      const r = built.rootlets[i]
      r.mesh.material.uniforms.uGrow.value = p > 0 ? p * r.L + 3 : -40
    })

    // watercolour blooms spread slowly beneath the portrait and cards
    built.blooms.forEach((m, i) => {
      const a = m.userData.anim
      easing.damp(a, 'reveal', act[i] ? 1 : 0, act[i] ? 0.9 : 0.5, dt)
      easing.damp(a, 'pulse', ink.hover === i ? 1 : 0, 0.3, dt)
      m.material.uniforms.uReveal.value = a.reveal
      m.material.uniforms.uPulse.value = a.pulse
    })

    // pigment drops
    ink.drops = ink.drops.filter((d) => now - d.t < 7000)
    built.drops.forEach((m, i) => {
      const d = ink.drops[ink.drops.length - 1 - i]
      m.visible = !!d
      if (!d) return
      m.position.set(d.x, -d.y, 0)
      const k = (now - d.t) / 1000
      m.material.uniforms.uReveal.value = 1 - Math.pow(1 - clamp01(k / 1.4), 3)
      m.material.uniforms.uFade.value = 1 - clamp01((k - 4) / 3)
    })
  })

  if (!built) return null
  return (
    <>
      <primitive object={built.root} />
      <primitive object={seed.group} />
    </>
  )
}

export default function InkRoots() {
  return (
    <Hud renderPriority={1}>
      <OrthographicCamera makeDefault position={[0, 0, 100]} near={0.1} far={1000} />
      <InkWorld />
    </Hud>
  )
}
