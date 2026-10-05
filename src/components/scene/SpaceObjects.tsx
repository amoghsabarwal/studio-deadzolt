"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { type Group, MathUtils, Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { bakeMeshes } from "./geometry";
import Retry from "./Retry";

/*
  Things passing by on the journey, both modelled in Blender:
  - chrome asteroids drifting along the edges of the view, tumbling slowly,
  - the DZ-01 probe, a small ship with red running lights, that the visitor
    catches up with as they scroll down to the work.
  They load one at a time as the visitor scrolls towards them, and keep their
  Blender materials.
*/

const ASTEROIDS_URL = "/models/asteroids-space.glb";
const PROBE_URL = "/models/probe-space.glb";
const TRAVEL_PER_SCREEN = 7;
// How far the asteroid stream runs before it wraps round.
const STREAM = 70;

function travelNow() {
  return (window.scrollY / Math.max(window.innerHeight, 1)) * TRAVEL_PER_SCREEN;
}

type Rock = { name: string; x: number; y: number; z: number; scale: number; spin: [number, number] };

// Placed in a loose ring around the line of travel, never across the copy.
const ROCKS: Rock[] = [
  { name: "Rock_A", x: -7.5, y: 3.2, z: -12, scale: 0.55, spin: [0.12, 0.2] },
  { name: "Rock_B", x: 8.5, y: -3.6, z: -22, scale: 0.8, spin: [-0.1, 0.15] },
  { name: "Rock_C", x: -9, y: -4.2, z: -34, scale: 1.1, spin: [0.08, -0.12] },
  { name: "Rock_D", x: 7, y: 4.4, z: -45, scale: 0.6, spin: [0.15, 0.1] },
  { name: "Rock_E", x: -6, y: 5.5, z: -56, scale: 0.9, spin: [-0.07, 0.18] },
  { name: "Rock_F", x: 10, y: 1.5, z: -66, scale: 0.7, spin: [0.11, -0.09] },
  { name: "Rock_B", x: -11, y: 0.5, z: -28, scale: 0.45, spin: [0.2, 0.05] },
  { name: "Rock_D", x: 5.5, y: -6, z: -60, scale: 1.2, spin: [-0.05, 0.1] },
];

function Asteroids({ count }: { count: number }) {
  const { nodes } = useGLTF(ASTEROIDS_URL) as unknown as { nodes: Record<string, Object3D> };
  const rocks = useMemo(
    () =>
      ROCKS.slice(0, count).map((r) => {
        // Each rock is centred on its own origin, so it tumbles about its middle.
        const model = nodes[r.name].clone(true);
        bakeMeshes(model);
        model.position.set(0, 0, 0);
        model.traverse((o) => {
          if (o instanceof Mesh) o.geometry.center();
        });
        return { ...r, model };
      }),
    [nodes, count],
  );
  const refs = useRef<(Group | null)[]>([]);
  const travel = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    travel.current = MathUtils.damp(travel.current, travelNow(), 3, dt);
    const t = state.clock.elapsedTime;
    rocks.forEach((r, i) => {
      const g = refs.current[i];
      if (!g) return;
      // Streams towards the camera and wraps round to the far end.
      const z = ((((r.z + travel.current) % STREAM) + STREAM) % STREAM) - STREAM + 4;
      g.position.set(r.x, r.y + Math.sin(t * 0.2 + i) * 0.15, z);
      g.rotation.x = t * r.spin[0];
      g.rotation.y = t * r.spin[1];
      // Grows in from the distance rather than popping.
      g.scale.setScalar(r.scale * MathUtils.smoothstep(z, -STREAM + 4, -STREAM + 16));
    });
  });

  return (
    <>
      {rocks.map((r, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
        >
          <primitive object={r.model} />
        </group>
      ))}
    </>
  );
}

function Probe() {
  const { scene } = useGLTF(PROBE_URL);
  const model = useMemo(() => scene.clone(true), [scene]);
  // Its running lights, which blink like a real craft's.
  const lights = useMemo(() => {
    const found: MeshStandardMaterial[] = [];
    model.traverse((o) => {
      const m = (o as { material?: MeshStandardMaterial }).material;
      if (m?.emissive && m.emissive.getHex() !== 0 && !found.includes(m)) {
        const own = m.clone();
        (o as { material?: MeshStandardMaterial }).material = own;
        found.push(own);
      }
    });
    return found;
  }, [model]);
  const root = useRef<Group>(null);
  const travel = useRef(0);
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > viewport.height;

  useFrame((state, delta) => {
    if (!root.current) return;
    const dt = Math.min(delta, 0.05);
    travel.current = MathUtils.damp(travel.current, travelNow(), 3, dt);
    const t = state.clock.elapsedTime;
    // Far ahead at the hero, alongside by the work, then it flies past the
    // camera and is gone.
    const z = -34 + travel.current * 1.2;
    const r = root.current;
    r.visible = z < 6;
    r.position.set(wide ? 4.2 : 1.2, (wide ? 2.6 : 3.2) + Math.sin(t * 0.5) * 0.12, z);
    r.rotation.set(0.25 + Math.sin(t * 0.3) * 0.05, -0.6 + t * 0.08, Math.sin(t * 0.4) * 0.08);
    const blink = Math.sin(t * 3) > 0.6 ? 1 : 0.15;
    lights.forEach((m) => {
      m.emissiveIntensity = 4 * blink;
    });
  });

  return (
    <group ref={root} scale={wide ? 0.5 : 0.38}>
      <primitive object={model} />
    </group>
  );
}

// The asteroids and the probe are staged in separately as the visitor scrolls.
export default function SpaceObjects({ rich, asteroids, probe }: { rich: boolean; asteroids: boolean; probe: boolean }) {
  return (
    <>
      {asteroids && (
        <Retry urls={[ASTEROIDS_URL]}>
          <Asteroids count={rich ? ROCKS.length : 5} />
        </Retry>
      )}
      {probe && (
        <Retry urls={[PROBE_URL]}>
          <Probe />
        </Retry>
      )}
    </>
  );
}
