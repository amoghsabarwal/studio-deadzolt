// One tilt input for every effect that leans with the visitor: the mouse on
// desktop, the gyroscope on phones. x and y run from -1 to 1 (right and down
// are positive). The 3D star and the holographic cards both read it.

type TiltState = {
  x: number;
  y: number;
  // "gyro" once the phone has sent orientation readings.
  source: "pointer" | "gyro" | "none";
};

const state: TiltState = { x: 0, y: 0, source: "none" };

export function getTilt() {
  return state;
}

export function setTilt(x: number, y: number, source: TiltState["source"]) {
  state.x = x;
  state.y = y;
  state.source = source;
}

type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

// iOS only sends orientation after the visitor allows it, from a tap.
export function needsMotionPermission() {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false;
  return typeof (DeviceOrientationEvent as unknown as PermissionApi).requestPermission === "function";
}

export async function requestMotionPermission() {
  const api = DeviceOrientationEvent as unknown as PermissionApi;
  if (typeof api.requestPermission !== "function") return true;
  try {
    return (await api.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

// Lets the page know when the tilt hint should show or hide.
const listeners = new Set<() => void>();
let gyroEnabled = false;

export function isGyroEnabled() {
  return gyroEnabled;
}

export function markGyroEnabled() {
  gyroEnabled = true;
  listeners.forEach((l) => l());
}

export function subscribeGyro(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Gyroscope: the first reading is the visitor's natural grip, so tilting from
// there is what moves things. About 25 degrees either way is full tilt.
const RANGE = 25;
let base: { beta: number; gamma: number } | null = null;
let listening = false;

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta === null || e.gamma === null) return;
  // In landscape the phone's axes swap relative to the screen.
  const angle = (screen.orientation?.angle ?? 0) % 360;
  let lr = e.gamma;
  let fb = e.beta;
  if (angle === 90) [lr, fb] = [e.beta, -e.gamma];
  else if (angle === 270 || angle === -90) [lr, fb] = [-e.beta, e.gamma];
  if (!base) base = { beta: fb, gamma: lr };
  const clamp = (v: number) => Math.max(-1, Math.min(1, v / RANGE));
  setTilt(clamp(lr - base.gamma), clamp(fb - base.beta), "gyro");
  if (!gyroEnabled) markGyroEnabled();
}

export function startGyro() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  base = null;
  window.addEventListener("deviceorientation", onOrientation);
  screen.orientation?.addEventListener("change", () => {
    base = null;
  });
}
