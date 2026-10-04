// What the custom cursor should say, set by whatever is under the pointer
// (for example "drag" over the 3D star).

let label = "";
const listeners = new Set<() => void>();

export function getCursorLabel() {
  return label;
}

export function setCursorLabel(next: string) {
  if (next === label) return;
  label = next;
  listeners.forEach((l) => l());
}

export function subscribeCursor(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
