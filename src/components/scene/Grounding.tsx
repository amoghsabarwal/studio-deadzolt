"use client";

import { useMemo } from "react";
import { AdditiveBlending, CanvasTexture, SRGBColorSpace } from "three";

let shared: CanvasTexture | null = null;

// A soft radial falloff, made once and shared by every object.
function glowTexture() {
  if (shared) return shared;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  shared = new CanvasTexture(canvas);
  shared.colorSpace = SRGBColorSpace;
  return shared;
}

// Places a chrome object in the scene instead of leaving it cut out against
// black: a faint light behind it, so its silhouette separates from the
// background, and a pool of light beneath it, as if it hovers over a floor.
export default function Grounding({ radius = 2, floor = -2.1 }: { radius?: number; floor?: number }) {
  const map = useMemo(() => glowTexture(), []);
  return (
    <group>
      <mesh position={[0, 0, -1.6]} renderOrder={-1}>
        <planeGeometry args={[radius * 4.4, radius * 4.4]} />
        <meshBasicMaterial map={map} transparent opacity={0.07} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0, floor, 0]} rotation={[-Math.PI / 2 + 0.32, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[radius * 3.2, radius * 1.6]} />
        <meshBasicMaterial map={map} transparent opacity={0.16} depthWrite={false} blending={AdditiveBlending} toneMapped={false} color="#d8dde3" />
      </mesh>
    </group>
  );
}
