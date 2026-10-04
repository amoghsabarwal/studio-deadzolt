"use client";

import gsap from "gsap";
import { useEffect } from "react";
import { DURATION, revealLines, rollNumber, scramble } from "@/lib/motion/text";

const DURATION_LONG = DURATION.long;
import { getReducedMotion } from "@/lib/story";

// Scroll reveals for any page:
// [data-split] headings rise line by line from behind a mask,
// [data-scramble] labels decode from random characters,
// [data-count] numbers roll up to their value,
// [data-process] steps light up along a line drawn by the scroll,
// [data-stagger] lists bring their children up one after another,
// [data-wipe-in] blocks wipe in from the left,
// [data-reveal] blocks rise and fade in.
export function useReveals() {
  useEffect(() => {
    if (getReducedMotion()) return;
    const splits: { revert: () => void }[] = [];
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        splits.push(revealLines(el, { trigger: { trigger: el, start: "top 90%" } }));
      });

      gsap.utils.toArray<HTMLElement>("[data-scramble]").forEach((el) => {
        scramble(el, { trigger: { trigger: el, start: "top 92%" } });
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
          y: 36,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
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
            duration: DURATION_LONG,
            ease: "expo.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: el, start: "top 98%" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    });
    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
  }, []);
}

export default function Reveals() {
  useReveals();
  return null;
}
