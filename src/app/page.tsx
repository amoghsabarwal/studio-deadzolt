import Link from "next/link";
import BookingEmbed from "@/components/BookingEmbed";
import Showreel from "@/components/Showreel";
import HoloLayers from "@/components/HoloLayers";
import StudioClock from "@/components/StudioClock";
import TiltHint from "@/components/TiltHint";
import StoryDriver from "@/components/story/StoryDriver";
import { bookingLink, plans, projects, site } from "@/content/site";

// The home page is short and built to get a call booked: the hero, the
// showreel, the work, the plans, and one last ask. Each element with
// data-chapter is a chapter; the 3D scene moves to a new pose for each one.

export default function Home() {
  return (
    <>
      <StoryDriver />

      <section id="arrival" data-chapter className="chapter hero">
        <div className="hero-copy" data-hero>
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Motion graphics studio · {site.location}
          </p>
          <h1 className="hero-title" data-hero-title>
            Motion graphics people can&apos;t <em className="wipe">scroll past.</em>
          </h1>
          <p className="hero-sub">
            Launch films, product animation and social content for startups and brands that need to be
            seen.
          </p>
          <div className="actions">
            <a className="button button-primary" {...bookingLink("hero")}>
              {site.cta}
            </a>
            <a className="button" href="#showreel">
              Watch the reel
            </a>
          </div>
          <p className="cta-note">{site.ctaNote}</p>
        </div>
        <div className="hero-foot label">
          <ul aria-label="What the studio makes">
            {site.services.slice(0, 4).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="hero-clock">
            Indore <StudioClock />
          </p>
        </div>
      </section>

      <Showreel />

      <section id="work" data-chapter className="chapter work">
        <div className="section-head">
          <p className="label" data-scramble>Work</p>
          <h2 className="section-title" data-split>
            Everything we&apos;ve made
          </h2>
        </div>
        <ol className="work-list" data-stagger>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/works/${p.slug}`}
                className="work-row"
                data-focus={p.disciplines[0]}
                data-cursor="View"
              >
                <span className="label work-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="work-title">{p.title}</span>
                <span className="label work-date">{p.year}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" data-chapter className="chapter pricing">
        <div className="section-head">
          <p className="label" data-scramble>Work with the studio</p>
          <h2 className="section-title" data-split>
            Start with a conversation.
          </h2>
          <p className="section-sub">
            Every project starts with a free 30-minute call. You leave with a clear scope and a fixed quote,
            whether or not we work together.
          </p>
        </div>

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
                <p className="plan-price">{plan.price}</p>
                <p className="plan-summary">{plan.summary}</p>
              </header>
              <ul className="plan-list">
                {plan.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className={plan.featured ? "button button-primary" : "button"}
                {...bookingLink(`plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                {site.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" data-chapter className="chapter contact">
        <div className="contact-copy">
          <p className="label" data-scramble>Book</p>
          <h2 className="section-title" data-split>
            Have something to launch?
          </h2>
          <p className="section-sub">
            Pick a time that suits you. {site.ctaNote}
          </p>
          <p className="contact-alt">
            Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <BookingEmbed from="closing" />
      </section>
    </>
  );
}
