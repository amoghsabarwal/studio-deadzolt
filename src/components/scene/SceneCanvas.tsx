"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AgXToneMapping, MathUtils, Vector2 } from "three";
import {
  getEntered,
  getReducedMotion,
  getScenePaused,
  markSceneReady,
  subscribeEntry,
  subscribeReducedMotion,
  subscribeScenePaused,
} from "@/lib/story";
import { getFocus } from "@/lib/focus";
import { getLite, subscribeLite, switchToLite } from "@/lib/lite";
import { getTilt } from "@/lib/tilt";
import ChapterPieces, { PIECE_DISCIPLINES } from "./ChapterPieces";
import Space from "./Space";
import SpaceObjects from "./SpaceObjects";
import Star from "./Star";

// One canvas for the whole site, mounted in the root layout so it survives
// page navigation: deep space that the visitor flies through as they scroll,
// with the chrome star moving from chapter to chapter on the home page and
// sitting small in the corner elsewhere.

const noop = () => () => {};

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

// Light for chrome in space: the reflections are a dark sky with a few hot
// sources, which is what makes metal look expensive. A warm sun high to the
// right (it also lights the planet's rim), a cool rim from behind, a dull
// red-brown bounce from the planet below, faint coloured gas, and two thin
// strips that draw crisp highlights along the bevels.
function SpaceLights({ rich }: { rich: boolean }) {
  return (
    <>
      <Environment resolution={rich ? 512 : 256} frames={1} environmentIntensity={1}>
        <color attach="background" args={["#020306"]} />
        {/* Sun, and the haze around it. */}
        <Lightformer form="circle" intensity={14} color="#fff1e0" position={[6, 5, -3]} scale={1.6} />
        <Lightformer form="circle" intensity={1.4} color="#ffd9bd" position={[6, 5, -3.2]} scale={6} />
        {/* Cool rim from behind, and the planet's dull bounce from below. */}
        <Lightformer form="rect" intensity={3} color="#8fa6ff" position={[-5, 2, -6]} rotation={[0, 0.6, 0]} scale={[3, 9, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#5a2a22" position={[0, -6, 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 10, 1]} />
        {/* Faint gas the chrome picks up as smears of colour. */}
        <Lightformer form="rect" intensity={0.35} color="#3b4f7a" position={[-4, 4, 4]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.3} color="#7a1f2e" position={[5, -2, 5]} scale={[6, 3, 1]} />
        {/* A soft graded panel behind the camera, so a face-on star shows a
            gentle sweep from light to dark rather than flat grey. */}
        <Lightformer form="rect" intensity={1} position={[1, 3, 6]} rotation={[0.35, 0, 0]} scale={[10, 2.4, 1]} />
        <Lightformer form="rect" intensity={0.06} position={[0, 0, 6.5]} scale={[16, 10, 1]} />
        {/* Thin strips for the bevel highlights, kept off the face. */}
        <Lightformer form="rect" intensity={6} position={[0, 6, 1]} scale={[12, 0.25, 1]} />
        <Lightformer form="rect" intensity={4} position={[-3.5, 0, 4.5]} rotation={[0, Math.PI, 0.55]} scale={[0.1, 14, 1]} />
        <Lightformer form="rect" intensity={3} position={[2.2, 0, 4.5]} rotation={[0, Math.PI, 0.55]} scale={[0.06, 14, 1]} />
        {/* Holographic accents from the logo palette, small and far off. */}
        <Lightformer form="ring" intensity={3} color="#ff3da8" position={[-5, -3, 3]} scale={1.2} />
        <Lightformer form="ring" intensity={3} color="#38d9ff" position={[5, 3, 2]} scale={1} />
      </Environment>
      <directionalLight position={[6, 5, -3]} intensity={2.5} color="#fff1e0" />
      <directionalLight position={[-5, 2, -6]} intensity={1.2} color="#8fa6ff" />
    </>
  );
}

// The studio turns a little with the visitor, so reflections slide across
// every chrome surface: gently with the mouse, fully with a phone's tilt.
function TiltedStudio() {
  useFrame(({ scene }, delta) => {
    const tilt = getTilt();
    const amount = tilt.source === "gyro" ? 0.9 : 0.25;
    const r = scene.environmentRotation;
    r.y = MathUtils.damp(r.y, tilt.x * amount, 3, Math.min(delta, 0.05));
    r.x = MathUtils.damp(r.x, tilt.y * amount * 0.4, 3, Math.min(delta, 0.05));
  });
  return null;
}

// Watches the first few frames once the scene is running: if any takes
// longer than a quarter of a second, the device is too slow for the live
// scene and the still takes over. The very first frame is skipped, since it
// includes compiling shaders, and frames are only timed while the tab is on
// screen and the scene isn't paused.
const WATCH_FRAMES = 5;
const SLOW_FRAME_MS = 250;

function SlowStartWatch() {
  const seen = useRef({ count: -1, last: 0 });
  useFrame(() => {
    const s = seen.current;
    if (s.count >= WATCH_FRAMES) return;
    const now = performance.now();
    const gap = now - s.last;
    s.last = now;
    if (document.visibilityState !== "visible" || getScenePaused()) {
      s.count = -1;
      return;
    }
    s.count += 1;
    if (s.count > 0 && gap > SLOW_FRAME_MS) switchToLite();
  });
  return null;
}

// Bloom only on genuinely hot pixels (stars, the sun's glints), grain to
// keep the dark sky filmic, and on larger screens a lens fringe that appears
// only while the visitor is moving through space.
const FRINGE = new Vector2(0, 0);

function Effects({ rich }: { rich: boolean }) {
  const last = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const y = window.scrollY;
    const speed = Math.abs(y - last.current) / Math.max(dt, 0.001) / Math.max(window.innerHeight, 1);
    last.current = y;
    const target = Math.min(speed * 0.0012, 0.0025);
    const f = FRINGE;
    f.x = f.y = MathUtils.damp(f.x, target, 6, dt);
  });
  // Phones keep bloom, grain and vignette. Multisampling is costly at phone
  // resolutions, so their edges are smoothed with SMAA instead.
  if (!rich) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.6} luminanceThreshold={1} luminanceSmoothing={0.25} />
        <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        <Vignette offset={0.3} darkness={0.7} />
        <SMAA />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.8} luminanceThreshold={1} luminanceSmoothing={0.25} />
      <ChromaticAberration
        offset={FRINGE}
        radialModulation
        modulationOffset={0.3}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}

// The extras in the order they are met on the way down the page.
const EXTRAS = ["asteroids", "probe", ...PIECE_DISCIPLINES];

// Whether an extra's part of the page is close enough to start loading it.
function isNear(key: string) {
  const screens = window.scrollY / Math.max(window.innerHeight, 1);
  if (key === "asteroids") return screens > 0.15;
  if (key === "probe") return screens > 0.4;
  // A case study needs its piece straight away; the home page needs them
  // once the work list is within a screen and a half.
  if (getFocus().discipline === key) return true;
  const work = document.getElementById("work");
  return !!work && work.getBoundingClientRect().top < window.innerHeight * 1.5;
}

// Runs a callback when the browser is idle (Safari has no
// requestIdleCallback, so it gets a short delay) and returns a cancel.
function whenIdle(run: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(run, 200);
  return () => clearTimeout(id);
}

// Adds one extra per idle moment, in page order, once each comes near. It
// holds off while the booking popup is opening or open, so Book always gets
// the device first.
function useStagedExtras(entered: boolean) {
  const [ready, setReady] = useState<string[]>([]);
  useEffect(() => {
    if (!entered) return;
    const done = new Set<string>();
    let cancel: (() => void) | null = null;
    let holdUntil = 0;
    const tick = () => {
      if (cancel || performance.now() < holdUntil || document.querySelector("dialog[open]")) return;
      const next = EXTRAS.find((key) => !done.has(key) && isNear(key));
      if (!next) return;
      cancel = whenIdle(() => {
        cancel = null;
        done.add(next);
        setReady([...done]);
      });
    };
    const hold = (e: Event) => {
      if (!(e.target as HTMLElement | null)?.closest?.("a[data-book]")) return;
      holdUntil = performance.now() + 2500;
      cancel?.();
      cancel = null;
    };
    const timer = setInterval(tick, 400);
    window.addEventListener("scroll", tick, { passive: true });
    document.addEventListener("pointerdown", hold, true);
    tick();
    return () => {
      cancel?.();
      clearInterval(timer);
      window.removeEventListener("scroll", tick);
      document.removeEventListener("pointerdown", hold, true);
    };
  }, [entered]);
  return ready;
}

export default function SceneCanvas() {
  const reducedMotion = usePrefersReducedMotion();
  const paused = useSyncExternalStore(subscribeScenePaused, getScenePaused, () => false);

  // Events come from the whole page so the star can be hovered and dragged
  // while the canvas itself stays behind the content.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const eventSource = mounted ? document.body : undefined;
  // Full-quality effects on larger screens; lighter ones on phones.
  const rich = useSyncExternalStore(
    noop,
    () => window.innerWidth > 760 && window.devicePixelRatio <= 2,
    () => true,
  );
  const lite = useSyncExternalStore(subscribeLite, getLite, () => false);
  // Drops resolution and effects if the frame rate can't keep up.
  const [struggling, setStruggling] = useState(false);
  // A second drop after resolution and effects have already stepped down
  // means the device can't carry the scene, so it swaps to the still.
  const decline = () => (struggling ? switchToLite() : setStruggling(true));
  const full = rich && !struggling;

  // The discipline pieces and the space objects are staged in one at a time
  // after the visitor is in, each only as its part of the page comes near, so
  // the first seconds (when visitors reach for Book) stay light.
  const entered = useSyncExternalStore(subscribeEntry, getEntered, () => false);
  const extras = useStagedExtras(entered);

  // With no 3D to draw, the entry screen needn't wait for it.
  useEffect(() => {
    if (lite) markSceneReady();
  }, [lite]);

  if (lite) {
    return (
      <div className="scene" data-lite aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- a small decorative still */}
        <img src="/models/previews/deadzolt-star.webp" alt="" className="scene-still" />
      </div>
    );
  }

  return (
    <div className="scene" aria-hidden="true">
      {eventSource && (
        <Canvas
          eventSource={eventSource}
          eventPrefix="client"
          camera={{ position: [0, 0, 7], fov: 40 }}
          // Capped at 1.5x on phones (SMAA keeps edges clean) and 1.75x on
          // larger screens; if the frame rate drops, resolution steps down
          // before anything else does.
          dpr={struggling ? 1 : [1, rich ? 1.75 : 1.5]}
          // Browsers already stop drawing in a hidden tab; the scene also
          // holds still while the showreel plays.
          frameloop={reducedMotion || paused ? "demand" : "always"}
          gl={{
            antialias: false,
            // Opaque, so the sky, tone mapping and grain are one image.
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: AgXToneMapping,
            toneMappingExposure: 1,
          }}
        >
          <PerformanceMonitor onDecline={decline} />
          {!reducedMotion && <SlowStartWatch />}
          <Space rich={full} animate={!reducedMotion} />
          {/* The hero star waits only for its own model and the lighting; the
              chapter pieces load behind it. */}
          <Suspense fallback={null}>
            <SpaceLights rich={rich} />
            {!reducedMotion && <TiltedStudio />}
            <Star animate={!reducedMotion} />
          </Suspense>
          <ChapterPieces animate={!reducedMotion} ready={extras} />
          <SpaceObjects rich={full} asteroids={extras.includes("asteroids")} probe={extras.includes("probe")} />
          <Effects rich={full} />
        </Canvas>
      )}
    </div>
  );
}
