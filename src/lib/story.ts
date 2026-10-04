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

// The entry moment. Remembered across visits under this key, so returning
// visitors go straight in. The scene says when it has drawn its first frame, and
// the entry screen says when the visitor is in.
export const ENTERED_KEY = "dz-entered";
// Runs before the first paint (inlined in the layout): returning visitors and
// visitors from a campaign link (utm, ad click ids) skip the entry screen.
export const ENTRY_SKIP_SCRIPT = `try{var q=location.search;if(localStorage.getItem("${ENTERED_KEY}")||/[?&](utm_|gclid|fbclid)/.test(q))document.documentElement.dataset.entered="1"}catch(e){}`;
let sceneReady = false;
let entered = false;
let enteredAt = 0;
const entryListeners = new Set<() => void>();

export function getSceneReady() {
  return sceneReady;
}

export function markSceneReady() {
  if (sceneReady) return;
  sceneReady = true;
  entryListeners.forEach((l) => l());
}

export function getEntered() {
  return entered;
}

export function markEntered() {
  if (entered) return;
  entered = true;
  enteredAt = performance.now();
  entryListeners.forEach((l) => l());
}

export function subscribeEntry(listener: () => void) {
  entryListeners.add(listener);
  return () => {
    entryListeners.delete(listener);
  };
}

// How far the star has rushed in from deep space since the visitor entered,
// 0 to 1, with an expo-out finish.
export function getEntrance() {
  if (!entered) return 0;
  const t = Math.min((performance.now() - enteredAt) / 1400, 1);
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
