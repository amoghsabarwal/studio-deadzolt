"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ENTERED_KEY, getSceneReady, markEntered, subscribeEntry } from "@/lib/story";
import { isGyroEnabled, needsMotionPermission, requestMotionPermission, startGyro } from "@/lib/tilt";

// The first moment on the site: the 3D, the fonts and the space objects load
// behind a short branded screen, so nothing pops in afterwards. On iPhones it
// ends with one Enter tap, which is also when iOS lets the site ask for
// motion. Everywhere else it opens by itself as soon as things are loaded,
// and never later than CAP. Returning and campaign visitors skip it (see
// ENTRY_SKIP_SCRIPT); on iPhones they're asked for motion on their first tap.

const CAP = 1200;
const MODELS = ["/models/asteroids-space.glb", "/models/probe-space.glb"];
const noop = () => () => {};

function sceneDrawn() {
  return new Promise<void>((resolve) => {
    if (getSceneReady()) return resolve();
    const stop = subscribeEntry(() => {
      if (!getSceneReady()) return;
      stop();
      resolve();
    });
  });
}

export default function EntryGate() {
  const [done, setDone] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const needsTap = useSyncExternalStore(
    noop,
    () => needsMotionPermission() && window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
  const tasks = MODELS.length + 2;

  const leave = () => {
    setLeaving(true);
    markEntered();
    delete document.documentElement.dataset.entry;
    try {
      localStorage.setItem(ENTERED_KEY, "1");
    } catch {}
    setTimeout(() => setGone(true), 800);
  };

  // On iPhones, a visitor who didn't tap Enter (they skipped the screen) is
  // asked for motion on their first tap anywhere.
  useEffect(() => {
    if (!needsMotionPermission()) return;
    const ask = async () => {
      document.removeEventListener("click", ask);
      if (!isGyroEnabled() && (await requestMotionPermission())) startGyro();
    };
    document.addEventListener("click", ask);
    return () => document.removeEventListener("click", ask);
  }, []);

  useEffect(() => {
    // Skipped: the inline script has already hidden the screen.
    if (document.documentElement.dataset.entered) {
      markEntered();
      queueMicrotask(() => setGone(true));
      return;
    }
    document.documentElement.dataset.entry = "open";
    let alive = true;
    const tick = () => alive && setDone((d) => d + 1);
    const work = [
      document.fonts.ready.then(tick),
      sceneDrawn().then(tick),
      ...MODELS.map((url) =>
        fetch(url)
          .then((r) => r.arrayBuffer())
          .catch(() => null)
          .then(tick),
      ),
    ];
    const cap = setTimeout(() => alive && setReady(true), CAP);
    Promise.all(work).then(() => alive && setReady(true));
    return () => {
      alive = false;
      clearTimeout(cap);
    };
  }, []);

  // Without a permission to ask for, the screen opens on its own.
  useEffect(() => {
    if (!ready || needsTap || leaving) return;
    const id = setTimeout(leave, 250);
    return () => clearTimeout(id);
  }, [ready, needsTap, leaving]);

  if (gone) return null;
  const pct = Math.round((Math.min(done, tasks) / tasks) * 100);

  return (
    <div className="entry" data-leaving={leaving || undefined} data-ready={ready || undefined}>
      <div className="entry-core">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny brand mark, must paint with the HTML */}
        <img className="entry-star" src="/brand/star.webp" alt="" width={120} height={120} />
        <p className="label entry-status" aria-live="polite">
          {ready ? "Ready" : `Loading the studio · ${pct}%`}
        </p>
        <div className="entry-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${ready ? 1 : pct / 100})` }} />
        </div>
        {needsTap && (
          <>
            <button
              type="button"
              className="button button-primary entry-enter"
              disabled={!ready}
              onClick={async () => {
                if (await requestMotionPermission()) startGyro();
                leave();
              }}
            >
              Enter
            </button>
            <p className="label entry-note">Allow motion to tilt the 3D with your phone</p>
          </>
        )}
      </div>
    </div>
  );
}
