// The visitor's keepsake details: their number (from /api/visitor, counted
// once per browser), a short code that is theirs either way, and the day
// they first came. Kept in localStorage so a return visit shows the same
// keepsake.

export type Visitor = { number: number | null; code: string; date: string };

const KEY = "dz-visitor";
let visitor: Visitor | null = null;
const listeners = new Set<() => void>();

export function getVisitor() {
  return visitor;
}

export function subscribeVisitor(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function save(v: Visitor) {
  visitor = v;
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
  listeners.forEach((l) => l());
}

function newCode() {
  // No 0/O or 1/I, so the code reads cleanly on a story.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "DZ-" + Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

let started = false;

export async function startVisitor() {
  if (started) return;
  started = true;
  let stored: Visitor | null = null;
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {}
  const v: Visitor = stored?.code ? stored : { number: null, code: newCode(), date: new Date().toISOString() };
  save(v);
  // Counted once. A browser that came before the counter existed gets its
  // number on the next visit.
  if (v.number != null) return;
  try {
    const res = await fetch("/api/visitor", { method: "POST" });
    const { number } = (await res.json()) as { number: number | null };
    if (typeof number === "number") save({ ...v, number });
  } catch {}
}
