import BookButton from "@/components/BookButton";
import Reveals from "@/components/Reveals";
import StudioClock from "@/components/StudioClock";
import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import "./about.css";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

// The studio's file: who runs it, where, what it makes and how fast, set as
// a spec sheet beside the chrome pendant. The star keeps the top right.
const file = [
  { key: "Studio", value: site.name },
  { key: "Founder", value: site.founder },
  { key: "Makes", value: "Motion graphics. Only motion graphics." },
  {
    key: "Based",
    value: (
      <>
        {site.location} <StudioClock />
      </>
    ),
  },
  { key: "Status", value: <span className="availability">{site.availability}</span> },
  { key: "Turnaround", value: site.speed },
  { key: "Craft", value: site.craft },
];

// 3D is how the motion is made, not a separate service, so it stays out of
// this list.
const made = site.services.filter((s) => s !== "3D motion");

export default function AboutPage() {
  const [hello, rest] = splitHello(site.about[0]);
  return (
    <section className="page about">
      <Reveals />
      <header className="ab-head">
        <p className="label" data-enter>
          About · {site.name}
        </p>
        <h1 className="display ab-title" data-split>
          {hello} <em>{rest}</em>
        </h1>
        <p className="ab-lede" data-enter>
          {site.about[1]}
        </p>
      </header>

      <div className="ab-file">
        <div className="ab-sheet">
          <div className="ab-sheet-head">
            <span className="label" data-scramble>
              Studio file
            </span>
          </div>
          <dl data-stagger>
            {file.map((row) => (
              <div className="ab-row" key={row.key}>
                <dt className="label">{row.key}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="ab-plate" data-wipe-in>
          <Image
            src="/brand/pendant.webp"
            alt="A chrome pendant of the Deadzolt mark hanging on a chain"
            width={996}
            height={558}
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <figcaption className="label">Fig. 01 · The mark, as a pendant</figcaption>
        </figure>
      </div>

      <div className="ab-make">
        <p className="label" data-scramble>
          What I make
        </p>
        <ol className="ab-list" data-stagger>
          {made.map((s, i) => (
            <li key={s}>
              <span className="ab-num">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="ab-close" data-reveal>
        <p className="ab-close-line">{site.ctaNote}</p>
        <BookButton from="about" />
      </div>
    </section>
  );
}

// "Hi, I'm Amogh, founder of …" → ["Hi, I'm Amogh,", "founder of …"], so the
// greeting reads in paper and the rest in dim.
function splitHello(line: string): [string, string] {
  const at = line.indexOf(",");
  return at < 0 ? [line, ""] : [line.slice(0, at + 1), line.slice(at + 2)];
}
