"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils, type Group } from "three";
import { getFocus } from "@/lib/focus";
import { getTilt } from "@/lib/tilt";
import { bakeMeshes } from "./geometry";
import { applyRealChrome } from "./materials";
import Retry from "./Retry";
import { DISCIPLINE_SPOT, NARROW_SPOT } from "./spots";

type Motion = "spin" | "dial" | "swing" | "tumble";

type Piece = {
  discipline: string;
  url: string;
  scale: number;
  // Rest pose of the model inside its group, so each one reads well face-on.
  rotation?: [number, number, number];
  offset?: [number, number, number];
  motion: Motion;
};

// One Blender piece per kind of work. They stand in for project imagery:
// hovering a work brings its piece in beside the pointer, and a case study
// holds it as the hero object.
const PIECES: Piece[] = [
  { discipline: "3d-experience", url: "/models/orb-3d-experience.glb", scale: 1.15, rotation: [0.2, 0, 0], motion: "spin" },
  {
    discipline: "motion-direction",
    url: "/models/knob-motion-direction.glb",
    scale: 1.45,
    rotation: [0.6, 0, 0],
    offset: [0, -0.3, 0],
    motion: "dial",
  },
  { discipline: "branding", url: "/models/pendant-branding.glb", scale: 1.05, offset: [0, -0.27, 0], motion: "swing" },
  { discipline: "art-direction", url: "/models/loop-art-direction.glb", scale: 1.35, motion: "tumble" },
];

function ChapterPiece({ piece, animate }: { piece: Piece; animate: boolean }) {
  const { scene } = useGLTF(piece.url);
  // A copy with the studio finish, so the cached original stays untouched.
  const model = useMemo(() => {
    const copy = scene.clone(true);
    bakeMeshes(copy);
    applyRealChrome(copy);
    return copy;
  }, [scene]);

  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const dial = useRef<Group>(null);
  const flick = useRef<Group>(null);
  const boost = useRef(0);
  const viewport = useThree((s) => s.viewport);
  const wide = viewport.width > viewport.height;
  const lastScroll = useRef(0);

  useFrame((state, delta) => {
    if (!root.current || !tilt.current || !turn.current) return;
    const dt = Math.min(delta, 0.05);
    const focus = getFocus();
    const focused = focus.discipline === piece.discipline;

    let tx = viewport.width * (wide ? DISCIPLINE_SPOT.x : NARROW_SPOT.x);
    let ty = viewport.height * (wide ? DISCIPLINE_SPOT.y : NARROW_SPOT.y);
    let ts = 0;
    if (focused && focus.mode === "hover") {
      // A preview to the right of the list that follows the pointer up and down.
      tx = viewport.width * 0.3;
      ty = MathUtils.clamp(state.pointer.y, -0.6, 0.6) * viewport.height * 0.5;
      ts = piece.scale * 0.7;
    } else if (focused) {
      // Case study hero: beside the title on wide screens, above it on phones.
      // Scrolling past the hero tucks it into the top corner (wide) or away
      // (phones), so it never sits on top of the reading.
      const away = MathUtils.clamp(window.scrollY / (window.innerHeight * 0.7), 0, 1);
      const hero = { x: wide ? 0.27 : 0, y: wide ? 0.04 : 0.22, s: wide ? 0.85 : 0.55 };
      const corner = { x: wide ? 0.36 : 0, y: wide ? 0.26 : 0.5, s: wide ? 0.3 : 0 };
      tx = viewport.width * MathUtils.lerp(hero.x, corner.x, away);
      ty = viewport.height * MathUtils.lerp(hero.y, corner.y, away);
      ts = piece.scale * MathUtils.lerp(hero.s, corner.s, away);
    }

    const k = animate ? 3.2 : 1000;
    const r = root.current;
    r.position.x = MathUtils.damp(r.position.x, tx, k, dt);
    r.position.y = MathUtils.damp(r.position.y, ty, k, dt);
    r.scale.setScalar(MathUtils.damp(r.scale.x, ts, k, dt));
    r.visible = r.scale.x > 0.005;
    if (!r.visible || !animate) return;

    // Lean towards the pointer, or with the phone as it tilts.
    const gyro = getTilt();
    const lx = gyro.source === "gyro" ? gyro.x * 0.8 : state.pointer.x * 0.45;
    const ly = gyro.source === "gyro" ? -gyro.y * 0.6 : state.pointer.y * 0.3;
    tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, -ly, 3, dt);
    tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, lx, 3, dt);

    // A tap flicks the piece into a spin that coasts back to rest.
    if (flick.current) {
      const f = flick.current;
      f.rotation.y += boost.current * dt * 10;
      boost.current *= Math.pow(0.04, dt);
      if (boost.current < 0.02) {
        boost.current = 0;
        f.rotation.y = MathUtils.damp(f.rotation.y, Math.round(f.rotation.y / (Math.PI * 2)) * Math.PI * 2, 2, dt);
      }
    }

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
        // The knob turns slowly about its own axis, like a dial being
        // dialled up, while it keeps facing the camera.
        if (dial.current) dial.current.rotation.y = Math.sin(t * 0.4) * 0.6;
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
      <group
        ref={tilt}
        onClick={(e) => {
          // A tap flicks the piece into a spin (and a tiny buzz on phones that
          // support it), so touch screens get something to play with.
          if (e.delta > 6 || (e.nativeEvent.target as HTMLElement | null)?.closest("a, button")) return;
          boost.current += 1;
          navigator.vibrate?.(8);
        }}
      >
        <group ref={flick}>
          <group ref={turn}>
            <group rotation={piece.rotation ?? [0, 0, 0]} position={piece.offset ?? [0, 0, 0]}>
              <group ref={dial}>
                <primitive object={model} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export const PIECE_DISCIPLINES = PIECES.map((p) => p.discipline);

// Only the pieces the scene has staged in so far, each loading on its own.
export default function ChapterPieces({ animate, ready }: { animate: boolean; ready: readonly string[] }) {
  return (
    <>
      {PIECES.filter((piece) => ready.includes(piece.discipline)).map((piece) => (
        <Retry key={piece.url} urls={[piece.url]}>
          <ChapterPiece piece={piece} animate={animate} />
        </Retry>
      ))}
    </>
  );
}

