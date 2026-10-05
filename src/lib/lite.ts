// Whether the site shows a still image of the star instead of the live 3D.
// Chosen up front for devices that ask to save data, have little memory, no
// WebGL or only a software renderer, and switched on later if the first
// frames show the device can't keep up.

type Hints = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

let lite: boolean | null = null;
const listeners = new Set<() => void>();

// Software renderers (SwiftShader, llvmpipe) draw on the CPU and would hold
// up every tap on the page.
function weakGraphics() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software/i.test(renderer);
  } catch {
    return true;
  }
}

function detect() {
  const nav = navigator as Hints;
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return true;
  return weakGraphics();
}

export function getLite() {
  if (lite === null) lite = detect();
  return lite;
}

export function switchToLite() {
  if (getLite()) return;
  lite = true;
  listeners.forEach((l) => l());
}

export function subscribeLite(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
