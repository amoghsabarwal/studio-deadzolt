import Image from "next/image";
import Link from "next/link";
import MagneticLink from "@/components/MagneticLink";
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
            Motion graphics studio · {site.location}
          </p>
          <h1 className="hero-title" data-hero-title>
            Motion graphics people can&apos;t <em className="wipe">scroll past.</em>
          </h1>
          <p className="hero-sub">
            Launch films, product animation and social content for startups and brands that need to be
            seen.
          </p>
          <TiltHint />
          <div className="actions">
            <a className="button button-primary" {...bookingLink}>
              Book a free call
            </a>
            <a className="button" href="#showreel">
              Watch the reel
            </a>
          </div>
        </div>
        <p className="label drag-hint" aria-hidden="true">
          Drag to spin
        </p>
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
            Have something to launch?
          </h2>
          <p className="section-sub">Book a free call and tell us what you are making.</p>
          <div className="actions" data-reveal>
            <MagneticLink className="button button-primary button-foil" {...bookingLink}>
              Book a free call
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
