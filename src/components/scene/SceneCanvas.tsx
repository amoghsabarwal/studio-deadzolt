"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { AgXToneMapping, MathUtils, Vector2 } from "three";
import { getReducedMotion, subscribeReducedMotion } from "@/lib/story";
import { getTilt } from "@/lib/tilt";
import ChapterPieces from "./ChapterPieces";
import Star from "./Star";

// One canvas for the whole site, mounted in the root layout so it survives
// page navigation. On the home page the star moves from chapter to chapter
// as the story scrolls; elsewhere it sits small and dimmed in the corner.

const noop = () => () => {};

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

// The holographic studio the Blender models were lit with, plus a few light
// panels on top so the chrome keeps crisp highlights from the camera's side.
// Everything is served locally, so nothing is fetched from a CDN.
function StudioLights({ rich }: { rich: boolean }) {
  return (
    <Environment
      files="/models/env/holo-studio.hdr"
      resolution={rich ? 1024 : 512}
      frames={1}
      environmentIntensity={0.8}
    >
      {/* Key: a dim softbox in front so the chrome never reflects pure black,
          crossed by slanted strips. Flat, bevelled faces mirror these as crisp
          streaks that sweep across the surface as the star turns. */}
      <Lightformer form="rect" intensity={0.12} position={[0, 0, 5]} scale={[16, 10, 1]} />
      <Lightformer form="rect" intensity={5} position={[0, 2.4, 4.8]} scale={[12, 0.7, 1]} />
      <Lightformer form="rect" intensity={2} position={[0, -1.6, 4.8]} scale={[12, 0.9, 1]} />
      <Lightformer form="rect" intensity={3} position={[-1.1, 0, 4.7]} rotation={[0, Math.PI, 0.55]} scale={[0.22, 14, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[-3.2, 0, 4.7]} rotation={[0, Math.PI, 0.55]} scale={[1.6, 14, 1]} />
      <Lightformer form="rect" intensity={4} position={[1.6, 0, 4.7]} rotation={[0, Math.PI, 0.55]} scale={[0.12, 14, 1]} />
      <Lightformer form="rect" intensity={2.5} position={[0.2, 0, 4.7]} rotation={[0, Math.PI, 0.55]} scale={[0.06, 14, 1]} />
      <Lightformer form="rect" intensity={2} position={[0.75, 0, 4.7]} rotation={[0, Math.PI, 0.55]} scale={[0.5, 14, 1]} />
      {/* Overhead and side strips for crisp edge highlights. */}
      <Lightformer form="rect" intensity={6} position={[0, 6, 0]} scale={[10, 1, 1]} />
      <Lightformer form="rect" intensity={3} position={[-6, 0, 1]} scale={[0.5, 10, 1]} />
      <Lightformer form="rect" intensity={3} position={[6, 0, 1]} scale={[0.5, 10, 1]} />
      <Lightformer form="rect" intensity={1} position={[0, 0, -6]} scale={[12, 6, 1]} />
      {/* Holographic accents from the logo palette. */}
      <Lightformer form="ring" intensity={5} color="#ff3da8" position={[-4, -2.5, 4]} scale={2} />
      <Lightformer form="ring" intensity={5} color="#38d9ff" position={[4.5, 2.5, 3]} scale={1.8} />
      <Lightformer form="circle" intensity={4} color="#ffe14d" position={[3.5, -3, 3.5]} scale={1.4} />
      <Lightformer form="rect" intensity={3} color="#3dff8a" position={[-4, 3.5, 2]} scale={[3, 0.6, 1]} />
    </Environment>
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

function Effects({ rich }: { rich: boolean }) {
  // Phones and struggling GPUs keep the bloom and vignette and skip the rest.
  if (!rich) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
      <ChromaticAberration
        offset={new Vector2(0.0004, 0.0004)}
        radialModulation
        modulationOffset={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.25} darkness={0.75} />
    </EffectComposer>
  );
}

export default function SceneCanvas() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  // The 3D stays at full strength where it carries content: the home story,
  // and the works pages where it stands in for project imagery.
  const dimmed = pathname !== "/" && !pathname.startsWith("/works");

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
  // Drops resolution and effects if the frame rate can't keep up.
  const [struggling, setStruggling] = useState(false);
  const full = rich && !struggling;

  // The four discipline pieces load once the page has settled, so the star
  // and the page itself get the bandwidth first.
  const [piecesReady, setPiecesReady] = useState(false);
  useEffect(() => {
    const start = () => setPiecesReady(true);
    // Safari has no requestIdleCallback, so it gets a plain delay.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="scene" data-dimmed={dimmed} aria-hidden="true">
      {eventSource && (
        <Canvas
          eventSource={eventSource}
          eventPrefix="client"
          camera={{ position: [0, 0, 7], fov: 40 }}
          dpr={struggling ? 1 : [1, rich ? 1.75 : 1.25]}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: AgXToneMapping,
            toneMappingExposure: 1.25,
          }}
        >
          <PerformanceMonitor onDecline={() => setStruggling(true)} />
          {/* The hero star waits only for its own model and the lighting; the
              chapter pieces load behind it. */}
          <Suspense fallback={null}>
            <StudioLights rich={rich} />
            {!reducedMotion && <TiltedStudio />}
            <Star animate={!reducedMotion} />
          </Suspense>
          {piecesReady && (
            <Suspense fallback={null}>
              <ChapterPieces animate={!reducedMotion} />
            </Suspense>
          )}
          <Effects rich={full} />
        </Canvas>
      )}
    </div>
  );
}
