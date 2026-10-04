// The site's text motion vocabulary. Every heading, label and number uses one
// of these few moves, with the same easing and a three-step duration scale,
// so the motion reads as designed rather than random.

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

export const DURATION = { short: 0.5, base: 0.9, long: 1.6 };
export const EASE = "expo.out";
const MONO_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·_-";

type Trigger = ScrollTrigger.Vars | undefined;

// Headings: each line rises from behind its own mask. Re-splits itself when
// fonts load or the width changes, so lines always break where they appear.
export function revealLines(el: HTMLElement, opts: { trigger?: Trigger; delay?: number } = {}) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    linesClass: "split-line",
    onSplit: (split) =>
      gsap.from(split.lines, {
        yPercent: 110,
        duration: DURATION.base + 0.3,
        ease: EASE,
        stagger: 0.08,
        delay: opts.delay ?? 0,
        scrollTrigger: opts.trigger,
      }),
  });
}

// Key words: start dim and fill to paper colour, left to right. The fill is
// a custom property on the container, so words marked .wipe inside it keep
// filling even after their lines are re-split.
export function wipeFill(el: HTMLElement, opts: { trigger?: Trigger; delay?: number } = {}) {
  return gsap.fromTo(
    el,
    { "--wipe": "0%" },
    {
      "--wipe": "100%",
      duration: DURATION.long,
      ease: "power2.inOut",
      delay: opts.delay ?? 0,
      scrollTrigger: opts.trigger,
    },
  );
}

// Mono labels decode from random characters.
export function scramble(el: HTMLElement, opts: { trigger?: Trigger; delay?: number } = {}) {
  const text = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = text;
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", text);
  return gsap.to(el, {
    duration: DURATION.base,
    delay: opts.delay ?? 0,
    scrambleText: { text, chars: MONO_CHARS, speed: 0.6, revealDelay: 0.15 },
    scrollTrigger: opts.trigger,
  });
}

// Numbers roll up to their value, keeping their prefix and separators
// ("$5,000" counts from $0).
export function rollNumber(el: HTMLElement, opts: { trigger?: Trigger } = {}) {
  const text = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = text;
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", text);
  const match = text.match(/^(\D*)([\d,]+)(.*)$/);
  if (!match) return;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  const counter = { value: 0 };
  return gsap.to(counter, {
    value: target,
    duration: DURATION.long,
    ease: "expo.out",
    scrollTrigger: opts.trigger,
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(counter.value).toLocaleString("en-US")}${suffix}`;
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}
