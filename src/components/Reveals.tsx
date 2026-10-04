"use client";

import gsap from "gsap";
import { useEffect } from "react";
import { revealLines, rollNumber, scramble } from "@/lib/motion/text";
import { getReducedMotion } from "@/lib/story";

// Scroll reveals for any page:
// [data-split] headings rise line by line from behind a mask,
// [data-scramble] labels decode from random characters,
// [data-count] numbers roll up to their value,
// [data-stagger] lists bring their children up one after another,
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
