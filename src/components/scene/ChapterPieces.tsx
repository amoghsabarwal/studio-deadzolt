"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils, type Group } from "three";
import { getStory } from "@/lib/story";
import { DISCIPLINE_SPOT, NARROW_SPOT } from "./spots";

type Motion = "spin" | "dial" | "swing" | "tumble";

type Piece = {
  chapter: number;
  url: string;
  scale: number;
  // Rest pose of the model inside its group, so each one reads well face-on.
  rotation?: [number, number, number];
  offset?: [number, number, number];
  motion: Motion;
};

// One Blender piece per discipline chapter. As the story reaches a
// discipline, the star shrinks away and that chapter's piece grows in its
// place.
const PIECES: Piece[] = [
  { chapter: 2, url: "/models/orb-3d-experience.glb", scale: 1.15, rotation: [0.2, 0, 0], motion: "spin" },
  {
    chapter: 3,
    url: "/models/knob-motion-direction.glb",
    scale: 1.45,
    rotation: [0.7, 0, 0],
    offset: [0, -0.3, 0],
    motion: "dial",
  },
  { chapter: 4, url: "/models/pendant-branding.glb", scale: 1.05, offset: [0, -0.27, 0], motion: "swing" },
  { chapter: 5, url: "/models/loop-art-direction.glb", scale: 1.35, motion: "tumble" },
];

function ChapterPiece({ piece, animate }: { piece: Piece; animate: boolean }) {
  const { scene } = useGLTF(piece.url);
  // A copy, so the cached original stays untouched.
  const model = useMemo(() => scene.clone(true), [scene]);

  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > viewport.height;
  const lastScroll = useRef(0);

  useFrame((state, delta) => {
    if (!root.current || !tilt.current || !turn.current) return;
    const dt = Math.min(delta, 0.05);
    const story = getStory();
    const active = story.active && story.chapter === piece.chapter;

    const tx = viewport.width * (wide ? DISCIPLINE_SPOT.x : NARROW_SPOT.x);
    const ty = viewport.height * (wide ? DISCIPLINE_SPOT.y : NARROW_SPOT.y);
    const ts = active ? piece.scale * (wide ? 1 : NARROW_SPOT.scale * 1.1) : 0;

    const k = animate ? 3.2 : 1000;
    const r = root.current;
    r.position.x = MathUtils.damp(r.position.x, tx, k, dt);
    r.position.y = MathUtils.damp(r.position.y, ty, k, dt);
    r.scale.setScalar(MathUtils.damp(r.scale.x, ts, k, dt));
    r.visible = r.scale.x > 0.005;
    if (!r.visible || !animate) return;

    tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, -state.pointer.y * 0.3, 3, dt);
    tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, state.pointer.x * 0.45, 3, dt);

    const scrollY = window.scrollY;
    const scrollSpin = MathUtils.clamp(((scrollY - lastScroll.current) / Math.max(dt, 0.001)) * 0.00006, -0.04, 0.04);
    lastScroll.current = scrollY;

    // Grow in with a slight turn, so the swap from the star reads as a
    // transformation rather than a cut.
    r.rotation.z = (1 - Math.min(r.scale.x / (ts || piece.scale), 1)) * 0.8;
    const t = state.clock.elapsedTime;
    const g = turn.current;
    switch (piece.motion) {
      case "spin":
        g.rotation.y += dt * 0.35 + scrollSpin;
        break;
      case "dial":
        // The knob turns with the scroll, like a dial being dialled up.
        g.rotation.y = MathUtils.damp(g.rotation.y, -story.progress * Math.PI * 1.5 + Math.sin(t * 0.4) * 0.1, 4, dt);
        break;
      case "swing":
        g.rotation.z = Math.sin(t * 1.1) * 0.06;
        g.rotation.y = Math.sin(t * 0.45) * 0.5 + scrollSpin * 4;
        break;
      case "tumble":
        g.rotation.y += dt * 0.3 + scrollSpin;
        g.rotation.x = Math.sin(t * 0.3) * 0.4;
        break;
    }
  });

  return (
    <group ref={root} scale={0} visible={false}>
      <group ref={tilt}>
        <group ref={turn}>
          <group rotation={piece.rotation ?? [0, 0, 0]} position={piece.offset ?? [0, 0, 0]}>
            <primitive object={model} />
          </group>
        </group>
      </group>
    </group>
  );
}

export default function ChapterPieces({ animate }: { animate: boolean }) {
  return (
    <>
      {PIECES.map((piece) => (
        <ChapterPiece key={piece.url} piece={piece} animate={animate} />
      ))}
    </>
  );
}

PIECES.forEach((piece) => useGLTF.preload(piece.url));
