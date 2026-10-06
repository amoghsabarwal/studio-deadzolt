// Whether the site shows a still image of the star instead of the live 3D.
// Chosen up front for devices that ask to save data, have little memory, no
// WebGL or only a software renderer, and switched on later if the first
// frames show the device can't keep up.

type Hints = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

// null until the graphics check has answered.
let lite: boolean | null = null;
let pending: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

const WEAK = /swiftshader|llvmpipe|software/i;

// Software renderers (SwiftShader, llvmpipe) draw on the CPU and would hold
// up every tap on the page.
function weakGraphics() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return WEAK.test(renderer);
  } catch {
    return true;
  }
}

// Opening a WebGL context to read the renderer's name can hold the page up
// for a long moment (longest on the very software renderers it looks for),
// so it's asked off the main thread where the browser allows it. A worker
// that can't answer hands back to the check above; one still busy after
// five seconds has found a renderer far too slow for the live scene.
const PROBE = `onmessage=()=>{let r="";try{const g=new OffscreenCanvas(1,1).getContext("webgl2");if(g){const i=g.getExtension("WEBGL_debug_renderer_info");r=String(g.getParameter(i?i.UNMASKED_RENDERER_WEBGL:g.RENDERER));const l=g.getExtension("WEBGL_lose_context");l&&l.loseContext()}}catch(e){}postMessage(r)}`;

function probeGraphics() {
  return new Promise<boolean>((resolve) => {
    let worker: Worker | null = null;
    let url = "";
    let done = false;
    const finish = (renderer: string | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(renderer === null ? true : renderer ? WEAK.test(renderer) : weakGraphics());
    };
    const timer = setTimeout(() => finish(null), 5000);
    try {
      if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return finish("");
      url = URL.createObjectURL(new Blob([PROBE], { type: "text/javascript" }));
      worker = new Worker(url);
      worker.onmessage = (e: MessageEvent<string>) => finish(e.data);
      worker.onerror = () => finish("");
      worker.postMessage(0);
    } catch {
      finish("");
    }
  });
}

function hintsSayLite() {
  const nav = navigator as Hints;
  if (nav.connection?.saveData) return true;
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) return true;
  return false;
}

function start() {
  if (lite !== null || pending || typeof window === "undefined") return;
  if (hintsSayLite()) {
    lite = true;
    return;
  }
  pending = probeGraphics().then((weak) => {
    if (lite === null) {
      lite = weak;
      listeners.forEach((l) => l());
    }
    return lite;
  });
}

// The check starts as soon as the page's scripts run, ahead of hydration.
start();

// true or false once known, null while the check is still running.
export function getLite() {
  start();
  return lite;
}

export function whenLiteKnown(): Promise<boolean> {
  start();
  return lite !== null ? Promise.resolve(lite) : (pending ?? Promise.resolve(true));
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
