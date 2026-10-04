"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getReducedMotion, setStory } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

// Wires the home page's chapters to the scroll: tracks which chapter is in
// view for the 3D scene and chapter nav, and runs the text reveals.
export default function StoryDriver() {
  useEffect(() => {
    setStory({ active: true, chapter: 0, progress: 0 });
    const reduced = getReducedMotion();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setStory({ chapter: index }),
          onUpdate: (self) => setStory({ progress: self.progress }),
        });
      });

      if (reduced) return;

      // Manifesto: words light up one by one as you scroll through it.
      const words = gsap.utils.toArray<HTMLElement>("[data-word]");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-manifesto]",
              start: "top 75%",
              end: "bottom 45%",
              scrub: true,
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // Arrival headline drifts up and fades as the story begins.
      gsap.to("[data-arrival-title]", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#arrival", start: "top top", end: "bottom top", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      setStory({ active: false, chapter: 0, progress: 0 });
    };
  }, []);

  return null;
}
