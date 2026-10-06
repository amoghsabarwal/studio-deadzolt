"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getEntered, getReducedMotion, setStory, subscribeEntry } from "@/lib/story";
import { holoScramble } from "@/lib/motion/holo";
import { wipeFill } from "@/lib/motion/text";
import { DUR, EASE, RISE, SCRUB, replay } from "@/lib/motion/tokens";
import { useReveals } from "../Reveals";
import { inOwnTask } from "@/lib/task";

gsap.registerPlugin(ScrollTrigger);

// Wires the home page to the scroll: which chapter is in view (for
// the 3D star), and the text reveals.
export default function StoryDriver() {
  useEffect(() => inOwnTask(() => {
    setStory({ active: true, chapter: 0, progress: 0 });
    const reduced = getReducedMotion();

    let stopWaiting: (() => void) | undefined;
    const ctx = gsap.context(() => {
      // The hero arrives in about 1.2 s once the visitor is in: the copy
      // rises, the subline and the Book button follow, the headline scans in
      // and "scroll past." fills. Visitors who skipped the entry screen saw
      // the copy at first paint, so for them only the headline animates.
      const title = document.querySelector<HTMLElement>("[data-hero-title]");
      const skipped = Boolean(document.documentElement.dataset.entered);
      const heroIn = () => {
        if (!title) return;
        if (!skipped) {
          gsap.from("[data-hero] .eyebrow, [data-hero-title]", {
            y: 12,
            opacity: 0,
            filter: "blur(12px)",
            duration: DUR.slow,
            ease: EASE.momentum,
            clearProps: "filter",
          });
          gsap.from("[data-hero] .hero-sub", { y: 20, opacity: 0, duration: DUR.base, ease: EASE.content, delay: 0.3 });
          gsap.from("[data-hero] .actions, [data-hero] .cta-note", {
            y: 16,
            opacity: 0,
            duration: DUR.base,
            ease: EASE.content,
            delay: 0.45,
          });
        }
        holoScramble(title, { speed: 2.4 });
        wipeFill(title, { delay: 0.6 });
      };
      if (!reduced) {
        if (getEntered()) heroIn();
        else
          stopWaiting = subscribeEntry(() => {
            if (!getEntered()) return;
            stopWaiting?.();
            ctx.add(heroIn);
          });
      }

      // Plans: the name scans, the inclusions rise one by one, the price
      // scans in last.
      if (!reduced)
        gsap.utils.toArray<HTMLElement>("[data-drumroll]").forEach((card) => {
          const name = card.querySelector<HTMLElement>(".plan-name");
          const price = card.querySelector<HTMLElement>(".plan-price");
          const items = card.querySelectorAll(".plan-list li");
          const tl = gsap.timeline({ scrollTrigger: replay(card, "top 85%") });
          if (name) tl.add(holoScramble(name, { speed: 1.6 }), 0);
          tl.from(items, { y: 16, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.07 }, 0.2);
          if (price) tl.add(holoScramble(price, { speed: 1.6 }), 0.2 + items.length * 0.07 + 0.5);
        });

      // The monthly plan's steps: the mock cards rise with the scroll and
      // light up underneath once they land, and lean a little with the mouse.
      const steps = document.querySelector<HTMLElement>(".steps");
      if (steps && !reduced) {
        gsap.from(steps.querySelectorAll(".step-card"), {
          y: RISE.visual,
          opacity: 0,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: steps,
            start: "top 80%",
            end: "top 50%",
            scrub: SCRUB,
            onUpdate: (self) => steps.toggleAttribute("data-lit", self.progress > 0.95),
          },
        });
      }

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
      stopWaiting?.();
      ctx.revert();
      setStory({ active: false, chapter: 0, progress: 0 });
    };
  }), []);

  // Heading, list and block reveals. Created after the triggers above so
  // their trigger points account for its scroll length.
  useReveals();

  return null;
}
