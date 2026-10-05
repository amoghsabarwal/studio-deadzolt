"use client";

import gsap from "gsap";
import { useEffect } from "react";
import { holoScramble } from "@/lib/motion/holo";
import { rollNumber } from "@/lib/motion/text";
import { DUR, EASE, RISE, STAGGER, replay } from "@/lib/motion/tokens";
import { getReducedMotion } from "@/lib/story";

// Scroll reveals for any page:
// [data-split] headings rise a little and scan in through the holo scramble,
// [data-scramble] labels scan in the same way,
// [data-count] numbers roll up to their value,
// [data-process] steps light up along a line drawn by the scroll,
// [data-stagger] lists bring their children up one after another,
// [data-wipe-in] blocks wipe in from the left,
// [data-reveal] blocks rise and fade in.
export function useReveals() {
  useEffect(() => {
    if (getReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        // Out of focus to sharp, after recent.design's headings.
        gsap.from(el, {
          y: RISE.text / 2,
          opacity: 0,
          filter: "blur(12px)",
          duration: DUR.slow,
          ease: EASE.momentum,
          clearProps: "filter",
          scrollTrigger: replay(el),
        });
        holoScramble(el, { scrollTrigger: replay(el) });
      });

      gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el) => {
        holoScramble(el, { speed: 1.6, scrollTrigger: replay(el, "top 92%") });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        rollNumber(el, { trigger: { trigger: el, start: "top 90%" } });
      });

      // Process: a red line runs through the steps as you scroll, and each
      // step's number lights up as the line reaches it.
      gsap.utils.toArray<HTMLElement>("[data-process]").forEach((list) => {
        const steps = Array.from(list.children) as HTMLElement[];
        gsap.fromTo(
          list,
          { "--p": 0 },
          {
            "--p": 1,
            ease: "none",
            scrollTrigger: {
              trigger: list,
              start: "top 80%",
              end: "bottom 45%",
              scrub: 0.6,
              onUpdate: (self) =>
                steps.forEach((step, i) => step.classList.toggle("is-lit", self.progress >= i / steps.length + 0.02)),
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((list) => {
        gsap.from(list.children, {
          y: RISE.text,
          opacity: 0,
          duration: DUR.base,
          ease: EASE.content,
          stagger: STAGGER,
          // Hand transforms back to CSS so hover lifts and tilts work afterwards.
          clearProps: "transform",
          scrollTrigger: { trigger: list, start: "top 88%" },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-wipe-in]").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 100% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: DUR.slow,
            ease: "power3.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: el, start: "top 98%" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: RISE.text,
          opacity: 0,
          duration: DUR.base,
          ease: EASE.content,
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    });
    return () => ctx.revert();
  }, []);
}

export default function Reveals() {
  useReveals();
  return null;
}
