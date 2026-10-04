import { Color, Mesh, MeshPhysicalMaterial, type Material, type Object3D } from "three";

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
  });
}
