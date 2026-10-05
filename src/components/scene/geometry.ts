import { BufferAttribute, BufferGeometry, type Matrix4, Mesh, type Object3D } from "three";

// The models are stored quantized (small integers plus a scale and offset on
// each mesh's node), which halves the download. The surface detail and the
// asteroid centring work in the model's real units, so these turn a mesh
// back into plain floats with its node transform baked in.

export function toModelSpace(geometry: BufferGeometry, matrix: Matrix4) {
  const out = new BufferGeometry();
  out.setIndex(geometry.index);
  for (const [name, attr] of Object.entries(geometry.attributes)) {
    const size = attr.itemSize;
    const values = new Float32Array(attr.count * size);
    for (let i = 0; i < attr.count; i++) {
      values[i * size] = attr.getX(i);
      if (size > 1) values[i * size + 1] = attr.getY(i);
      if (size > 2) values[i * size + 2] = attr.getZ(i);
      if (size > 3) values[i * size + 3] = attr.getW(i);
    }
    out.setAttribute(name, new BufferAttribute(values, size));
  }
  out.applyMatrix4(matrix);
  return out;
}

// Bakes every mesh's own transform into its geometry and resets it, so the
// meshes sit where they did with plain, unscaled coordinates. Call it on a
// copy of a model, never on the cached original.
export function bakeMeshes(root: Object3D) {
  root.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.updateMatrix();
    child.geometry = toModelSpace(child.geometry, child.matrix);
    child.position.set(0, 0, 0);
    child.quaternion.identity();
    child.scale.set(1, 1, 1);
  });
}
