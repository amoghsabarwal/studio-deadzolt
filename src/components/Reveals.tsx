"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getReducedMotion } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

// Scroll reveals for any page:
// [data-split] headings rise word by word from behind a mask,
// [data-stagger] lists bring their children up one after another,
// [data-reveal] blocks rise and fade in.
export function useReveals() {
  useEffect(() => {
    if (getReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
        gsap.from(heading.querySelectorAll(".word"), {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: heading, start: "top 90%" },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((list) => {
        gsap.from(list.children, {
          y: 36,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          // Hand transforms back to CSS so hover lifts work afterwards.
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
