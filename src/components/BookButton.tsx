import { bookingLink, site } from "@/content/site";

// The one call to action. A ring of tiny stars orbits on its right; on hover
// they spring into an arrow (globals.css, .cta-orbit).
export default function BookButton({ from, primary = true, small = false }: { from: string; primary?: boolean; small?: boolean }) {
  const className = ["button", "cta", primary && "button-primary", small && "button-small"].filter(Boolean).join(" ");
  return (
    <a className={className} {...bookingLink(from)}>
      {site.cta}
      <span className="cta-orbit" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
    </a>
  );
}
