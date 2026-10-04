"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Group,
  MathUtils,
  type ShaderMaterial,
} from "three";
import { getTilt } from "@/lib/tilt";

/*
  Deep space behind every page. Scrolling flies the visitor forward through
  it, so the whole site reads as one journey:
  - a nebula sky: slow, dark gas with a faint band of light across it,
  - two star layers: a far field that barely moves, and near stars that
    stream past with real depth (they wrap round, so the trip never ends),
  - an eclipsed planet, a black disc with a thin lit rim, that the visitor
    leaves behind as they scroll.
  Everything is drawn in shaders with no textures to download. Phones get
  fewer stars and a lighter nebula.
*/

// How far the visitor travels per screen of scroll, in scene units.
const TRAVEL_PER_SCREEN = 7;
const DEPTH = 120;
const NEAR = 6;

// Keeps a value in step with the page scroll, smoothed, plus its speed.
function useTravel() {
  const travel = useRef({ value: 0, speed: 0 });
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const target = (window.scrollY / Math.max(window.innerHeight, 1)) * TRAVEL_PER_SCREEN;
    const t = travel.current;
    const next = MathUtils.damp(t.value, target, 3, dt);
    t.speed = MathUtils.damp(t.speed, (next - t.value) / Math.max(dt, 0.001), 6, dt);
    t.value = next;
  });
  return travel;
}

const NOISE = /* glsl */ `
float sHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float sNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(sHash(i), sHash(i + vec3(1, 0, 0)), f.x), mix(sHash(i + vec3(0, 1, 0)), sHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(sHash(i + vec3(0, 0, 1)), sHash(i + vec3(1, 0, 1)), f.x), mix(sHash(i + vec3(0, 1, 1)), sHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
`;

function Nebula({ rich }: { rich: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uTravel: { value: 0 } }), []);
  const travel = useTravel();
  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uTravel.value = travel.current.value;
  });
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[400, 48, 32]} />
      <shaderMaterial
        ref={material}
        side={BackSide}
        depthWrite={false}
        uniforms={uniforms}
        defines={{ OCTAVES: rich ? 5 : 3 }}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform float uTravel;
          varying vec3 vDir;
          ${NOISE}
          float fbm(vec3 p) {
            float v = 0.0, a = 0.5;
            for (int i = 0; i < OCTAVES; i++) { v += a * sNoise(p); p *= 2.07; a *= 0.5; }
            return v;
          }
          void main() {
            vec3 d = normalize(vDir);
            // The sky drifts very slowly as the visitor travels.
            vec3 p = d * 2.2 + vec3(uTravel * 0.004, uTime * 0.004, -uTravel * 0.01);
            float gas = fbm(p);
            float wisps = fbm(p * 2.3 + gas * 1.4);
            // A faint band of light across the sky, like the galaxy's disc.
            float band = exp(-pow(dot(d, normalize(vec3(0.35, 1.0, 0.2))) * 3.2, 2.0));
            float glow = band * (0.35 + 0.65 * smoothstep(0.35, 0.8, wisps));
            // Cool blue gas with a trace of the studio red where it is thickest.
            vec3 col = vec3(0.012, 0.016, 0.03) * smoothstep(0.3, 0.75, gas);
            col += vec3(0.05, 0.06, 0.09) * glow * smoothstep(0.4, 0.75, gas);
            col += vec3(0.07, 0.006, 0.01) * pow(smoothstep(0.55, 0.85, wisps), 2.0) * band;
            // Dither, so the dark gradients never band.
            col += (sHash(vec3(gl_FragCoord.xy, uTime)) - 0.5) / 255.0;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

type StarLayer = { count: number; radius: [number, number]; depth: number; size: [number, number]; travel: number };

function makeStars({ count, radius, depth, size }: StarLayer, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  // Star colours from blue-white through white to warm, weighted to white.
  const palette = [new Color("#c9d8ff"), new Color("#ffffff"), new Color("#ffffff"), new Color("#fff1dc"), new Color("#ffd2b0")];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    // Spread evenly over a ring, so few stars sit right on the line of travel.
    const r = Math.sqrt(MathUtils.lerp(radius[0] ** 2, radius[1] ** 2, rand()));
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = Math.sin(a) * r;
    positions[i * 3 + 2] = -rand() * depth;
    // Most stars are faint; a few are bright enough to catch the bloom.
    sizes[i] = MathUtils.lerp(size[0], size[1], Math.pow(rand(), 6));
    const c = palette[Math.floor(rand() * palette.length)];
    colors.set([c.r, c.g, c.b], i * 3);
    phases[i] = rand() * Math.PI * 2;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aColor", new BufferAttribute(colors, 3));
  geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  return geometry;
}

function Stars({ layer, seed }: { layer: StarLayer; seed: number }) {
  const geometry = useMemo(() => makeStars(layer, seed), [layer, seed]);
  const dpr = useThree((s) => s.viewport.dpr);
  const uniforms = useMemo(
    () => ({ uTravel: { value: 0 }, uTime: { value: 0 }, uDpr: { value: 1 }, uWarp: { value: 0 } }),
    [],
  );
  const material = useRef<ShaderMaterial>(null);
  const travel = useTravel();
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTravel.value = travel.current.value * layer.travel;
    u.uTime.value = state.clock.elapsedTime;
    u.uDpr.value = dpr;
    // Fast scrolling swells the near stars a little, like a jump to speed.
    u.uWarp.value = Math.min(Math.abs(travel.current.speed) * layer.travel * 0.02, 1);
  });
  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-5}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={uniforms}
        defines={{ DEPTH: layer.depth.toFixed(1), NEAR: NEAR.toFixed(1) }}
        vertexShader={/* glsl */ `
          attribute float aSize;
          attribute vec3 aColor;
          attribute float aPhase;
          uniform float uTravel;
          uniform float uTime;
          uniform float uDpr;
          uniform float uWarp;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            // Stars stream towards the camera and wrap round to the far end.
            p.z = mod(p.z + uTravel, DEPTH) - DEPTH + NEAR;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float dist = -mv.z;
            // Fade in from the far end and out just before passing the camera.
            float fade = smoothstep(DEPTH - NEAR, DEPTH * 0.7, dist) * smoothstep(0.5, 4.0, dist);
            float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + fract(aPhase) * 1.8) + aPhase * 7.0);
            float px = aSize * uDpr * (1.0 + uWarp * 1.5) * 60.0 / dist;
            // Stars smaller than a pixel dim instead of shimmering.
            vAlpha = fade * twinkle * clamp(px / (1.5 * uDpr), 0.0, 1.0);
            gl_PointSize = clamp(px, 1.5 * uDpr, 48.0 * uDpr);
            vColor = aColor;
          }
        `}
        fragmentShader={/* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float core = exp(-d * d * 90.0);
            float halo = exp(-d * d * 14.0) * 0.18;
            // Soft cross flare on the brightest, as a lens sees it.
            float flare = (max(0.0, 1.0 - abs(uv.x) * 28.0) + max(0.0, 1.0 - abs(uv.y) * 28.0)) * max(0.0, 0.5 - d) * 0.5;
            float a = (core + halo + flare) * vAlpha;
            if (a < 0.003) discard;
            gl_FragColor = vec4(vColor * a * 1.6, a);
          }
        `}
      />
    </points>
  );
}

// A planet in eclipse: a black disc whose atmosphere is lit from behind, so
// only a thin crescent of light shows. The visitor leaves it behind.
function Planet({ rich }: { rich: boolean }) {
  const group = useRef<Group>(null);
  const travel = useTravel();
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > viewport.height;
  const uniforms = useMemo(() => ({ uLight: { value: [0.55, 0.75, -0.35] } }), []);
  useFrame(() => {
    if (!group.current) return;
    const t = travel.current.value;
    group.current.position.set(wide ? -24 : -9, (wide ? -40 : -50) - t * 1.1, -80 - t * 1.6);
  });
  const shared = {
    uniforms,
    transparent: true,
    depthWrite: false,
  };
  return (
    <group ref={group}>
      {/* The planet's dark face, with a hint of the rim lighting its edge. */}
      <mesh renderOrder={-4}>
        <sphereGeometry args={[22, rich ? 128 : 64, rich ? 64 : 32]} />
        <shaderMaterial
          {...shared}
          transparent={false}
          depthWrite
          vertexShader={/* glsl */ `
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uLight;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vec3 l = normalize(uLight);
              float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
              float lit = smoothstep(-0.2, 0.6, dot(vNormal, l));
              // The night side is pure black, so it blots out the stars behind
              // it; only a sliver of the lit limb shows on the surface itself.
              vec3 col = vec3(1.0, 0.82, 0.7) * pow(rim, 6.0) * pow(lit, 3.0) * 0.6;
              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>
      {/* The atmosphere: a glowing shell, brightest along the lit limb. */}
      <mesh renderOrder={-3} scale={1.06}>
        <sphereGeometry args={[22, rich ? 128 : 64, rich ? 64 : 32]} />
        <shaderMaterial
          {...shared}
          side={BackSide}
          blending={AdditiveBlending}
          vertexShader={/* glsl */ `
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vView = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            uniform vec3 uLight;
            varying vec3 vNormal;
            varying vec3 vView;
            void main() {
              // Back faces of the shell, so the normal still points outward.
              vec3 n = vNormal;
              float facing = dot(n, vView);
              // Strongest just outside the disc, fading into space.
              float edge = clamp(1.0 - abs(facing) * 1.3, 0.0, 1.0);
              float haze = pow(edge, 3.0);
              float limb = pow(edge, 22.0);
              float lit = pow(smoothstep(-0.05, 0.9, dot(n, normalize(uLight))), 1.5);
              vec3 warm = vec3(1.0, 0.45, 0.32);
              vec3 white = vec3(1.0, 0.95, 0.9);
              // A thin white-hot limb where the sun grazes the atmosphere,
              // inside a wider warm haze; the far side stays dark.
              vec3 col = (white * limb * 4.0 + warm * haze * 0.35) * lit + warm * haze * 0.015;
              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>
    </group>
  );
}

// The whole of space leans a touch with the visitor, for parallax.
export default function Space({ rich, animate }: { rich: boolean; animate: boolean }) {
  const root = useRef<Group>(null);
  const layers = useMemo<{ far: StarLayer; near: StarLayer }>(
    () => ({
      far: { count: rich ? 5000 : 2200, radius: [60, 260], depth: 300, size: [3, 16], travel: 0.04 },
      near: { count: rich ? 1400 : 650, radius: [3.5, 34], depth: DEPTH, size: [0.35, 2.2], travel: 1 },
    }),
    [rich],
  );
  useFrame((_, delta) => {
    if (!root.current || !animate) return;
    const dt = Math.min(delta, 0.05);
    const tilt = getTilt();
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, -tilt.x * 0.04, 2, dt);
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, tilt.y * 0.03, 2, dt);
  });
  return (
    <group ref={root}>
      <Nebula rich={rich} />
      <Stars layer={layers.far} seed={7} />
      <Stars layer={layers.near} seed={42} />
      <Planet rich={rich} />
    </group>
  );
}
