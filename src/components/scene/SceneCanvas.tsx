"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { PMREMGenerator, Shape, type Mesh } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// One canvas for the whole site, mounted in the root layout so it survives
// page navigation. Phase 2 replaces the placeholder star with the scroll world.

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true,
  );
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

function ChromeStar({ animate }: { animate: boolean }) {
  const mesh = useRef<Mesh>(null);
  const shape = useStarShape();
  const viewport = useThree((state) => state.viewport);
  // Sit to the right of the headline on wide screens, centred on phones.
  const wide = viewport.width > viewport.height;
  const x = wide ? viewport.width * 0.25 : 0;
  const y = wide ? 0.2 : viewport.height * 0.24;
  const scale = wide ? 0.8 : 0.5;

  useFrame((state, delta) => {
    if (!animate || !mesh.current) return;
    mesh.current.rotation.y += delta * 0.35;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
  });

  return (
    <mesh ref={mesh} position={[x, y, 0]} scale={scale} rotation={[0.2, 0.5, 0]}>
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
