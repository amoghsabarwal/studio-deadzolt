"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { MathUtils, PMREMGenerator, Shape, type Group, type Mesh } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { getReducedMotion, getStory, subscribeReducedMotion, subscribeStory } from "@/lib/story";

// One canvas for the whole site, mounted in the root layout so it survives
// page navigation. On the home page the star moves from chapter to chapter
// as the story scrolls; elsewhere it sits small and dimmed in the corner.

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

// Rough trace of the Deadzolt star: five uneven spikes joined by soft curves.
// Points are [angle in degrees, radius]; spikes alternate with inner valleys.
const STAR_POINTS: [number, number][] = [
  [110, 1.55], [75, 0.55], [40, 1.45], [10, 0.6], [-15, 1.3],
  [-40, 0.55], [-70, 1.6], [-150, 0.5], [-175, 0.95], [160, 0.5],
];

function useStarShape() {
  return useMemo(() => {
    const pts = STAR_POINTS.map(([deg, r]) => {
      const a = (deg * Math.PI) / 180;
      return [Math.cos(a) * r, Math.sin(a) * r] as const;
    });
    const shape = new Shape();
    shape.moveTo(...pts[0]);
    for (let i = 1; i <= pts.length; i++) {
      const [x, y] = pts[i % pts.length];
      const [px, py] = pts[i - 1];
      // Pull each edge towards the centre so valleys read as soft curves.
      shape.quadraticCurveTo((px + x) * 0.3, (py + y) * 0.3, x, y);
    }
    return shape;
  }, []);
}

// A local studio-light environment for the chrome to reflect, so nothing is
// fetched from a CDN at runtime.
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const env = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);
  return <primitive object={env} attach="environment" />;
}

type Pose = { x: number; y: number; scale: number; turn: number };

// Where the star sits for each chapter of the home page story. x and y are
// fractions of the visible viewport; turn is extra rotation in radians.
const STORY_POSES: Pose[] = [
  { x: 0, y: 0.02, scale: 1.25, turn: 0 }, // arrival
  { x: 0.3, y: 0.05, scale: 0.55, turn: 1.2 }, // manifesto
  { x: 0.27, y: 0, scale: 0.8, turn: 2.4 }, // 3D experience
  { x: 0.27, y: 0.04, scale: 0.8, turn: 3.6 }, // motion direction
  { x: 0.27, y: -0.02, scale: 0.8, turn: 4.8 }, // branding
  { x: 0.27, y: 0.02, scale: 0.8, turn: 6 }, // art direction
  { x: 0.42, y: 0.34, scale: 0.28, turn: 7.2 }, // studio
  { x: 0, y: 0.2, scale: 0.9, turn: 8.4 }, // contact
];
const PAGE_POSE: Pose = { x: 0.34, y: 0.28, scale: 0.4, turn: 0 };

function ChromeStar({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const shape = useStarShape();
  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);
  const wide = viewport.width > viewport.height;

  // With reduced motion the canvas only renders on demand, so redraw when
  // the chapter changes.
  useEffect(() => subscribeStory(() => invalidate()), [invalidate]);

  useFrame((state, delta) => {
    if (!group.current || !mesh.current) return;
    const story = getStory();
    const pose = story.active ? STORY_POSES[story.chapter] ?? STORY_POSES[0] : PAGE_POSE;
    // On narrow screens the copy fills the width, so the star only takes the
    // stage on the first and last chapters and tucks into a corner otherwise.
    const feature = !story.active || story.chapter === 0 || story.chapter === STORY_POSES.length - 1;
    const tx = wide ? pose.x * viewport.width : feature ? 0 : viewport.width * 0.3;
    const ty = wide ? pose.y * viewport.height : feature ? viewport.height * 0.2 : viewport.height * 0.38;
    const ts = wide ? pose.scale : feature ? pose.scale * 0.6 : 0.2;
    const g = group.current;
    const k = animate ? 3 : 1000;
    g.position.x = MathUtils.damp(g.position.x, tx, k, delta);
    g.position.y = MathUtils.damp(g.position.y, ty, k, delta);
    g.scale.setScalar(MathUtils.damp(g.scale.x, ts, k, delta));
    g.rotation.z = MathUtils.damp(g.rotation.z, pose.turn * 0.15, k, delta);
    if (animate) {
      mesh.current.rotation.y += delta * 0.35;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} rotation={[0.2, 0.5, 0]}>
        <extrudeGeometry
          args={[
            shape,
            { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 6 },
          ]}
        />
        <meshPhysicalMaterial
          color="#d9dde3"
          metalness={1}
          roughness={0.12}
          iridescence={1}
          iridescenceIOR={1.8}
          iridescenceThicknessRange={[100, 800]}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

export default function SceneCanvas() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const isHome = pathname === "/";

  return (
    <div className="scene" data-dimmed={!isHome} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <StudioEnvironment />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 4, 5]} intensity={3} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} intensity={40} color="#ff3da8" />
        <pointLight position={[4, -3, 2]} intensity={30} color="#38d9ff" />
        <pointLight position={[0, 4, -3]} intensity={30} color="#ffe14d" />
        <ChromeStar animate={!reducedMotion} />
      </Canvas>
    </div>
  );
}
