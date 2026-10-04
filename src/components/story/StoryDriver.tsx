"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getReducedMotion, setStory } from "@/lib/story";
import { revealLines, wipeFill } from "@/lib/motion/text";
import { useReveals } from "../Reveals";

gsap.registerPlugin(ScrollTrigger);

const INTRO_SEEN = "deadzolt:intro-seen";

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_SEEN) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN, "1");
  } catch {
    // Storage can be blocked; the intro simply plays again.
  }
}

// Wires the home page to the scroll: the intro, which chapter is in view (for
// the 3D star), and the text reveals.
export default function StoryDriver() {
  useEffect(() => {
    setStory({ active: true, chapter: 0, progress: 0 });
    const reduced = getReducedMotion();

    let introTimeout = 0;
    let titleSplit: { revert: () => void } | undefined;
    const title = document.querySelector<HTMLElement>("[data-hero-title]");
    // The headline rises line by line, then "remember." fills in.
    const revealTitle = (delay: number) => {
      if (!title || titleSplit) return;
      titleSplit = revealLines(title, { delay });
      title.style.visibility = "visible";
      wipeFill(title, { delay: delay + 0.6 });
    };

    const ctx = gsap.context(() => {
      // Intro: a counter runs to 100, the curtain lifts, the headline rises.
      const intro = document.querySelector<HTMLElement>("[data-intro]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hero] > *:not([data-hero-title])");
      if (reduced) {
        if (title) title.style.visibility = "visible";
      }
      if (intro) {
        if (reduced || introAlreadySeen()) {
          intro.style.display = "none";
          if (!reduced) revealTitle(0.1);
        } else {
          markIntroSeen();
          const counter = { value: 0 };
          const label = intro.querySelector("[data-intro-count]");
          const tl = gsap
            .timeline()
            .set(lines, { y: 40, opacity: 0 })
            .set(".site-header", { autoAlpha: 0 })
            .to(counter, {
              value: 100,
              duration: 1.4,
              ease: "power2.inOut",
              onUpdate: () => {
                if (label) label.textContent = String(Math.round(counter.value)).padStart(3, "0");
              },
            })
            .to(intro, { yPercent: -100, duration: 1.1, ease: "expo.inOut" })
            .add(() => revealTitle(0), "-=0.55")
            .to(lines, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08 }, "-=0.5")
            .to(".site-header", { autoAlpha: 1, duration: 0.8 }, "<")
            .set(intro, { display: "none" });
          // On a very slow device the timeline crawls, so never hold the page
          // behind the curtain for more than a few seconds.
          introTimeout = window.setTimeout(() => {
            if (tl.progress() < 1) tl.progress(1);
            revealTitle(0);
          }, 6000);
        }
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
      window.clearTimeout(introTimeout);
      ctx.revert();
      titleSplit?.revert();
      setStory({ active: false, chapter: 0, progress: 0 });
    };
  }, []);

  // Heading, list and block reveals. Created after the triggers above so
  // their trigger points account for its scroll length.
  useReveals();

  return null;
}
