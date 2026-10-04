import type { Metadata } from "next";
import Image from "next/image";
import { bookingLink, site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default function AboutPage() {
  return (
    <section className="page about">
      <header className="page-head">
        <p className="label" data-enter>
          {site.founder} · Founder · {site.location}
        </p>
        <h1 className="display page-title" data-enter>
          About
        </h1>
      </header>

      <div className="about-grid" data-enter>
        <div>
          <p className="studio-hello">{site.about[0]}</p>
          <p className="studio-body">{site.about[1]}</p>
        </div>
        <div>
          <p className="label">Services</p>
          <ul className="services">
            {site.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="about-images">
        <Image
          src="/brand/pendant.webp"
          alt="A chrome pendant of the Deadzolt mark hanging on a chain"
          width={996}
          height={558}
        />
        <Image
          src="/brand/type-panel.webp"
          alt="Brand typography: Y2K-born design for electric, chrome-finished web, visual and objects"
          width={996}
          height={559}
        />
      </div>

      <a className="button" {...bookingLink}>
        Book a free call <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
