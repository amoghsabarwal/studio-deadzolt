import BookButton from "@/components/BookButton";
import Image from "next/image";
import Link from "next/link";
import Keepsake from "@/components/Keepsake";
import { site } from "@/content/site";

const pages = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Work" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Image src="/brand/wordmark.svg" alt={site.name} width={583} height={61} className="footer-mark" />
          <p>{site.tagline}</p>
          <BookButton from="footer" />
        </div>

        <nav className="footer-col" aria-label="Footer">
          <p className="label" data-scramble>Studio</p>
          <ul>
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} data-scramble-hover>
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <p className="label" data-scramble>Services</p>
          <ul>
            {site.services.slice(0, 4).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="label" data-scramble>Contact</p>
          <ul>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" data-scramble-hover>
                  {s.label}
                </a>
              </li>
            ))}
            <li>{site.location}, India</li>
          </ul>
        </div>
      </div>

      {/* The wordmark across the full width, in chrome that turns with the
          pointer or the phone's tilt. */}
      <div className="footer-giant" role="img" aria-label={site.name} data-wipe-in />

      <Keepsake />

      <div className="footer-bottom label">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>Designed and built in Indore</span>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
