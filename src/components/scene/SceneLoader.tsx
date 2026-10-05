"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { getLite, subscribeLite } from "@/lib/lite";
import { markSceneReady } from "@/lib/story";

// The live 3D (three.js and everything around it) is the heaviest download on
// the site, so it loads in its own bundle after the page is up. Behind it
// sits a sky drawn in CSS: a nebula and two drifting star fields that need no
// download at all, so even on a weak connection space is moving from the
// first paint, and the 3D fades in over it once it arrives. Devices that
// can't carry the live scene keep the CSS sky with a still of the star, and
// never download the 3D at all.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

const noop = () => () => {};

export default function SceneLoader() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const lite = useSyncExternalStore(subscribeLite, getLite, () => false);

  // With no 3D to draw, the entry screen needn't wait for it.
  useEffect(() => {
    if (lite) markSceneReady();
  }, [lite]);

  return (
    <>
      <div className="sky" aria-hidden="true" />
      {mounted &&
        (lite ? (
          <div className="scene-lite" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- a small decorative still */}
            <img src="/brand/star-still.webp" alt="" className="scene-still" />
          </div>
        ) : (
          <SceneCanvas />
        ))}
    </>
  );
}
