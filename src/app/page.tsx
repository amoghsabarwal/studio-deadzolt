import Image from "next/image";
import Link from "next/link";
import MagneticLink from "@/components/MagneticLink";
import HoloLayers from "@/components/HoloLayers";
import StudioClock from "@/components/StudioClock";
import TiltHint from "@/components/TiltHint";
import StoryDriver from "@/components/story/StoryDriver";
import {
  bookingLink,
  disciplineNames,
  disciplines,
  plans,
  process,
  projects,
  projectsIn,
  site,
} from "@/content/site";

// The home page is one scroll story. Each element with data-chapter is a
// chapter; the 3D scene moves to a new pose for each one. On wide screens the
// four disciplines scroll sideways in a pinned track.

export default function Home() {
  const manifestoWords = site.manifesto.split(" ");
  // Words that catch the light as the manifesto is read.
  const KEY_WORDS = new Set(["chrome-finished", "desire,", "forever."]);
  const selected = projects.slice(0, 5);

  return (
    <>
      <StoryDriver />

      <noscript>
        <style>{".intro{display:none}[data-hero-title]{visibility:visible}"}</style>
      </noscript>
      <div className="intro" data-intro aria-hidden="true">
        <Image src="/brand/wordmark.svg" alt="" width={583} height={61} className="intro-mark" />
        <span className="intro-count label" data-intro-count>
          000
        </span>
      </div>

      <section id="arrival" data-chapter className="chapter hero">
        <div className="hero-copy" data-hero>
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Brand, 3D and motion studio · {site.location}
          </p>
          <h1 className="hero-title" data-hero-title>
            Building brands people <em className="wipe">remember.</em>
          </h1>
          <p className="hero-sub">
            Studio Deadzolt designs identities, 3D product worlds and motion for brands that want to be
            impossible to mistake for anything else.
          </p>
          <TiltHint />
          <div className="actions">
            <a className="button button-primary" {...bookingLink}>
              Book a consultation
            </a>
            <Link className="button" href="/works">
              See the work
            </Link>
          </div>
        </div>
        <p className="label drag-hint" aria-hidden="true">
          Drag to spin
        </p>
        <div className="hero-foot label">
          <ul aria-label="Disciplines">
            {disciplines.map((d) => (
              <li key={d.slug}>{d.name}</li>
            ))}
          </ul>
          <p className="hero-clock">
            Indore <StudioClock />
          </p>
        </div>
      </section>

      <section id="manifesto" data-chapter className="chapter manifesto">
        <p className="label" data-scramble>Manifesto</p>
        <p className="manifesto-text" data-manifesto>
          {manifestoWords.map((word, i) => (
            <span key={i} data-word className={KEY_WORDS.has(word) ? "key-word" : undefined}>
              {word}{" "}
            </span>
          ))}
        </p>
      </section>

      <div className="disciplines" data-disciplines>
        <div className="disciplines-track" data-track>
          {disciplines.map((d, i) => {
            const list = projectsIn(d.slug);
            return (
              <section key={d.slug} id={d.slug} data-chapter data-panel className="panel">
                <div className="panel-body">
                  <p className="label">
                    {String(i + 1).padStart(2, "0")} / {String(disciplines.length).padStart(2, "0")} · Services
                  </p>
                  <h2 className="panel-name">{d.name}</h2>
                  <p className="panel-line">{d.line}</p>
                  <ol className="panel-projects">
                    {list.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/works/${p.slug}`} className="row-link" data-cursor="View">
                          <span>{p.title}</span>
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

      <section id="work" data-chapter className="chapter work">
        <div className="section-head">
          <p className="label" data-scramble>Selected work</p>
          <h2 className="section-title" data-split>
            Recent projects
          </h2>
        </div>
        <ol className="work-list" data-stagger>
          {selected.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/works/${p.slug}`}
                className="work-row"
                data-focus={p.disciplines[0]}
                data-cursor="View"
              >
                <span className="work-title">{p.title}</span>
                <span className="label work-tags">{disciplineNames(p)}</span>
                <span className="label work-date">{p.year}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/works" className="text-link">
          All {projects.length} projects <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section id="pricing" data-chapter className="chapter pricing">
        <div className="section-head">
          <p className="label" data-scramble>Work with the studio</p>
          <h2 className="section-title" data-split>
            Start with a conversation.
          </h2>
          <p className="section-sub">
            Every project begins with a free consultation. You leave with a clear scope and a fixed quote,
            whether or not we work together.
          </p>
        </div>

        <ol className="process" data-stagger data-process>
          {process.map((step, i) => (
            <li key={step.title}>
              <span className="label">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.line}</p>
            </li>
          ))}
        </ol>

        <TiltHint />
        <div className="plans" data-stagger>
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="plan"
              data-featured={plan.featured || undefined}
              data-holo
              data-tier={plan.foil}
            >
              <HoloLayers />
              <header>
                <p className="label">{plan.note}</p>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-price" data-count>
                  {plan.price}
                </p>
                <p className="plan-summary">{plan.summary}</p>
              </header>
              <ul className="plan-list">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className={plan.featured ? "button button-primary" : "button"} {...bookingLink}>
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" data-chapter className="chapter contact">
        <div className="contact-copy">
          <p className="label" data-scramble>Contact</p>
          <h2 className="section-title" data-split>
            Have a brand to build?
          </h2>
          <p className="section-sub">Tell us what you are making and we will get back to you.</p>
          <div className="actions" data-reveal>
            <MagneticLink className="button button-primary button-foil" {...bookingLink}>
              Book a consultation
            </MagneticLink>
            <a className="button" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
