// Shared state between the scroll story (DOM) and the 3D scene (canvas).
// Plain module state with subscribe/notify so the canvas can read it every
// frame without re-rendering React.

type StoryState = {
  chapter: number;
  // Progress through the active chapter, 0 to 1.
  progress: number;
  // Whether a page with a scroll story is mounted.
  active: boolean;
  // Whether something else holds the stage (the showreel), so the star
  // steps aside.
  stage: boolean;
};

const state: StoryState = { chapter: 0, progress: 0, active: false, stage: false };
const listeners = new Set<() => void>();

export function getStory() {
  return state;
}

export function setStory(next: Partial<StoryState>) {
  const changedChapter = next.chapter !== undefined && next.chapter !== state.chapter;
  const changedActive = next.active !== undefined && next.active !== state.active;
  Object.assign(state, next);
  if (changedChapter || changedActive) listeners.forEach((l) => l());
}

export function subscribeStory(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(reducedMotionQuery);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function getReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

// The 3D pauses while the showreel plays on screen, so the video gets the
// device's full attention.
let paused = false;
const pauseListeners = new Set<() => void>();

export function getScenePaused() {
  return paused;
}

export function setScenePaused(next: boolean) {
  if (next === paused) return;
  paused = next;
  pauseListeners.forEach((l) => l());
}

export function subscribeScenePaused(listener: () => void) {
  pauseListeners.add(listener);
  return () => {
    pauseListeners.delete(listener);
  };
}
