import Image from "next/image";
import Link from "next/link";
import ChapterNav from "@/components/story/ChapterNav";
import StoryDriver from "@/components/story/StoryDriver";
import { disciplines, projectsIn, site } from "@/content/site";

// The home page is one scroll story in eight chapters. Each <section> with
// data-chapter is a chapter; the 3D star moves to a new pose for each one.

export default function Home() {
  const manifestoWords = site.manifesto.split(" ");

  return (
    <>
      <StoryDriver />
      <ChapterNav />

      <section id="arrival" data-chapter className="chapter arrival">
        <p className="label arrival-meta">
          <span>{site.name}</span>
          <span>{site.location}</span>
          <span>2000—forever</span>
        </p>
        <h1 className="display arrival-title" data-arrival-title>
          Building brands
          <br />
          people <em>remember.</em>
        </h1>
        <p className="label scroll-cue" aria-hidden="true">
          Scroll to enter ↓
        </p>
      </section>

      <section id="manifesto" data-chapter className="chapter manifesto">
        <p className="label">01 / Manifesto</p>
        <p className="manifesto-text" data-manifesto>
          {manifestoWords.map((word, i) => (
            <span key={i} data-word>
              {word}{" "}
            </span>
          ))}
        </p>
      </section>

      {disciplines.map((d, i) => {
        const list = projectsIn(d.slug);
        return (
          <section key={d.slug} id={d.slug} data-chapter className="chapter discipline">
            <header className="discipline-head">
              <span className="chapter-number" aria-hidden="true">
                {String(i + 2).padStart(2, "0")}
              </span>
              <div>
                <h2 className="display discipline-name" data-reveal>
                  {d.name}
                </h2>
                <p className="discipline-line" data-reveal>
                  {d.line}
                </p>
              </div>
            </header>
            <ol className="project-rows">
              {list.map((p) => (
                <li key={p.slug} data-reveal>
                  <Link href={`/works/${p.slug}`} className="project-row">
                    <span className="project-row-title">{p.title}</span>
                    <span className="project-row-summary">{p.summary}</span>
                    <span className="label project-row-date">{p.date}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <section id="studio" data-chapter className="chapter studio">
        <div className="studio-copy">
          <p className="label">06 / Studio</p>
          <p className="studio-hello" data-reveal>
            {site.about[0]}
          </p>
          <p className="studio-body" data-reveal>
            {site.about[1]}
          </p>
          <ul className="services" data-reveal>
            {site.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <Image
          className="studio-image"
          src="/brand/pendant.webp"
          alt="A chrome pendant of the Deadzolt mark hanging on a chain"
          width={996}
          height={558}
          data-reveal
        />
      </section>

      <section id="contact" data-chapter className="chapter contact">
        <p className="label">07 / Contact</p>
        <h2 className="display contact-title">
          Got a brand
          <br />
          to build?
        </h2>
        <a className="contact-link" href={`mailto:${site.email}`}>
          get in touch <span aria-hidden="true">→</span>
        </a>
      </section>
    </>
  );
}
