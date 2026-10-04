import { BufferGeometry, Float32BufferAttribute, Shape } from "three";

// Outline of the Deadzolt star, traced from the logo artwork (865px canvas,
// centred on 430,430). Tips alternate with valleys, clockwise from the
// long top-left spike.
const TRACE: [number, number][] = [
  [215, 150], [392, 316],
  [575, 172], [498, 404],
  [684, 470], [503, 492],
  [528, 718], [396, 548],
  [272, 558], [302, 470],
  [186, 420], [284, 382],
];

export function createStarShape() {
  const pts = TRACE.map(([x, y]) => [(x - 430) / 200, -(y - 430) / 200] as const);
  const shape = new Shape();
  shape.moveTo(...pts[0]);
  for (let i = 1; i <= pts.length; i++) {
    const [x, y] = pts[i % pts.length];
    const [px, py] = pts[i - 1];
    // Bow every edge slightly inwards so the spikes taper like liquid metal.
    const mx = (px + x) / 2;
    const my = (py + y) / 2;
    shape.quadraticCurveTo(mx * 0.72, my * 0.72, x, y);
  }
  return shape;
}

// An inflated, pillow-like version of the star: smooth domed faces that meet
// in a soft rim, so chrome reflections roll across the surface instead of
// sitting flat. Built as a polar mesh from the centre out to the outline.
export function createPuffyStarGeometry({
  segments = 1024,
  rings = 48,
  depth = 0.42,
}: { segments?: number; rings?: number; depth?: number } = {}) {
  const outline = createStarShape().getPoints(64);

  // Distance from the centre to the outline along a given angle.
  const radiusAt = (angle: number) => {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let best = Infinity;
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const b = outline[(i + 1) % outline.length];
      const ex = b.x - a.x;
      const ey = b.y - a.y;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = (a.x * ey - a.y * ex) / den;
      const u = (a.x * dy - a.y * dx) / den;
      if (t > 0 && u >= 0 && u <= 1 && t < best) best = t;
    }
    return best;
  };

  const radii = Array.from({ length: segments }, (_, i) => radiusAt((i / segments) * Math.PI * 2));

  const positions: number[] = [];
  const indices: number[] = [];

  // Front and back faces share the rim ring so the edge stays watertight.
  const ringCount = rings;
  const vertex = (side: number, ring: number, seg: number) => {
    if (ring === 0) return side; // the two centre points
    if (ring === ringCount) return 2 + seg; // shared rim
    return 2 + segments + side * (ringCount - 1) * segments + (ring - 1) * segments + seg;
  };

  positions.push(0, 0, depth, 0, 0, -depth);
  for (let s = 0; s < segments; s++) {
    const a = (s / segments) * Math.PI * 2;
    positions.push(Math.cos(a) * radii[s], Math.sin(a) * radii[s], 0);
  }
  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1;
    for (let r = 1; r < ringCount; r++) {
      const t = r / ringCount;
      const z = sign * depth * Math.pow(1 - Math.pow(t, 2.2), 0.55);
      for (let s = 0; s < segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        positions.push(Math.cos(a) * radii[s] * t, Math.sin(a) * radii[s] * t, z);
      }
    }
  }

  for (let side = 0; side < 2; side++) {
    for (let s = 0; s < segments; s++) {
      const n = (s + 1) % segments;
      // Centre fan.
      const c = vertex(side, 0, 0);
      const a = vertex(side, 1, s);
      const b = vertex(side, 1, n);
      if (side === 0) indices.push(c, a, b);
      else indices.push(c, b, a);
      for (let r = 1; r < ringCount; r++) {
        const i0 = vertex(side, r, s);
        const i1 = vertex(side, r, n);
        const j0 = vertex(side, r + 1, s);
        const j1 = vertex(side, r + 1, n);
        if (side === 0) indices.push(i0, j0, j1, i0, j1, i1);
        else indices.push(i0, j1, j0, i0, i1, j1);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
