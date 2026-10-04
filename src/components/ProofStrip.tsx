import { proof } from "@/content/site";

// Client names drifting past under the reel, and one quote. Renders nothing
// until site.ts holds real entries.
export default function ProofStrip() {
  if (proof.clients.length === 0) return null;
  // Doubled so the drift loops without a gap.
  const names = [...proof.clients, ...proof.clients];
  return (
    <section className="proof" aria-label="Clients">
      <div className="proof-track" aria-hidden="true">
        {names.map((name, i) => (
          <span key={i}>{name}</span>
        ))}
      </div>
      <ul className="sr-only">
        {proof.clients.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      {proof.quote && (
        <figure className="proof-quote">
          <blockquote>“{proof.quote.text}”</blockquote>
          <figcaption className="label">
            {proof.quote.name} · {proof.quote.role}
          </figcaption>
        </figure>
      )}
    </section>
  );
}
