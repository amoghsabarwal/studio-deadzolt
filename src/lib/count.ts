// Sends one count to /api/count without holding anything up: a beacon
// survives the page closing, with a plain fetch where beacons aren't allowed.
export function count(event: "book" | "booked", from?: string) {
  const body = JSON.stringify({ event, from });
  try {
    if (navigator.sendBeacon?.("/api/count", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/count", { method: "POST", body, keepalive: true }).catch(() => {});
}
