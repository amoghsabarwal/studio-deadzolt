// The signature text effect: words scan through look-alike glyphs while a bar
// of the star's holographic foil sweeps across them, then resolve left to
// right. Each word's width is held while it runs, so lines never shift.
// Used on headings, labels, prices and the booking buttons.

import gsap from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

type Word = { span: HTMLSpanElement; text: string };
type Prepared = { words: Word[]; chars: number; label: string };

const prepared = new WeakMap<HTMLElement, Prepared>();

// Stand-ins of the same case and roughly the same width, so the scan reads
// as the word flickering rather than as noise.
const POOLS = {
  narrowUpper: "IJ1",
  narrowLower: "iljtfr",
  wideUpper: "MWOQ",
  wideLower: "mw",
  upper: "ABCDEFGHKNPRSUVXYZ",
  lower: "abcdeghnopqsuvxyz",
  digit: "0123456789",
};

function poolFor(ch: string) {
  if (/[IJ1]/.test(ch)) return POOLS.narrowUpper;
  if (/[iljtfr]/.test(ch)) return POOLS.narrowLower;
  if (/[MW]/.test(ch)) return POOLS.wideUpper;
  if (/[mw]/.test(ch)) return POOLS.wideLower;
  if (/[0-9]/.test(ch)) return POOLS.digit;
  if (/[A-Z]/.test(ch)) return POOLS.upper;
  if (/[a-z]/.test(ch)) return POOLS.lower;
  return null;
}

function stand(ch: string) {
  const pool = poolFor(ch);
  return pool ? pool[Math.floor(Math.random() * pool.length)] : ch;
}

// Wraps each word of the element's text in a span, once. Child elements
// (an <em>, an icon) stay where they are.
function prepare(el: HTMLElement): Prepared {
  const cached = prepared.get(el);
  if (cached) return cached;
  const label = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  const words: Word[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    if (node.parentElement?.closest("[aria-hidden='true']") && node.parentElement !== el) return;
    const parts = (node.textContent ?? "").split(/(\s+)/);
    if (parts.every((p) => !p.trim())) return;
    // One run per text node, so a flex parent (a button) sees one item.
    const frag = document.createElement("span");
    frag.className = "holo-run";
    parts.forEach((part) => {
      if (!part) return;
      if (!part.trim()) return frag.append(part);
      const span = document.createElement("span");
      span.className = "holo-word";
      span.textContent = part;
      frag.append(span);
      words.push({ span, text: part });
    });
    node.replaceWith(frag);
  });
  const chars = words.reduce((n, w) => n + w.text.length, 0);
  const result = { words, chars, label };
  prepared.set(el, result);
  if (!el.hasAttribute("aria-label") && !el.matches("a, button")) el.setAttribute("aria-label", label);
  return result;
}

type Options = {
  delay?: number;
  // Higher is faster.
  speed?: number;
  // The foil bar. Off where the text sits on a light fill (the primary button).
  bar?: boolean;
  scrollTrigger?: ScrollTrigger.Vars;
};

export function holoScramble(el: HTMLElement, opts: Options = {}) {
  const { words, chars } = prepare(el);
  const pass = gsap.utils.clamp(0.3, 0.8, chars * 0.03) / (opts.speed ?? 1.2);
  const bar = opts.bar ?? true;
  const state = { p: 0 };
  let last = 0;

  const lock = () => {
    words.forEach((w) => {
      w.span.style.width = `${w.span.getBoundingClientRect().width}px`;
    });
    el.classList.add("is-holo");
    if (bar) el.classList.add("has-bar");
  };
  const release = () => {
    words.forEach((w) => {
      w.span.textContent = w.text;
      w.span.style.width = "";
    });
    el.classList.remove("is-holo", "has-bar");
    el.style.removeProperty("--bar");
  };

  return gsap.to(state, {
    p: 1,
    // Two scan passes, then one that resolves.
    duration: pass * 3,
    ease: "none",
    delay: opts.delay ?? 0,
    scrollTrigger: opts.scrollTrigger,
    onStart: lock,
    onUpdate: () => {
      const p = state.p;
      // Rewound to the start (scrolled back above it): show the real text.
      if (p === 0) return release();
      if (bar) el.style.setProperty("--bar", `${((p * 3) % 1) * 160 - 30}%`);
      // New glyphs about 20 times a second.
      const now = performance.now();
      if (now - last < 50 && p < 1) return;
      last = now;
      const resolved = p < 2 / 3 ? 0 : (p - 2 / 3) * 3 * chars;
      let i = 0;
      words.forEach((w) => {
        let out = "";
        for (const ch of w.text) out += i++ < resolved ? ch : stand(ch);
        w.span.textContent = out;
      });
    },
    onComplete: release,
    onReverseComplete: release,
    onInterrupt: release,
  });
}
