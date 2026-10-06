"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { holoScramble } from "@/lib/motion/holo";
import { STAGGER, replay } from "@/lib/motion/tokens";
import { getReducedMotion } from "@/lib/story";
import { bookingLink, site } from "@/content/site";
import "./ProcessBento.css";
import { inOwnTask } from "@/lib/task";

gsap.registerPlugin(ScrollTrigger);

// How the monthly plan runs, as a bento of small animated drawings. Each tile
// is a quiet UI vignette over a field of hairlines drifting like wind; the
// words sit underneath, title then grey note. Tiles come in from a blur, and
// each drawing resolves a beat later.
//   01  the brief lands in Slack or email and the studio answers
//   02  a dial runs down 48 hours while the star renders bucket by bucket
//   03  one frame reframed for every platform, each row ticking off
//   +   a turning wireframe beside the craft line
// Everything is DOM, SVG and one small image, so it plays the same without
// WebGL. Each drawing loops only while it's on screen.

const STAR = "/models/previews/deadzolt-star.webp";
const COLS = 6;
const ROWS = 4;
const EXPO = "expo.out";

const FORMATS = [
  { ratio: "16:9", where: "YouTube · site", w: 168, h: 94 },
  { ratio: "9:16", where: "Reels · TikTok · Shorts", w: 58, h: 104 },
  { ratio: "1:1", where: "Feed", w: 100, h: 100 },
  { ratio: "4:5", where: "Feed · LinkedIn", w: 84, h: 104 },
];

const NOTES = [
  "Send a brief in your shared Slack channel or by email.",
  "First frames land within 48 hours.",
  "Cut and exported for every platform you post on.",
];

// A bundle of hairlines that pinches and fans out like a ribbon in the wind.
// Every line repeats every P units, so sliding the group by P loops cleanly.
const P = 400;
function linePath(i: number, n: number, mid: number, amp: number, spread: number, phase: number) {
  const k = i - (n - 1) / 2;
  let d = "";
  for (let x = 0; x <= P * 3; x += 10) {
    const t = (2 * Math.PI * x) / P;
    const y = mid + amp * Math.sin(t + phase) + k * spread * (0.25 + 0.75 * (0.5 + 0.5 * Math.cos(t + phase * 0.5)));
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
  }
  return d;
}

function Lines({ mid, amp, spread, phase, red }: { mid: number; amp: number; spread: number; phase: number; red: number }) {
  const n = 12;
  return (
    <svg className="pb-lines" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g>
        {Array.from({ length: n }, (_, i) => (
          <path key={i} d={linePath(i, n, mid, amp, spread, phase)} className={i === red ? "is-red" : undefined} />
        ))}
      </g>
    </svg>
  );
}

function Copy({ n, title }: { n: number; title: string }) {
  return (
    <p className="pb-copy">
      <span className="label">{String(n).padStart(2, "0")}</span>
      <span>
        <b className="pb-title" data-pb-title>
          {title}
        </b>{" "}
        {NOTES[n - 1]}
      </span>
    </p>
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

// 48 ticks, one per hour, lighting up behind the red hand as it sweeps.
function FramesArt() {
  return (
    <div className="pb-art pb-view" aria-hidden="true">
      <div className="pb-view-bar">
        <span>Octane · v1</span>
        <span className="pb-clock">
          T-<b data-a="clock">48:00:00</b>
        </span>
      </div>
      <div className="pb-stage">
        <div className="pb-dial">
          <svg viewBox="-100 -100 200 200">
            <circle className="pb-ring" r="97" />
            {Array.from({ length: 48 }, (_, i) => (
              <line
                key={i}
                className={i % 12 === 0 ? "pb-tick is-major" : "pb-tick"}
                x1="0"
                y1={i % 12 === 0 ? -95 : -93}
                x2="0"
                y2={-87}
                transform={`rotate(${i * 7.5})`}
              />
            ))}
            <g data-a="hand">
              <line className="pb-hand" x1="0" y1="10" x2="0" y2="-86" />
            </g>
            <circle className="pb-hub" r="3.2" />
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
        </div>
        <span className="pb-v1" data-a="v1">
          v1 · ready for review
        </span>
      </div>
    </div>
  );
}

function ExportsArt() {
  return (
    <div className="pb-art pb-exports" aria-hidden="true">
      <div className="pb-frame-box">
        <span className="pb-sheet" />
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
    <svg className="pb-sphere" viewBox="-60 -60 120 120" aria-hidden="true">
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

  useEffect(() => inOwnTask(() => {
    const el = root.current;
    if (!el) return;
    const reduced = getReducedMotion();
    const q = <T extends Element = HTMLElement>(s: string, scope: Element = el) =>
      Array.from(scope.querySelectorAll(s)) as unknown as T[];
    const a = (s: string, scope: Element) => scope.querySelector<HTMLElement>(`[data-a="${s}"]`)!;

    const ctx = gsap.context(() => {
      const tiles = q<HTMLElement>(".pb-tile");

      // Entrance: each tile comes in from a blur, then its drawing resolves
      // out of the haze a beat later.
      if (!reduced) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%" } });
        tl.from(tiles, {
          y: 16,
          opacity: 0,
          filter: "blur(14px)",
          duration: 0.6,
          ease: EXPO,
          stagger: STAGGER,
          clearProps: "transform,filter",
        }).from(
          q(".pb-tile > .pb-art, .pb-tile > .pb-sphere"),
          { opacity: 0, filter: "blur(10px)", scale: 0.985, duration: 0.8, ease: EXPO, stagger: STAGGER, clearProps: "transform,filter" },
          0.3,
        );
        q<HTMLElement>("[data-pb-title]").forEach((t) =>
          holoScramble(t, { speed: 1.6, scrollTrigger: replay(t, "top 92%") }),
        );
      }

      // 01: the brief comes in, files attach, the studio answers.
      const chat = el.querySelector<HTMLElement>(".pb-request")!;
      const chatTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4 });
      chatTl
        .set([a("m1", chat), a("m2", chat), a("q", chat)], { opacity: 0, y: 10, filter: "blur(6px)" })
        .set(q("[data-a^='f']", chat), { opacity: 0, scale: 0.85 })
        .set(a("typing", chat), { opacity: 0 })
        .to(a("m1", chat), { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EXPO }, 0.3)
        .to(q("[data-a^='f']", chat), { opacity: 1, scale: 1, duration: 0.4, ease: EXPO, stagger: 0.12 }, 0.8)
        .to(a("typing", chat), { opacity: 1, duration: 0.2 }, 1.6)
        .to(a("typing", chat), { opacity: 0, duration: 0.2 }, 2.8)
        .to(a("m2", chat), { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EXPO }, 2.9)
        .to(a("q", chat), { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: EXPO }, 3.5)
        .to({}, { duration: 2.4 });

      // 02: the hand sweeps the 48 hours while the render fills in.
      const view = el.querySelector<HTMLElement>(".pb-frames")!;
      const buckets = q<HTMLElement>(".pb-bucket", view);
      const clock = a("clock", view);
      const ticks = q<SVGLineElement>(".pb-tick", view);
      let lit = -1;
      const t = { p: 0 };
      const fmt = (h: number) => {
        const s = Math.max(0, Math.round(h * 3600));
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
      };
      const RUN = 4.4;
      const renderTl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
      renderTl
        .set(buckets, { className: "pb-bucket" })
        .set(a("v1", view), { opacity: 0, y: 8, filter: "blur(6px)" })
        .set(t, { p: 0 })
        .set(a("hand", view), { rotation: 0, svgOrigin: "0 0" })
        .to(
          t,
          {
            p: 1,
            duration: RUN,
            ease: "power1.inOut",
            onUpdate: () => {
              clock.textContent = fmt(48 * (1 - t.p));
              const n = Math.floor(t.p * ticks.length + 0.001);
              if (n !== lit) {
                lit = n;
                ticks.forEach((tk, i) => tk.classList.toggle("is-lit", i < n));
              }
            },
          },
          0.4,
        )
        .to(a("hand", view), { rotation: 360, svgOrigin: "0 0", duration: RUN, ease: "power1.inOut" }, 0.4);
      buckets.forEach((b, i) => {
        const at = 0.6 + (i * (RUN - 0.6)) / buckets.length;
        renderTl.set(b, { className: "pb-bucket is-on" }, at);
        renderTl.set(b, { className: "pb-bucket is-done" }, at + 0.3);
      });
      renderTl
        .to(a("v1", view), { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: EXPO }, RUN + 0.5)
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
          .to(frame, { width: f.w, height: f.h, duration: 0.8, ease: EXPO }, at)
          .call(
            () => {
              ratio.textContent = f.ratio;
              rows.forEach((r, j) => r.classList.toggle("is-on", j === i));
            },
            undefined,
            at,
          )
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

      // Loop each drawing, and let the lines drift, only while on screen.
      loops.forEach(([tile, tl]) =>
        ScrollTrigger.create({
          trigger: tile,
          start: "top 85%",
          end: "bottom 10%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        }),
      );
      tiles.forEach((tile) =>
        ScrollTrigger.create({
          trigger: tile,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => tile.classList.toggle("is-live", self.isActive),
        }),
      );
    }, el);
    return () => ctx.revert();
  }), []);

  return (
    <div className="pb" ref={root} aria-label="How the monthly plan runs" role="group">
      <p className="pb-label label" data-hairline="top">
        How it works
      </p>
      <div className="pb-grid">
        {/* On phones the three steps swipe sideways, like the plans. */}
        <div className="pb-swipe">
          <article className="pb-tile pb-request" data-hairline="box">
            <Lines mid={190} amp={40} spread={7} phase={0.4} red={9} />
            <RequestArt />
            <Copy n={1} title={site.steps[0]} />
          </article>
          <article className="pb-tile pb-frames" data-hairline="box">
            <Lines mid={150} amp={70} spread={9} phase={2.2} red={3} />
            <FramesArt />
            <Copy n={2} title={site.steps[1]} />
          </article>
          <article className="pb-tile pb-exports-tile" data-hairline="box">
            <Lines mid={120} amp={30} spread={6} phase={4.1} red={7} />
            <ExportsArt />
            <Copy n={3} title={site.steps[2]} />
          </article>
        </div>
        <article className="pb-tile pb-craft" data-hairline="box">
          <CraftArt />
          <p className="pb-craft-line">
            <span className="label">Craft</span>
            {site.craft}
          </p>
        </article>
      </div>
      <a className="pb-book label" {...bookingLink("process")}>
        Book a free call →
      </a>
    </div>
  );
}
