import Image from "next/image";
import Link from "next/link";
import MagneticLink from "@/components/MagneticLink";
import ChapterNav from "@/components/story/ChapterNav";
import StoryDriver from "@/components/story/StoryDriver";
import { disciplines, projectsIn, site } from "@/content/site";

// The home page is one scroll story in eight chapters. Each element with
// data-chapter is a chapter; the 3D star moves to a new pose for each one.
// On wide screens the four disciplines scroll sideways in a pinned track.

export default function Home() {
  const manifestoWords = site.manifesto.split(" ");
  const marquee = disciplines.map((d) => d.name);

  return (
    <>
      <StoryDriver />
      <ChapterNav />

      <noscript>
        <style>{".intro{display:none}"}</style>
      </noscript>
      <div className="intro" data-intro aria-hidden="true">
        <Image src="/brand/wordmark.svg" alt="" width={583} height={61} className="intro-mark" />
        <span className="intro-count label" data-intro-count>
          000
        </span>
      </div>

      <section id="arrival" data-chapter className="chapter arrival">
        <p className="label arrival-meta">
          <span>{site.name}</span>
          <span>{site.location}</span>
          <span>2000—forever</span>
        </p>

        <h1 className="display arrival-title">
          <span className="arrival-line arrival-line-a" data-arrival-line>
            <span>Building brands</span>
          </span>
          <span className="arrival-line arrival-line-b" data-arrival-line>
            <span>
              people <em>remember.</em>
            </span>
          </span>
        </h1>

        <p className="label drag-hint" aria-hidden="true">
          ( drag the star )
        </p>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((copy) => (
              <span key={copy} className="marquee-group">
                {marquee.map((m) => (
                  <span key={m}>
                    {m} <i>✦</i>{" "}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
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

      <div className="disciplines" data-disciplines>
        <div className="disciplines-track" data-track>
          {disciplines.map((d, i) => {
            const list = projectsIn(d.slug);
            const number = String(i + 2).padStart(2, "0");
            return (
              <section key={d.slug} id={d.slug} data-chapter data-panel className="panel">
                <span className="panel-ghost" aria-hidden="true">
                  {number}
                </span>
                <div className="panel-body">
                  <p className="label">
                    {number} / {d.name}
                  </p>
                  <h2 className="display panel-name">{d.name}</h2>
                  <p className="panel-line">{d.line}</p>
                  <ol className="panel-projects">
                    {list.map((p, j) => (
                      <li key={p.slug}>
                        <Link href={`/works/${p.slug}`} className="panel-project">
                          <span className="label">{String(j + 1).padStart(2, "0")}</span>
                          <span className="panel-project-title">{p.title}</span>
                          <span className="label">{p.date}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section id="studio" data-chapter className="chapter studio">
        <p className="label">06 / Studio</p>
        <blockquote className="studio-quote" data-reveal>
          <p>{site.about[1]}</p>
        </blockquote>
        <div className="studio-foot">
          <div className="studio-sign" data-reveal>
            <p className="studio-hello">{site.about[0]}</p>
            <ul className="services">
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
        </div>
      </section>

      <section id="contact" data-chapter className="chapter contact">
        <p className="label">07 / Contact</p>
        <h2 className="display contact-title">
          <span>Got a brand</span>
          <span>to build?</span>
        </h2>
        <MagneticLink className="contact-link" href={`mailto:${site.email}`}>
          get in touch <span aria-hidden="true">→</span>
        </MagneticLink>
      </section>
    </>
  );
}
