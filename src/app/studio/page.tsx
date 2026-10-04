import type { Metadata } from "next";
import Image from "next/image";
import { disciplines, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Studio",
  description: `About ${site.name}, how we work and what we make.`,
};

const process = [
  { name: "Listen", text: "We start with what the brand needs to be remembered for." },
  { name: "Shape", text: "Concepts, prototypes and motion tests before anything is final." },
  { name: "Build", text: "Design and development in one team, so nothing is lost in handoff." },
  { name: "Launch", text: "We ship, measure and keep refining with you." },
];

export default function StudioPage() {
  return (
    <section className="section page-top">
      <h1>Studio</h1>
      <p className="lede">{site.intro}</p>
      <p className="muted">{site.location}</p>

      <div className="studio-visuals">
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

      <h2 className="eyebrow">Disciplines</h2>
      <ul className="discipline-list">
        {disciplines.map((d) => (
          <li key={d.slug}>
            <h3>{d.name}</h3>
            <p className="muted">{d.summary}</p>
          </li>
        ))}
      </ul>

      <h2 className="eyebrow">How we work</h2>
      <ol className="process-list">
        {process.map((step) => (
          <li key={step.name}>
            <h3>{step.name}</h3>
            <p className="muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
