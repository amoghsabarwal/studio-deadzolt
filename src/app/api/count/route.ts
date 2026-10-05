// Counts the two moments that matter on the site: a Book button pressed (by
// which button) and a call booked. The counts live in the same free Upstash
// Redis store as the visitor number, as one hash; open it in the Upstash
// console to read them. Without a store the route quietly does nothing.

const KEY = "deadzolt:bookings";
const EVENTS = new Set(["book", "booked"]);
const FROM = /^[a-z0-9-]{1,32}$/;

function store() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export async function POST(req: Request) {
  const s = store();
  if (!s) return new Response(null, { status: 204 });
  try {
    const { event, from } = (await req.json()) as { event?: string; from?: string };
    if (!event || !EVENTS.has(event)) return new Response(null, { status: 400 });
    // "book:hero", "book:dock" and so on, plus a running total for each event.
    const fields = [event, from && FROM.test(from) ? `${event}:${from}` : null].filter(Boolean) as string[];
    await fetch(`${s.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.token}` },
      body: JSON.stringify(fields.map((f) => ["HINCRBY", KEY, f, 1])),
      cache: "no-store",
    });
  } catch {}
  return new Response(null, { status: 204 });
}
