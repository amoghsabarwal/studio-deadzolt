"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import { setCursorLabel } from "@/lib/cursor";
import { getStory, subscribeStory } from "@/lib/story";
import { DISCIPLINE_SPOT, NARROW_SPOT } from "./spots";

const STAR_URL = "/models/deadzolt-star.glb";
// The Blender star is about 3 units across; this scales it to suit the size
// the poses below were tuned for.
const STAR_SCALE = 1.15;

type Pose = { x: number; y: number; scale: number; turn: number };

// Where the star sits for each chapter of the home page story. x and y are
// fractions of the visible viewport; turn is extra rotation in radians. In
// the four discipline chapters the star shrinks away and that chapter's own
// piece (ChapterPieces) takes its place.
const STORY_POSES: Pose[] = [
  { x: 0, y: 0, scale: 1.5, turn: 0 }, // arrival
  { x: 0.28, y: 0.02, scale: 0.75, turn: 0.6 }, // manifesto
  { ...DISCIPLINE_SPOT, scale: 0, turn: 1.2 }, // 3D experience
  { ...DISCIPLINE_SPOT, scale: 0, turn: 1.8 }, // motion direction
  { ...DISCIPLINE_SPOT, scale: 0, turn: 2.4 }, // branding
  { ...DISCIPLINE_SPOT, scale: 0, turn: 3 }, // art direction
  { x: 0.36, y: 0.26, scale: 0.42, turn: 3.6 }, // studio
  { x: 0, y: 0.04, scale: 1.35, turn: 4.2 }, // contact
];
const PAGE_POSE: Pose = { x: 0.34, y: 0.26, scale: 0.42, turn: 0 };

// Iridescent film thickness per chapter, so the colour sheen drifts as the
// story moves on.
const FILM = [
  [160, 900],
  [260, 1000],
  [340, 1100],
  [420, 1200],
  [300, 950],
  [520, 1300],
  [200, 800],
  [160, 900],
];

export default function Star({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const halo = useRef<Mesh>(null);
  const material = useRef<MeshPhysicalMaterial>(null);

  const viewport = useThree((s) => s.viewport);
  const invalidate = useThree((s) => s.invalidate);
  const wide = viewport.width > viewport.height;

  const { nodes } = useGLTF(STAR_URL) as unknown as { nodes: Record<string, Mesh> };
  const geometry = nodes.DeadzoltStar.geometry;

  // Drag-to-spin with inertia, plus a little extra from scroll speed.
  const drag = useRef({ active: false, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  const hover = useRef(0);
  const hovered = useRef(false);
  const lastScroll = useRef(0);
  const user = useRef({ x: 0, y: 0 });

  useEffect(() => subscribeStory(() => invalidate()), [invalidate]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      d.vy = (e.clientX - d.lastX) * 0.012;
      d.vx = (e.clientY - d.lastY) * 0.012;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    };
    const up = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      document.body.classList.remove("is-dragging");
      setCursorLabel(hovered.current ? "drag" : "");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    const target = e.nativeEvent.target as HTMLElement | null;
    if (target?.closest("a, button, input, textarea")) return;
    drag.current = { ...drag.current, active: true, lastX: e.clientX, lastY: e.clientY };
    document.body.classList.add("is-dragging");
    setCursorLabel("spin");
  };

  useFrame((state, delta) => {
    if (!root.current || !tilt.current || !spin.current) return;
    const dt = Math.min(delta, 0.05);
    const story = getStory();
    const pose = story.active ? STORY_POSES[story.chapter] ?? STORY_POSES[0] : PAGE_POSE;

    // On narrow screens the copy fills the width, so the star takes the stage
    // on the first and last chapters and tucks into the top corner otherwise.
    const feature = !story.active || story.chapter === 0 || story.chapter === STORY_POSES.length - 1;
    const tx = wide ? pose.x * viewport.width : feature ? 0 : viewport.width * NARROW_SPOT.x;
    const ty = wide ? pose.y * viewport.height : feature ? viewport.height * 0.14 : viewport.height * NARROW_SPOT.y;
    const base = wide ? pose.scale : feature ? pose.scale * 0.62 : pose.scale > 0 ? NARROW_SPOT.scale : 0;
    const ts = base * (1 + hover.current * 0.06);

    const k = animate ? 2.6 : 1000;
    const r = root.current;
    r.position.x = MathUtils.damp(r.position.x, tx, k, dt);
    r.position.y = MathUtils.damp(r.position.y, ty, k, dt);
    r.scale.setScalar(MathUtils.damp(r.scale.x, ts, k, dt));
    r.rotation.z = MathUtils.damp(r.rotation.z, pose.turn * 0.2, k, dt);
    r.visible = r.scale.x > 0.005;
    // A hidden star gets no pointer-out event, so let go of its hover here.
    if (!r.visible && hovered.current && !drag.current.active) {
      hovered.current = false;
      setCursorLabel("");
    }

    hover.current = MathUtils.damp(hover.current, hovered.current ? 1 : 0, 6, dt);

    if (material.current) {
      const film = FILM[story.active ? story.chapter : 0] ?? FILM[0];
      const range = material.current.iridescenceThicknessRange;
      range[0] = MathUtils.damp(range[0], film[0], 1.5, dt);
      range[1] = MathUtils.damp(range[1], film[1] + hover.current * 300, 1.5, dt);
    }

    if (!animate) return;

    // Cursor parallax: the star leans towards the pointer.
    tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, -state.pointer.y * 0.35, 3, dt);
    tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, state.pointer.x * 0.5, 3, dt);

    const scrollY = window.scrollY;
    const scrollSpeed = (scrollY - lastScroll.current) / Math.max(dt, 0.001);
    lastScroll.current = scrollY;

    // The star sways rather than spins, so it stays face-on most of the time.
    // Drags and fast scrolling add spin that coasts and then settles back to
    // the nearest full turn.
    const d = drag.current;
    const u = user.current;
    if (d.active) {
      u.y += d.vy;
      u.x += d.vx;
    } else {
      d.vx *= Math.pow(0.03, dt);
      d.vy *= Math.pow(0.03, dt);
      u.y += d.vy;
      u.x += d.vx;
      if (Math.abs(d.vy) < 0.002) u.y = MathUtils.damp(u.y, Math.round(u.y / (Math.PI * 2)) * Math.PI * 2, 1.4, dt);
      if (Math.abs(d.vx) < 0.002) u.x = MathUtils.damp(u.x, 0, 1.4, dt);
    }
    u.y += MathUtils.clamp(scrollSpeed * 0.00008, -0.05, 0.05);
    const t = state.clock.elapsedTime;
    const s = spin.current;
    s.rotation.y = u.y + Math.sin(t * 0.35) * 0.5;
    s.rotation.x = u.x + Math.sin(t * 0.27 + 1) * 0.16;

    if (halo.current) {
      halo.current.rotation.z += dt * 0.15;
      halo.current.rotation.x = 1.2 + Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }
  });

  return (
    <group ref={root}>
      <group ref={tilt}>
        <group ref={spin}>
          <mesh
            scale={STAR_SCALE}
            onPointerDown={onPointerDown}
            onPointerOver={() => {
              hovered.current = true;
              if (!drag.current.active) setCursorLabel("drag");
            }}
            onPointerOut={() => {
              hovered.current = false;
              if (!drag.current.active) setCursorLabel("");
            }}
          >
            <primitive object={geometry} attach="geometry" />
            <meshPhysicalMaterial
              ref={material}
              color="#f2f4f7"
              metalness={1}
              roughness={0.045}
              envMapIntensity={1.2}
              iridescence={1}
              iridescenceIOR={1.7}
              iridescenceThicknessRange={[160, 900]}
              clearcoat={1}
              clearcoatRoughness={0.04}
            />
          </mesh>
        </group>
        {/* A thin chrome halo orbiting the star. */}
        <mesh ref={halo} rotation={[1.2, 0, 0]}>
          <torusGeometry args={[2.05, 0.012, 24, 256]} />
          <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.15} envMapIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(STAR_URL);
