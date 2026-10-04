// Which discipline's 3D piece is in focus outside the home page story:
// hovering a work row brings its piece in beside the pointer ("hover"), and a
// case study page holds its piece as the hero object ("case").

export type FocusMode = "hover" | "case";

type FocusState = { discipline: string | null; mode: FocusMode };

const state: FocusState = { discipline: null, mode: "hover" };

export function getFocus() {
  return state;
}

export function setFocus(discipline: string | null, mode: FocusMode = "hover") {
  state.discipline = discipline;
  state.mode = mode;
}

// A hovered work row; ignored while a case study holds its own piece.
export function setHoverFocus(discipline: string) {
  if (state.mode === "case" && state.discipline) return;
  setFocus(discipline, "hover");
}

// Clears a hover focus but leaves a case page's piece alone.
export function clearHoverFocus() {
  if (state.mode === "hover") state.discipline = null;
}
