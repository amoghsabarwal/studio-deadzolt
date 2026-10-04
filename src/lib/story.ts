// Shared state between the scroll story (DOM) and the 3D scene (canvas).
// Plain module state with subscribe/notify so the canvas can read it every
// frame without re-rendering React.

type StoryState = {
  chapter: number;
  // Progress through the active chapter, 0 to 1.
  progress: number;
  // Whether a page with a scroll story is mounted.
  active: boolean;
};

const state: StoryState = { chapter: 0, progress: 0, active: false };
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
