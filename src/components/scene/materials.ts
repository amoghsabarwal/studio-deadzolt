import { Color, Mesh, MeshPhysicalMaterial, type Material, type Object3D, type WebGLProgramParametersWithUniforms } from "three";

// The studio's chrome finish. Two layers, like real plated metal: a softly
// blurred metal base under a sharp clear coat, so highlights stay crisp while
// reflections fall off gently across the curves. A faint thin-film sheen
// gives the holographic tint without turning the object into a rainbow.
export const REAL_CHROME = {
  color: new Color("#eef0f3"),
  metalness: 1,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.025,
  iridescence: 0.55,
  iridescenceIOR: 1.5,
  specularIntensity: 1,
  envMapIntensity: 1.15,
};

function isEmissive(material: Material) {
  const m = material as Partial<MeshPhysicalMaterial>;
  return Boolean(m.emissive && m.emissive.getHex() !== 0);
}

// Gives every chrome part of a loaded model the same finish as the star.
// Emissive parts, like the knob's red indicator, keep their own material.
// Call it on a copy of a model, never on the cached original.
export function applyRealChrome(root: Object3D) {
  root.traverse((child) => {
    if (!(child instanceof Mesh) || isEmissive(child.material)) return;
    const source = child.material as Partial<MeshPhysicalMaterial>;
    child.material = new MeshPhysicalMaterial({
      ...REAL_CHROME,
      roughness: Math.max(REAL_CHROME.roughness, source.roughness ?? 0),
      iridescence: source.iridescence ? REAL_CHROME.iridescence : 0,
      iridescenceThicknessRange: [180, 520],
    });
    withSurfaceDetail(child.material);
  });
}

/*
  Surface detail, so the chrome reads as a made object rather than a perfect
  mirror. Worked out in the model's own space (no UVs needed, and it turns
  with the model):
  - micro-roughness: fine grain that softens highlights unevenly,
  - spun finish: faint concentric tooling rings, like machined metal,
  - smudges: soft patches where the clear coat is hazed, like handling marks.
  Only roughness changes; the shape and the reflections stay sharp elsewhere.
*/
const SURFACE_NOISE = /* glsl */ `
varying vec3 vSurfPos;
float dzHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float dzNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dzHash(i), dzHash(i + vec3(1, 0, 0)), f.x), mix(dzHash(i + vec3(0, 1, 0)), dzHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(dzHash(i + vec3(0, 0, 1)), dzHash(i + vec3(1, 0, 1)), f.x), mix(dzHash(i + vec3(0, 1, 1)), dzHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float dzFbm(vec3 p) {
  return dzNoise(p) * 0.5 + dzNoise(p * 2.03) * 0.3 + dzNoise(p * 4.01) * 0.2;
}
`;

export const SURFACE = { micro: 0.04, spun: 0.03, smudge: 0.1, coatSmudge: 0.16 };

export function withSurfaceDetail(material: MeshPhysicalMaterial) {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSurfPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSurfPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\n" + SURFACE_NOISE)
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        vec3 sp = vSurfPos;
        float dzMicro = dzNoise(sp * 48.0) * 0.6 + dzNoise(sp * 131.0) * 0.4;
        float dzSpun = dzNoise(vec3(length(sp.xy) * 190.0, 0.5, 0.5));
        float dzSmudge = smoothstep(0.5, 0.8, dzFbm(sp * 1.4 + 3.7)) * (0.6 + 0.4 * dzNoise(sp * 9.0));
        roughnessFactor = clamp(roughnessFactor + (dzMicro - 0.5) * ${SURFACE.micro} + dzSpun * ${SURFACE.spun} * (1.0 - dzSmudge) + dzSmudge * ${SURFACE.smudge}, 0.03, 1.0);`,
      )
      .replace(
        "material.clearcoatRoughness = clearcoatRoughness;",
        `material.clearcoatRoughness = clearcoatRoughness + dzSmudge * ${SURFACE.coatSmudge} + dzMicro * 0.02;`,
      );
  };
  material.customProgramCacheKey = () => "dz-surface";
  return material;
}
