"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { holoScramble } from "@/lib/motion/holo";
import { DUR, EASE, STAGGER, replay } from "@/lib/motion/tokens";
import { getReducedMotion } from "@/lib/story";
import { bookingLink, site } from "@/content/site";
import "./ProcessBento.css";

gsap.registerPlugin(ScrollTrigger);

// How the monthly plan runs, as a bento of small animated drawings in the
// language of a 3D viewport: a brief landing in Slack, a render filling in
// bucket by bucket against the 48-hour clock, one frame reframed for every
// platform, and a turning wireframe for the craft line. Everything is DOM,
// SVG and one small image, so it plays the same with or without WebGL.
// Each drawing loops only while it's on screen.

const STAR = "/models/previews/deadzolt-star.webp";
const COLS = 6;
const ROWS = 4;

const FORMATS = [
  { ratio: "16:9", where: "YouTube · site", w: 176, h: 99 },
  { ratio: "9:16", where: "Reels · TikTok · Shorts", w: 62, h: 110 },
  { ratio: "1:1", where: "Feed", w: 104, h: 104 },
  { ratio: "4:5", where: "Feed · LinkedIn", w: 88, h: 110 },
];

const NOTES = [
  "Send a brief in your shared Slack channel or by email.",
  "First frames land within 48 hours.",
  "Cut and exported for every platform you post on.",
];

function Head({ n, title }: { n: number; title: string }) {
  return (
    <header className="pb-head">
      <span className="label">{String(n).padStart(2, "0")}</span>
      <h3 className="pb-title" data-pb-title>
        {title}
      </h3>
      <p className="pb-note">{NOTES[n - 1]}</p>
    </header>
  );
}

function RequestArt() {
  return (
    <div className="pb-art pb-chat" aria-hidden="true">
      <div className="pb-chat-bar">
        <span># deadzolt-x-yourteam</span>
        <span className="pb-chat-live">
          <i /> live
        </span>
      </div>
      <div className="pb-msg" data-a="m1">
        <span className="pb-ava">Y</span>
        <div>
          <p className="pb-who">
            You <em>10:02</em>
          </p>
          <p>Launch teaser for the new app. 20 seconds, vertical and wide.</p>
          <p className="pb-files">
            <span data-a="f1">brief.pdf</span>
            <span data-a="f2">logo.svg</span>
            <span data-a="f3">app-screens.fig</span>
          </p>
        </div>
      </div>
      <div className="pb-msg" data-a="m2">
        <span className="pb-ava pb-ava-dz">
          <i style={{ backgroundImage: "url(/brand/star.webp)" }} />
        </span>
        <div>
          <p className="pb-who">
            Deadzolt <em>10:04</em>
          </p>
          <p>On it. First frames Wednesday.</p>
          <p className="pb-queued" data-a="q">
            <i /> Added to the queue · request 01
          </p>
        </div>
      </div>
      <div className="pb-typing" data-a="typing">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function FramesArt() {
  return (
    <div className="pb-art pb-view" aria-hidden="true">
      <div className="pb-view-bar">
        <span>Perspective · Octane</span>
        <span className="pb-clock">
          T-<b data-a="clock">48:00:00</b>
        </span>
      </div>
      <div className="pb-stage">
        <svg className="pb-floor" viewBox="0 0 400 160" preserveAspectRatio="none">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={200 + (i - 5) * 18} y1={0} x2={200 + (i - 5) * 80} y2={160} />
          ))}
          {[0, 14, 34, 62, 100, 150].map((y) => (
            <line key={`h${y}`} x1={0} y1={y + 2} x2={400} y2={y + 2} />
          ))}
        </svg>
        <div className="pb-render">
          <span className="pb-clay" style={{ backgroundImage: `url(${STAR})` }} />
          <div className="pb-buckets">
            {Array.from({ length: COLS * ROWS }, (_, i) => (
              <span
                key={i}
                className="pb-bucket"
                style={{ "--c": i % COLS, "--r": Math.floor(i / COLS) } as React.CSSProperties}
              >
                <i style={{ backgroundImage: `url(${STAR})` }} />
              </span>
            ))}
          </div>
        </div>
        <span className="pb-v1" data-a="v1">
          v1 · ready for review
        </span>
      </div>
      <div className="pb-timeline">
        <span className="pb-track">
          {[8, 30, 52, 74, 92].map((x) => (
            <i key={x} className="pb-key" style={{ left: `${x}%` }} />
          ))}
          <span className="pb-playhead" data-a="head" />
        </span>
        <span className="pb-tc">
          <span>00:00</span>
          <span>00:20</span>
        </span>
      </div>
    </div>
  );
}

function ExportsArt() {
  return (
    <div className="pb-art pb-exports" aria-hidden="true">
      <div className="pb-frame-box">
        <span className="pb-frame" data-a="frame">
          <span className="pb-frame-star" style={{ backgroundImage: `url(${STAR})` }} />
          <span className="pb-ratio" data-a="ratio">
            16:9
          </span>
        </span>
      </div>
      <ul className="pb-formats">
        {FORMATS.map((f) => (
          <li key={f.ratio} data-a="row">
            <span className="pb-fr">{f.ratio}</span>
            <span className="pb-where">{f.where}</span>
            <span className="pb-bar">
              <i />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CraftArt() {
  return (
    <svg className="pb-art pb-sphere" viewBox="-60 -60 120 120" aria-hidden="true">
      <circle r="50" />
      {[-30, -15, 0, 15, 30].map((y) => (
        <ellipse key={y} cy={y} rx={Math.sqrt(50 * 50 - y * y)} ry={Math.sqrt(50 * 50 - y * y) * 0.18} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse key={i} className="pb-meridian" rx="50" ry="50" style={{ animationDelay: `${-i}s` }} />
      ))}
      <circle className="pb-node" r="2.6" cx="0" cy="-50" />
    </svg>
  );
}

export default function ProcessBento() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = getReducedMotion();
    const q = <T extends Element = HTMLElement>(s: string, scope: Element = el) =>
      Array.from(scope.querySelectorAll<T & Element>(s)) as T[];

    const ctx = gsap.context(() => {
      const tiles = q<HTMLElement>(".pb-tile");

      // Entrance: tiles rise in one after another and their titles scan in.
      if (!reduced) {
        gsap.from(tiles, {
          y: 32,
          opacity: 0,
          duration: DUR.slow,
          ease: EASE.content,
          stagger: STAGGER,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
        q<HTMLElement>("[data-pb-title]").forEach((t) =>
          holoScramble(t, { speed: 1.6, scrollTrigger: replay(t, "top 88%") }),
        );
      }

      // 01: the brief comes in, files attach, the studio answers.
      const chat = el.querySelector<HTMLElement>(".pb-request")!;
      const a = (s: string, scope: Element) => scope.querySelector<HTMLElement>(`[data-a="${s}"]`)!;
      const chatTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 });
      chatTl
        .set([a("m1", chat), a("m2", chat), a("q", chat)], { opacity: 0, y: 12 })
        .set(q("[data-a^='f']", chat), { opacity: 0, scale: 0.8 })
        .set(a("typing", chat), { opacity: 0 })
        .to(a("m1", chat), { opacity: 1, y: 0, duration: DUR.base, ease: EASE.content }, 0.3)
        .to(q("[data-a^='f']", chat), { opacity: 1, scale: 1, duration: DUR.fast, ease: EASE.ui, stagger: 0.12 }, 0.8)
        .to(a("typing", chat), { opacity: 1, duration: 0.2 }, 1.6)
        .to(a("typing", chat), { opacity: 0, duration: 0.2 }, 2.8)
        .to(a("m2", chat), { opacity: 1, y: 0, duration: DUR.base, ease: EASE.content }, 2.9)
        .to(a("q", chat), { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.ui }, 3.5)
        .to({}, { duration: 2.4 });

      // 02: the clay pass, then the render fills in bucket by bucket while
      // the clock runs down from 48 hours.
      const view = el.querySelector<HTMLElement>(".pb-frames")!;
      const buckets = q<HTMLElement>(".pb-bucket", view);
      const clock = a("clock", view);
      const t = { h: 48 };
      const fmt = (h: number) => {
        const s = Math.max(0, Math.round(h * 3600));
        const p = (n: number) => String(n).padStart(2, "0");
        return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
      };
      const renderTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
      renderTl
        .set(buckets, { className: "pb-bucket" })
        .set(a("v1", view), { opacity: 0, y: 8 })
        .set(t, { h: 48 })
        .set(a("head", view), { left: "0%" })
        .to(t, { h: 0, duration: 4.2, ease: "power1.inOut", onUpdate: () => (clock.textContent = fmt(t.h)) }, 0.4)
        .to(a("head", view), { left: "100%", duration: 4.2, ease: "none" }, 0.4);
      buckets.forEach((b, i) => {
        renderTl.set(b, { className: "pb-bucket is-on" }, 0.6 + i * 0.15);
        renderTl.set(b, { className: "pb-bucket is-done" }, 0.6 + i * 0.15 + 0.3);
      });
      renderTl
        .to(a("v1", view), { opacity: 1, y: 0, duration: DUR.base, ease: EASE.content }, 4.7)
        .to({}, { duration: 2.2 });

      // 03: one frame reframed for each platform, each row ticking off.
      const ex = el.querySelector<HTMLElement>(".pb-exports-tile")!;
      const frame = a("frame", ex);
      const ratio = a("ratio", ex);
      const rows = q<HTMLElement>("[data-a='row']", ex);
      const exTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.2 });
      exTl.call(() => rows.forEach((r) => r.classList.remove("is-on", "is-done")));
      FORMATS.forEach((f, i) => {
        const at = i * 1.5;
        exTl
          .to(frame, { width: f.w, height: f.h, duration: DUR.slow, ease: EASE.content }, at)
          .call(() => {
            ratio.textContent = f.ratio;
            rows.forEach((r, j) => r.classList.toggle("is-on", j === i));
          }, undefined, at)
          .fromTo(rows[i].querySelector("i"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power1.inOut" }, at + 0.2)
          .call(() => rows[i].classList.add("is-done"), undefined, at + 1.3);
      });
      exTl.to({}, { duration: 1.4 });

      const loops: [HTMLElement, gsap.core.Timeline][] = [
        [chat, chatTl],
        [view, renderTl],
        [ex, exTl],
      ];

      if (reduced) {
        // Show each drawing finished and still.
        loops.forEach(([, tl]) => tl.progress(0.98).pause());
        rows.forEach((r) => r.classList.add("is-done"));
        return;
      }

      // Loop each drawing only while its tile is on screen.
      loops.forEach(([tile, tl]) =>
        ScrollTrigger.create({
          trigger: tile,
          start: "top 85%",
          end: "bottom 10%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        }),
      );
      const craft = el.querySelector<HTMLElement>(".pb-craft")!;
      [chat, view, ex, craft].forEach((tile) =>
        ScrollTrigger.create({
          trigger: tile,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => tile.classList.toggle("is-live", self.isActive),
        }),
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="pb" ref={root} aria-label="How the monthly plan runs" role="group">
      <p className="pb-label label" data-hairline="top">
        How it works
      </p>
      <div className="pb-grid">
        {/* On phones the three steps swipe sideways, like the plans. */}
        <div className="pb-swipe">
          <article className="pb-tile pb-request" data-hairline="box">
            <Head n={1} title={site.steps[0]} />
            <RequestArt />
          </article>
          <article className="pb-tile pb-frames" data-hairline="box">
            <Head n={2} title={site.steps[1]} />
            <FramesArt />
          </article>
          <article className="pb-tile pb-exports-tile" data-hairline="box">
            <Head n={3} title={site.steps[2]} />
            <ExportsArt />
          </article>
        </div>
        <article className="pb-tile pb-craft" data-hairline="box">
          <CraftArt />
          <div>
            <span className="label">Craft</span>
            <p className="pb-craft-line">{site.craft}</p>
          </div>
        </article>
      </div>
      <a className="pb-book label" {...bookingLink("process")}>
        Book a free call →
      </a>
    </div>
  );
}
