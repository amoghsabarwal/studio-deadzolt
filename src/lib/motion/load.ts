// GSAP, its plugins and Lenis are a large share of the site's script. The page
// paints without them (everything they animate is already in the HTML), so
// they're fetched only after the first frame is on screen, and every effect
// that animates waits for them here.

import type * as Runtime from "./runtime";

export type Motion = typeof Runtime;

let pending: Promise<Motion> | null = null;

function afterFirstPaint() {
  // The second animation frame comes after the first one has been drawn.
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function loadMotion() {
  pending ??= afterFirstPaint().then(() => import("./runtime"));
  return pending;
}

// Runs an effect's setup once the motion library is in, each in a task of
// its own so a page's many setups never add up to one long task. Returns a
// cleanup that cancels the setup if it hasn't run yet, or undoes it if it has.
export function withMotion(setup: (motion: Motion) => void | (() => void)) {
  let cleanup: void | (() => void);
  let done = false;
  let id = 0;
  loadMotion().then((motion) => {
    if (done) return;
    id = window.setTimeout(() => {
      if (!done) cleanup = setup(motion);
    });
  });
  return () => {
    done = true;
    clearTimeout(id);
    cleanup?.();
  };
}
