import Image from "next/image";
import Link from "next/link";
import MagneticLink from "@/components/MagneticLink";
import ChapterNav from "@/components/story/ChapterNav";
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
  const selected = projects.slice(0, 5);

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

      <section id="arrival" data-chapter className="chapter hero">
        <div className="hero-copy" data-hero>
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Brand, 3D and motion studio · {site.location}
          </p>
          <h1 className="hero-title">
            Building brands people <em>remember.</em>
          </h1>
          <p className="hero-sub">
            Studio Deadzolt designs identities, 3D product worlds and motion for brands that want to be
            impossible to mistake for anything else.
          </p>
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
        <ul className="hero-foot label" aria-label="Disciplines">
          {disciplines.map((d) => (
            <li key={d.slug}>{d.name}</li>
          ))}
        </ul>
      </section>

      <section id="manifesto" data-chapter className="chapter manifesto">
        <p className="label">Manifesto</p>
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
                        <Link href={`/works/${p.slug}`} className="row-link">
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
          <p className="label">Selected work</p>
          <h2 className="section-title">Recent projects</h2>
        </div>
        <ol className="work-list" data-reveal>
          {selected.map((p) => (
            <li key={p.slug}>
              <Link href={`/works/${p.slug}`} className="work-row">
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
          <p className="label">Work with the studio</p>
          <h2 className="section-title">Start with a conversation.</h2>
          <p className="section-sub">
            Every project begins with a free consultation. You leave with a clear scope and a fixed quote,
            whether or not we work together.
          </p>
        </div>

        <ol className="process" data-reveal>
          {process.map((step, i) => (
            <li key={step.title}>
              <span className="label">{String(i + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.line}</p>
            </li>
          ))}
        </ol>

        <div className="plans" data-reveal>
          {plans.map((plan) => (
            <article key={plan.name} className="plan" data-featured={plan.featured || undefined}>
              <header>
                <p className="label">{plan.note}</p>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-price">{plan.price}</p>
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
        <div className="contact-copy" data-reveal>
          <p className="label">Contact</p>
          <h2 className="section-title">Have a brand to build?</h2>
          <p className="section-sub">Tell us what you are making and we will get back to you.</p>
          <div className="actions">
            <MagneticLink className="button button-primary" {...bookingLink}>
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
