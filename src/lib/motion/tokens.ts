// The motion system. Every move on the site picks from these few values, so
// it all feels like one hand made it: short, decisive entrances, a narrow set
// of eases, and scrubbed motion only for big visuals.

import type { ScrollTrigger } from "gsap/ScrollTrigger";

export const EASE = {
  // Buttons, hovers, small UI.
  ui: "power2.out",
  // Text and content coming in.
  content: "power3.out",
  // Only for moves with momentum (the star rushing in, a flywheel).
  momentum: "expo.out",
} as const;

export const DUR = { fast: 0.4, base: 0.6, slow: 0.8 } as const;

// How far things travel as they come in.
export const RISE = { text: 24, visual: 76 } as const;

export const STAGGER = 0.08;

// Scrub smoothing for big visuals tied to the scroll.
export const SCRUB = 1.1;

// Text plays once as it enters, and again when it re-enters from above.
export function replay(trigger: Element, start = "top 90%"): ScrollTrigger.Vars {
  return { trigger, start, toggleActions: "play none none reset" };
}
