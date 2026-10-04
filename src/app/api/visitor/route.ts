// Counts visitors for the keepsake at the bottom of every page. The count
// lives in an Upstash Redis store (added to the Vercel project from the
// Marketplace, which sets the env vars below). Without a store the route
// answers { number: null } and the keepsake leaves the number off rather
// than making one up.

const KEY = "deadzolt:visitors";

function store() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export async function POST() {
  const s = store();
  if (!s) return Response.json({ number: null });
  try {
    const res = await fetch(`${s.url}/incr/${KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.token}` },
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ number: null });
    const { result } = (await res.json()) as { result?: number };
    return Response.json({ number: typeof result === "number" ? result : null });
  } catch {
    return Response.json({ number: null });
  }
}
