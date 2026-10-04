// What the custom cursor should say. The 3D scene sets a label (for example
// "drag" over the star); page elements can ask for one with a data-cursor
// attribute, which wins while the pointer is over them.

let label = "";
let domLabel = "";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getCursorLabel() {
  return domLabel || label;
}

export function setCursorLabel(next: string) {
  if (next === label) return;
  label = next;
  notify();
}

export function setDomCursorLabel(next: string) {
  if (next === domLabel) return;
  domLabel = next;
  notify();
}

export function subscribeCursor(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
