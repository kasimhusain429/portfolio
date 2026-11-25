/**
 * Petal material: satin petals lit like real ones (MeshPhysicalMaterial with
 * a velvet sheen). Their colour comes from the petal's own (s, v) coordinates
 * rather than a texture, so it stays crisp at any size:
 *   - one hue, deep to light: a violet throat that pales to pearl at the tip,
 *     with the margins a step lighter than the midrib
 *   - fine parallel veins that fan from the base and fade before the tip
 *   - light passing through the thin margins, and a glow from the heart
 *   - on hover the petal fills with light from the base up
 * A slow flutter in the vertex shader keeps the margins alive.
 */
import * as THREE from 'three'
import * as palette from '../../../lib/palette'

const color = (hex) => new THREE.Color(hex)
const blend = (a, b, t) => color(a).lerp(color(b), t)

/** The bloom's single hue, deep to light. The uniform objects are shared by every petal. */
const RAMP = {
  cThroat: { value: blend(palette.ink[700], palette.iris[700], 0.5) },
  cDeep: { value: blend(palette.iris[700], palette.iris[600], 0.3) },
  cBody: { value: blend(palette.iris[500], palette.iris[400], 0.4) },
  cVeil: { value: blend(palette.iris[400], palette.iris[300], 0.55) },
  cLight: { value: blend(palette.iris[300], palette.paper[2], 0.5) },
}

/** Where each ring sits on the ramp: the outer petals are lightest, the crown deepest. */
export const PETAL_TONE = { project: 0, inner: 0.3, crown: 0.7, loose: 0.12 }

const VERT_HEAD = /* glsl */ `
  uniform float uTime, uSeed, uFlutter;
  attribute float aGrain;
  varying vec2 vPetal;
  varying float vGrain;
`

const VERT_FLUTTER = /* glsl */ `
  vPetal = uv;
  vGrain = aGrain;
  {
    // the margins and tip move most, as if in a light breeze
    float ps = uv.x * 2.0 - 1.0;
    float wave = sin(uTime * 1.6 + uv.y * 4.5 + uSeed * 5.3) + 0.6 * sin(uTime * 2.7 - ps * 2.4 + uSeed * 2.1);
    transformed += objectNormal * wave * uFlutter * (0.3 + ps * ps) * uv.y * uv.y;
  }
`

const FRAG_HEAD = /* glsl */ `
  uniform float uTime, uSeed, uTone, uHover, uDim, uGlow;
  uniform vec3 cThroat, cDeep, cBody, cVeil, cLight;
  varying vec2 vPetal;
  varying float vGrain; // slow colour variation, baked per vertex (petalGeometry)

  float pHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float pNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(pHash(i), pHash(i + vec2(1.0, 0.0)), f.x), mix(pHash(i + vec2(0.0, 1.0)), pHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  // a family of thin lines at the integer values of x, anti-aliased
  float pLines(float x, float halfWidth) {
    float d = abs(x - floor(x + 0.5));
    return 1.0 - smoothstep(halfWidth, halfWidth + fwidth(x) * 1.2 + 0.02, d);
  }
`

const FRAG_COLOR = /* glsl */ `
  float ps = vPetal.x * 2.0 - 1.0;
  float pv = vPetal.y;
  float pa = abs(ps);
  float pn = vGrain;
  // finer, per-pixel noise only where it shows: the veins' slight wander
  vec2 pq = vec2(ps * 4.0 - uSeed, pv * 7.0 + uSeed * 2.0);
  float pn2 = (pNoise(pq) * 0.5 + pNoise(pq * 2.03) * 0.25) / 0.75;

  // one hue, deep to light (each petal sits a touch lighter or deeper than its neighbours)
  float pt = pv + pa * pa * 0.2 + (pn - 0.5) * 0.22 - uTone * 0.3 + (fract(uSeed * 0.618) - 0.5) * 0.08;
  vec3 pc = mix(cThroat, cDeep, smoothstep(-0.04, 0.12, pt));
  pc = mix(pc, cBody, smoothstep(0.1, 0.42, pt));
  pc = mix(pc, cVeil, smoothstep(0.4, 0.74, pt));
  pc = mix(pc, cLight, smoothstep(0.66, 1.02, pt));
  // pigment gathers in a fine rim along the margins, which also keeps the edge crisp on pale backgrounds
  pc = mix(pc, cBody, smoothstep(0.88, 0.99, pa) * smoothstep(0.15, 0.55, pv) * 0.35);

  // veins: parallel, wandering a little, strongest in the lower half
  float pw = (pn2 - 0.5) * 0.1;
  float veins = pLines((ps + pw) * 7.0, 0.035) * 0.8 + pLines((ps + pw) * 7.0 + 0.5, 0.025) * 0.35;
  veins *= smoothstep(0.02, 0.14, pv) * (1.0 - smoothstep(0.3, 0.88, pv)) * (1.0 - smoothstep(0.7, 0.98, pa)) * (0.55 + 0.45 * pn);
  float rib = exp(-ps * ps / 0.0018) * (1.0 - smoothstep(0.04, 0.75, pv));
  pc = mix(pc, cDeep, veins * 0.32);
  pc = mix(pc, cVeil, rib * 0.22);

  // fine cell streaks along the length
  pc *= 0.955 + 0.09 * pNoise(vec2(ps * 42.0 + uSeed * 9.0, pv * 3.2));
  // less light reaches deep into the cup
  pc *= mix(0.6, 1.0, smoothstep(0.0, 0.32, pv));
  // the outer face is a little paler and silkier
  if (!gl_FrontFacing) pc = mix(pc, cVeil, 0.2);

  diffuseColor.rgb = pc * uDim;
`

const FRAG_LIGHT = /* glsl */ `
  {
    vec3 pView = normalize(vViewPosition);
    float pEdge = 1.0 - abs(dot(normal, pView));
    float pThin = smoothstep(0.55, 1.0, pa) * 0.6 + smoothstep(0.6, 1.0, pv) * 0.4;
    // light passing through the thin margins, brightest where the petal turns edge-on
    totalEmissiveRadiance += mix(cBody, cVeil, 0.6) * (pThin * 0.06 + pow(pEdge, 4.0) * 0.08) * uDim;
    // light from the heart, scattered inside the petal near its base
    totalEmissiveRadiance += mix(cBody, cVeil, 0.35) * exp(-pv * 6.5) * uGlow * 0.2;
    // hover: light fills the petal from the base up
    float pFill = (1.0 - smoothstep(uHover * 1.3 - 0.35, uHover * 1.3, pv)) * uHover;
    totalEmissiveRadiance += mix(cVeil, cLight, 0.5) * pFill * 0.2;
  }
`

// a soft shoulder so the palest petals never clip to flat white (the canvas has no tone mapping)
const FRAG_SHOULDER = /* glsl */ `
  outgoingLight = mix(outgoingLight, 0.75 + 0.25 * (1.0 - exp(-(outgoingLight - 0.75) * 4.0)), step(0.75, outgoingLight));
`

/**
 * One material per petal (they share a single compiled program). Drive it
 * through material.userData.uniforms: uTime, uHover, uDim, uGlow, uFlutter.
 */
export function makePetalMaterial({ seed = 0, tone = 0 } = {}) {
  const uniforms = {
    uTime: { value: 0 },
    uSeed: { value: seed },
    uTone: { value: tone },
    uHover: { value: 0 },
    uDim: { value: 1 },
    uGlow: { value: 0.85 },
    uFlutter: { value: 0 },
    ...RAMP,
  }
  const material = new THREE.MeshPhysicalMaterial({
    color: palette.paper.hi, // replaced per fragment by the petal colour
    roughness: 0.55,
    metalness: 0,
    sheen: 0.55,
    sheenRoughness: 0.5,
    sheenColor: color(palette.iris[300]),
    side: THREE.DoubleSide,
    envMapIntensity: 0.6,
  })
  material.userData.uniforms = uniforms
  material.customProgramCacheKey = () => 'bloom-petal'
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERT_HEAD}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERT_FLUTTER}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAG_HEAD}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${FRAG_COLOR}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAG_LIGHT}`)
      .replace('#include <opaque_fragment>', `${FRAG_SHOULDER}\n#include <opaque_fragment>`)
  }
  return material
}
