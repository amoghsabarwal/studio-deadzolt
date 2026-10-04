"use client";

import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ACESFilmicToneMapping, Vector2 } from "three";
import { getReducedMotion, subscribeReducedMotion } from "@/lib/story";
import Star from "./Star";

// One canvas for the whole site, mounted in the root layout so it survives
// page navigation. On the home page the star moves from chapter to chapter
// as the story scrolls; elsewhere it sits small and dimmed in the corner.

const noop = () => () => {};

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

// A photo-studio environment built from light panels, rendered locally so
// nothing is fetched from a CDN. Long softboxes give chrome its crisp
// highlights; the coloured rims echo the holographic logo.
function StudioLights() {
  return (
    <Environment resolution={512} frames={1}>
      <color attach="background" args={["#050505"]} />
      {/* Key: a huge dim softbox in front so the chrome never reflects pure
          black, with brighter strips across it for crisp highlights. */}
      <Lightformer form="rect" intensity={0.6} position={[0, 0, 5]} scale={[16, 10, 1]} />
      <Lightformer form="rect" intensity={5} position={[0, 2.4, 4.8]} scale={[12, 0.7, 1]} />
      <Lightformer form="rect" intensity={3} position={[0, 0.6, 4.8]} scale={[12, 0.3, 1]} />
      <Lightformer form="rect" intensity={2} position={[0, -1.6, 4.8]} scale={[12, 0.9, 1]} />
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

function Effects({ rich }: { rich: boolean }) {
  return (
    <EffectComposer multisampling={rich ? 4 : 0}>
      <Bloom mipmapBlur intensity={rich ? 0.7 : 0.45} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
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

function ResponsiveDust() {
  const viewport = useThree((s) => s.viewport);
  return (
    <Sparkles
      count={viewport.width > viewport.height ? 90 : 40}
      scale={[viewport.width, viewport.height, 4]}
      size={1.6}
      speed={0.15}
      opacity={0.5}
      color="#ffffff"
    />
  );
}

export default function SceneCanvas() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const isHome = pathname === "/";

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

  return (
    <div className="scene" data-dimmed={!isHome} aria-hidden="true">
      {eventSource && (
        <Canvas
          eventSource={eventSource}
          eventPrefix="client"
          camera={{ position: [0, 0, 7], fov: 40 }}
          dpr={[1, rich ? 1.75 : 1.25]}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{ antialias: false, alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <StudioLights />
          <Star animate={!reducedMotion} />
          {!reducedMotion && <ResponsiveDust />}
          <Effects rich={rich} />
        </Canvas>
      )}
    </div>
  );
}
