"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getReducedMotion, setStory } from "@/lib/story";
import { wipeFill } from "@/lib/motion/text";
import { useReveals } from "../Reveals";

gsap.registerPlugin(ScrollTrigger);

// Wires the home page to the scroll: which chapter is in view (for
// the 3D star), and the text reveals.
export default function StoryDriver() {
  useEffect(() => {
    setStory({ active: true, chapter: 0, progress: 0 });
    const reduced = getReducedMotion();

    const ctx = gsap.context(() => {
      // The hero is on screen from the first paint, so the offer and the
      // Book button never wait on a loader. "scroll past." fills in once.
      const title = document.querySelector<HTMLElement>("[data-hero-title]");
      if (title && !reduced) wipeFill(title, { delay: 0.4 });

      // The active chapter is the furthest one whose trigger is live. A jump
      // (like the Pricing link) can fire toggles out of order, so the order
      // the toggles arrive in can't be trusted.
      const chapterTriggers: ScrollTrigger[] = [];
      const syncChapter = () => {
        let chapter = -1;
        chapterTriggers.forEach((t, i) => {
          if (t.isActive) chapter = i;
        });
        if (chapter >= 0) setStory({ chapter });
      };
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section) => {
        chapterTriggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: syncChapter,
            onUpdate: (self) => setStory({ progress: self.progress }),
          }),
        );
      });

      if (reduced) return;

      // The hero copy drifts up and fades as the story begins.
      gsap.to("[data-hero]", {
        y: -60,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#arrival", start: "top top", end: "bottom 30%", scrub: true },
      });
    });

    return () => {
      ctx.revert();
      setStory({ active: false, chapter: 0, progress: 0 });
    };
  }, []);

  // Heading, list and block reveals. Created after the triggers above so
  // their trigger points account for its scroll length.
  useReveals();

  return null;
}
