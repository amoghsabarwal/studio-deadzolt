"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { holoScramble } from "@/lib/motion/holo";
import { STAGGER, replay } from "@/lib/motion/tokens";
import { getReducedMotion } from "@/lib/story";
import { bookingLink, site } from "@/content/site";
import "./ProcessBento.css";

gsap.registerPlugin(ScrollTrigger);

// How the monthly plan runs, as a bento that shows the work becoming a
// render. Every tile is one stage of the same object, the Deadzolt star, in
// one hairline style on graph-paper dots, with exactly one red "live" thing:
//   01  a brief card writes itself, files travel to a storyboard, shots sketch
//   02  a 48-hour dial: wireframe, clay, render, with a red hand on the clock
//   03  one master frame, its four crops for every feed
//   +   the star as a turning topology mesh beside the craft line
// Inline SVG and the existing star image only, so it plays the same without
// WebGL. Each drawing loops only while it's on screen.

const STAR = "/models/previews/deadzolt-star.webp";
const EXPO = "expo.out";

const NOTES = [
  "Send a brief in your shared Slack channel or by email.",
  "Wireframe, clay, then the final render, on the clock.",
  "One master frame, cut for each feed.",
];

// ---------- geometry ----------
type Pt = [number, number];
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => 1 - Math.pow(1 - x, 4);
const f1 = (n: number) => n.toFixed(1);

// The star as a line drawing: five long concave points, slightly uneven like
// the render. `squash` narrows it, to turn it on its vertical axis.
function star(cx: number, cy: number, R: number, r: number, rot = 0, squash = 1) {
  const lens = [1, 0.82, 0.95, 0.78, 0.9];
  const pts: Pt[] = lens.map((l, i) => {
    const a = rot + (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return [cx + Math.cos(a) * R * l * squash, cy + Math.sin(a) * R * l];
  });
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  pts.forEach((_, i) => {
    const q = pts[(i + 1) % 5];
    const am = rot + ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
    d += ` Q${f1(cx + Math.cos(am) * r * squash)} ${f1(cy + Math.sin(am) * r)} ${f1(q[0])} ${f1(q[1])}`;
  });
  return { d, pts };
}

const iso = (x: number, y: number, z: number, ox: number, oy: number): Pt => [
  ox + (x - y) * 0.866,
  oy + (x + y) * 0.5 - z,
];

function isoBox(ox: number, oy: number, w: number, d: number, h: number) {
  const P = (x: number, y: number, z: number) => iso(x, y, z, ox, oy).map(f1).join(" ");
  return `M${P(0, 0, h)} L${P(w, 0, h)} L${P(w, d, h)} L${P(0, d, h)} Z M${P(0, d, h)} L${P(0, d, 0)} L${P(w, d, 0)} L${P(w, 0, 0)} L${P(w, 0, h)} M${P(w, d, h)} L${P(w, d, 0)}`;
}

// Reveals a path drawn with pathLength={1} up to fraction f.
const draw = (el: SVGElement | null, f: number) => el?.style.setProperty("stroke-dashoffset", String(1 - f));

// ---------- 01 · brief to storyboard ----------
const B = { ox: 84, oy: 64 };
const BRIEF_LINES: [number, number][] = [
  [14, 80],
  [14, 62],
  [14, 86],
  [14, 48],
];
const ROUTE = `M${B.ox + 92} ${B.oy + 34} C ${B.ox + 150} ${B.oy - 26} ${B.ox + 190} ${B.oy + 112} ${B.ox + 252} ${B.oy + 14}`;
const SHOTS = [0, 1, 2].map((i) => {
  const w = 74;
  const h = 54;
  const x = 352 + i * (w + 12);
  const y = 40 + (i % 2) * 10;
  return { x, y, w, h, s: star(x + w / 2, y + h / 2, [19, 15, 23][i], [7, 5.5, 8.5][i], i * 0.5, [1, 0.7, 1][i]) };
});

function BriefArt() {
  return (
    <svg className="pb-art pb-brief" viewBox="0 28 620 184" aria-hidden="true">
      <path className="h" d={isoBox(B.ox, B.oy, 120, 90, 6)} />
      {BRIEF_LINES.map(([x, len], i) => {
        const a = iso(x, 20 + i * 18, 6, B.ox, B.oy);
        const b = iso(x + len, 20 + i * 18, 6, B.ox, B.oy);
        return <path key={i} className="h draw" pathLength={1} data-a="line" d={`M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}`} />;
      })}
      <text x={12} y={204}>
        # DEADZOLT-X-YOURTEAM
      </text>
      <path className="d" d={ROUTE} data-a="route" />
      {["PDF", "SVG", "FIG"].map((t) => (
        <g key={t} data-a="slab" opacity={0}>
          <path className="h" d={isoBox(18, 8, 22, 16, 4)} />
          <text x={4} y={36}>
            {t}
          </text>
        </g>
      ))}
      {SHOTS.map((s, i) => (
        <g key={i}>
          <rect className="f" data-a="shot" x={s.x} y={s.y} width={s.w} height={s.h} rx={5} />
          <path className="h draw" pathLength={1} data-a="sketch" d={s.s.d} />
          <text x={s.x} y={s.y + s.h + 16}>
            SH {String(i + 1).padStart(2, "0")} · {["0:00", "0:06", "0:14"][i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function briefRender(svg: SVGSVGElement) {
  const lines = svg.querySelectorAll<SVGPathElement>("[data-a='line']");
  const route = svg.querySelector<SVGPathElement>("[data-a='route']")!;
  const L = route.getTotalLength();
  const slabs = svg.querySelectorAll<SVGGElement>("[data-a='slab']");
  const shots = svg.querySelectorAll<SVGRectElement>("[data-a='shot']");
  const sketches = svg.querySelectorAll<SVGPathElement>("[data-a='sketch']");
  return (t: number) => {
    lines.forEach((p, i) => draw(p, ease(seg(t, 0.02 + i * 0.05, 0.2 + i * 0.05))));
    slabs.forEach((g, i) => {
      const f = ease(seg(t, 0.25 + i * 0.07, 0.6 + i * 0.07));
      const pt = route.getPointAtLength(L * f);
      g.setAttribute("transform", `translate(${f1(pt.x - 18)} ${f1(pt.y - 14)})`);
      g.setAttribute("opacity", f > 0 && f < 1 ? "1" : "0");
    });
    shots.forEach((r, i) => {
      const on = seg(t, 0.3 + i * 0.18, 0.55 + i * 0.18);
      r.setAttribute("class", on > 0 ? "h" : "f");
      draw(sketches[i], ease(on));
    });
  };
}

// ---------- 02 · the 48-hour dial ----------
const D = { cx: 200, cy: 200, R: 138 };
const ang = (h: number) => (h / 48) * 2 * Math.PI - Math.PI / 2;
const at = (h: number, r: number): Pt => [D.cx + Math.cos(ang(h)) * r, D.cy + Math.sin(ang(h)) * r];
const PHASES: [string, number, number][] = [
  ["WIREFRAME", 0, 16],
  ["CLAY", 16, 32],
  ["RENDER", 32, 48],
];
const SR = D.R * 0.52;
const WIRE = star(D.cx, D.cy, SR, SR * 0.34, 0.2);

function DialArt() {
  const rr = D.R + 22;
  return (
    <svg className="pb-art pb-dial" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id="pb-soft-g">
          <stop offset="55%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="pb-soft" maskContentUnits="objectBoundingBox">
          <rect width={1} height={1} fill="url(#pb-soft-g)" />
        </mask>
      </defs>
      <circle className="h" cx={D.cx} cy={D.cy} r={D.R} />
      {Array.from({ length: 48 }, (_, i) => {
        const long = i % 8 === 0;
        const [x1, y1] = at(i, D.R - (long ? 14 : 6));
        const [x2, y2] = at(i, D.R);
        return <line key={i} className={long ? "h" : "f"} x1={f1(x1)} y1={f1(y1)} x2={f1(x2)} y2={f1(y2)} />;
      })}
      {PHASES.map(([name, a0, a1]) => {
        const p0 = [D.cx + Math.cos(ang(a0) + 0.04) * rr, D.cy + Math.sin(ang(a0) + 0.04) * rr];
        const p1 = [D.cx + Math.cos(ang(a1) - 0.04) * rr, D.cy + Math.sin(ang(a1) - 0.04) * rr];
        const [lx, ly] = at((a0 + a1) / 2, rr + 16);
        return (
          <g key={name} data-a="phase" className="pb-phase">
            <path d={`M${f1(p0[0])} ${f1(p0[1])} A${rr} ${rr} 0 0 1 ${f1(p1[0])} ${f1(p1[1])}`} />
            <text x={f1(lx)} y={f1(ly + 3)} textAnchor="middle">
              {name}
            </text>
          </g>
        );
      })}
      {[0, 16, 32].map((h) => {
        const [x, y] = at(h, D.R - 30);
        return (
          <text key={h} x={f1(x)} y={f1(y + 3)} textAnchor="middle">
            {h}H
          </text>
        );
      })}
      <g data-a="wire">
        <path className="h draw" pathLength={1} data-a="wire-star" d={WIRE.d} />
        {WIRE.pts.map((q, i) => (
          <line key={i} className="f" x1={D.cx} y1={D.cy} x2={f1(q[0])} y2={f1(q[1])} />
        ))}
        {[0.66, 0.36].map((k) => (
          <path key={k} className="f" d={star(D.cx, D.cy, SR * k, SR * 0.34 * k, 0.2).d} />
        ))}
      </g>
      <image
        data-a="clay"
        className="pb-stage-img pb-clay"
        href={STAR}
        x={D.cx - SR * 1.25}
        y={D.cy - SR * 1.25}
        width={SR * 2.5}
        height={SR * 2.5}
        mask="url(#pb-soft)"
      />
      <image
        data-a="render"
        className="pb-stage-img"
        href={STAR}
        x={D.cx - SR * 1.25}
        y={D.cy - SR * 1.25}
        width={SR * 2.5}
        height={SR * 2.5}
        mask="url(#pb-soft)"
      />
      <line data-a="hand" className="r" x1={D.cx} y1={D.cy} x2={D.cx} y2={D.cy - D.R + 4} />
      <circle cx={D.cx} cy={D.cy} r={4} className="pb-dot" />
    </svg>
  );
}

function dialRender(svg: SVGSVGElement, status: HTMLElement, clock: HTMLElement) {
  const phases = svg.querySelectorAll<SVGGElement>("[data-a='phase']");
  const wire = svg.querySelector<SVGGElement>("[data-a='wire']")!;
  const wireStar = svg.querySelector<SVGPathElement>("[data-a='wire-star']");
  const clay = svg.querySelector<SVGImageElement>("[data-a='clay']")!;
  const render = svg.querySelector<SVGImageElement>("[data-a='render']")!;
  const hand = svg.querySelector<SVGLineElement>("[data-a='hand']")!;
  let last = "";
  return (t: number) => {
    const h = t * 48;
    phases.forEach((g, i) => {
      const [, a0, a1] = PHASES[i];
      g.setAttribute("class", `pb-phase${h >= a1 ? " is-done" : h > a0 ? " is-on" : ""}`);
    });
    hand.setAttribute("transform", `rotate(${f1(t * 360)} ${D.cx} ${D.cy})`);
    draw(wireStar, ease(seg(t, 0, 0.3)));
    wire.style.opacity = h < 20 ? "1" : "0";
    clay.style.opacity = h >= 16 && h < 32 ? "1" : "0";
    render.style.opacity = h >= 32 ? "1" : "0";
    const left = Math.max(0, 48 - h);
    const hh = String(Math.floor(left)).padStart(2, "0");
    const mm = String(Math.floor((left % 1) * 60)).padStart(2, "0");
    clock.textContent = `T-${hh}:${mm}:00`;
    const s = t >= 1 ? "● V1 · READY FOR REVIEW" : "RENDERING · OCTANE";
    if (s !== last) {
      last = s;
      status.textContent = s;
      status.classList.toggle("is-ready", t >= 1);
    }
  };
}

// ---------- 03 · one master frame, nested crops ----------
const C = { cx: 214, cy: 112 };
const CROPS: [string, number, number, string][] = [
  ["16:9", 184, 103, "YOUTUBE · SITE"],
  ["9:16", 86, 152, "REELS · TIKTOK"],
  ["1:1", 122, 122, "FEED"],
  ["4:5", 106, 132, "LINKEDIN"],
];

function CropsArt() {
  return (
    <svg className="pb-art pb-crops" viewBox="0 0 380 230" aria-hidden="true">
      <image href={STAR} x={C.cx - 60} y={C.cy - 60} width={120} height={120} mask="url(#pb-soft)" />
      {CROPS.map(([r, w, h, where]) => {
        const x = C.cx - w / 2;
        const y = C.cy - h / 2;
        const k = 10;
        const corners = [
          [x, y, 1, 1],
          [x + w, y, -1, 1],
          [x, y + h, 1, -1],
          [x + w, y + h, -1, -1],
        ];
        return (
          <g key={r} data-a="crop" className="pb-crop">
            <rect x={x} y={y} width={w} height={h} rx={3} />
            <path
              className="pb-marks"
              d={corners.map(([a, b, sx, sy]) => `M${a - sx * 6} ${b} L${a + sx * k} ${b} M${a} ${b - sy * 6} L${a} ${b + sy * k}`).join(" ")}
            />
            <text className="pb-crop-ratio" x={x + 6} y={y + 14}>
              {r}
            </text>
            <text className="pb-crop-where" x={C.cx} y={y + h + 18} textAnchor="middle">
              {where}
            </text>
          </g>
        );
      })}
      {CROPS.map(([r], i) => (
        <text key={r} data-a="tick" x={14} y={150 + i * 17}>
          · {r}
        </text>
      ))}
    </svg>
  );
}

function cropsRender(svg: SVGSVGElement) {
  const crops = svg.querySelectorAll<SVGGElement>("[data-a='crop']");
  const ticks = svg.querySelectorAll<SVGTextElement>("[data-a='tick']");
  return (t: number) => {
    const act = Math.min(3, Math.floor(t * 4));
    crops.forEach((g, i) => g.setAttribute("class", `pb-crop${i === act && t < 1 ? " is-on" : ""}`));
    ticks.forEach((el, i) => {
      const done = i < act || t >= 1;
      el.textContent = `${done ? "✓" : "·"} ${CROPS[i][0]}`;
      el.setAttribute("class", done ? "w" : "");
    });
  };
}

// ---------- craft · the star as a turning mesh ----------
const M = { cx: 100, cy: 92, R: 74 };
function meshPaths(turn: number) {
  const outer = star(M.cx, M.cy, M.R, M.R * 0.34, 0.2, turn);
  return {
    rings: [1, 2, 3, 4, 5, 6].map((k) => star(M.cx, M.cy, (M.R * k) / 6, (M.R * 0.34 * k) / 6, 0.2, turn).d),
    pts: outer.pts,
  };
}

function MeshArt() {
  const m = meshPaths(1);
  return (
    <svg className="pb-art pb-mesh" viewBox="0 10 200 165" aria-hidden="true">
      {m.rings.map((d, i) => (
        <path key={i} data-a="ring" className={i === 5 ? "h" : "f"} d={d} />
      ))}
      {m.pts.map((q, i) => (
        <line key={i} data-a="spoke" className="f" x1={M.cx} y1={M.cy} x2={f1(q[0])} y2={f1(q[1])} />
      ))}
      <circle data-a="tip" className="pb-dot" r={3} cx={f1(m.pts[0][0])} cy={f1(m.pts[0][1])} />
    </svg>
  );
}

function meshRender(svg: SVGSVGElement) {
  const rings = svg.querySelectorAll<SVGPathElement>("[data-a='ring']");
  const spokes = svg.querySelectorAll<SVGLineElement>("[data-a='spoke']");
  const tip = svg.querySelector<SVGCircleElement>("[data-a='tip']")!;
  return (t: number) => {
    const m = meshPaths(Math.cos(t * Math.PI * 2));
    rings.forEach((p, i) => p.setAttribute("d", m.rings[i]));
    spokes.forEach((l, i) => {
      l.setAttribute("x2", f1(m.pts[i][0]));
      l.setAttribute("y2", f1(m.pts[i][1]));
    });
    tip.setAttribute("cx", f1(m.pts[0][0]));
    tip.setAttribute("cy", f1(m.pts[0][1]));
  };
}

function Head({ n, title }: { n: number; title: string }) {
  return (
    <header className="pb-head">
      <span className="label">{String(n).padStart(2, "0")}</span>
      <div>
        <h3 className="pb-title" data-pb-title>
          {title}
        </h3>
        <p className="pb-note">{NOTES[n - 1]}</p>
      </div>
    </header>
  );
}

export default function ProcessBento() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = getReducedMotion();
    const one = <T extends Element>(s: string) => el.querySelector(s) as T;

    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>(".pb-tile", el);

      // Entrance: tiles come in from a blur, one after another.
      if (!reduced) {
        gsap.from(tiles, {
          y: 24,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.7,
          ease: EXPO,
          stagger: STAGGER,
          clearProps: "transform,filter",
          scrollTrigger: { trigger: el, start: "top 82%" },
        });
        gsap.utils
          .toArray<HTMLElement>("[data-pb-title]", el)
          .forEach((t) => holoScramble(t, { speed: 1.6, scrollTrigger: replay(t, "top 92%") }));
      }

      // Each drawing is a function of t (0 to 1), driven by its own loop.
      const loop = (tile: HTMLElement, render: (t: number) => void, run: number, hold: number, ease = "none") => {
        const p = { t: 0 };
        const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: hold, onRepeat: () => render(0) });
        tl.to(p, { t: 1, duration: run, ease, onUpdate: () => render(p.t) });
        render(reduced ? 1 : 0);
        return { tile, tl };
      };

      const brief = one<HTMLElement>(".pb-request");
      const frames = one<HTMLElement>(".pb-frames");
      const exportsTile = one<HTMLElement>(".pb-exports-tile");
      const craft = one<HTMLElement>(".pb-craft");
      const loops = [
        loop(brief, briefRender(brief.querySelector("svg")!), 4.8, 1.2),
        loop(
          frames,
          dialRender(frames.querySelector("svg")!, frames.querySelector("[data-a='status']")!, frames.querySelector("[data-a='clock']")!),
          5,
          1.5,
          "power1.inOut",
        ),
        loop(exportsTile, cropsRender(exportsTile.querySelector("svg")!), 6, 1.5),
        loop(craft, meshRender(craft.querySelector("svg")!), 8, 0),
      ];

      if (reduced) {
        // The mesh rests facing front; everything else rests finished.
        meshRender(craft.querySelector("svg")!)(0);
        return;
      }

      loops.forEach(({ tile, tl }) => {
        ScrollTrigger.create({
          trigger: tile,
          start: "top 88%",
          end: "bottom 8%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });
        // Hover: the hairlines brighten (CSS) and the loop runs a bit faster.
        tile.addEventListener("pointerenter", () => tl.timeScale(1.5));
        tile.addEventListener("pointerleave", () => tl.timeScale(1));
      });
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
            <span className="pb-live label" aria-hidden="true">
              Live <i />
            </span>
            <BriefArt />
          </article>
          <article className="pb-tile pb-frames" data-hairline="box">
            <Head n={2} title={site.steps[1]} />
            <DialArt />
            <p className="pb-status label" aria-hidden="true">
              <span data-a="status">RENDERING · OCTANE</span>
              <span data-a="clock" className="pb-clock">
                T-48:00:00
              </span>
            </p>
          </article>
          <article className="pb-tile pb-exports-tile" data-hairline="box">
            <Head n={3} title={site.steps[2]} />
            <CropsArt />
          </article>
        </div>
        <article className="pb-tile pb-craft" data-hairline="box">
          <div className="pb-craft-copy">
            <span className="label">Craft</span>
            <p className="pb-craft-line">{site.craft}</p>
          </div>
          <MeshArt />
          <p className="pb-caption label" aria-hidden="true">
            SubD 2 · 4,812 polys
          </p>
        </article>
      </div>
      <a className="pb-book label" {...bookingLink("process")}>
        Book a free call →
      </a>
    </div>
  );
}
