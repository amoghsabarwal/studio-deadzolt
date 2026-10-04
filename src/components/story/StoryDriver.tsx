"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { getReducedMotion, setStory } from "@/lib/story";
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
// the 3D star and chapter nav), the pinned sideways disciplines track, and the
// text reveals.
export default function StoryDriver() {
  useEffect(() => {
    setStory({ active: true, chapter: 0, progress: 0 });
    const reduced = getReducedMotion();
    const wide = window.matchMedia("(min-width: 761px)").matches;

    let introTimeout = 0;
    const ctx = gsap.context(() => {
      // Intro: a counter runs to 100, the curtain lifts, the headline rises.
      const intro = document.querySelector<HTMLElement>("[data-intro]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hero] > *");
      if (intro) {
        if (reduced || introAlreadySeen()) {
          intro.style.display = "none";
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
            .to(lines, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08 }, "-=0.5")
            .to(".site-header", { autoAlpha: 1, duration: 0.8 }, "<")
            .set(intro, { display: "none" });
          // On a very slow device the timeline crawls, so never hold the page
          // behind the curtain for more than a few seconds.
          introTimeout = window.setTimeout(() => {
            if (tl.progress() < 1) tl.progress(1);
          }, 6000);
        }
      }

      // Sideways track for the disciplines on wide screens.
      let track: gsap.core.Tween | undefined;
      const trackEl = document.querySelector<HTMLElement>("[data-track]");
      const trackWrap = document.querySelector<HTMLElement>("[data-disciplines]");
      if (trackEl && trackWrap && wide && !reduced) {
        trackWrap.classList.add("is-sideways");
        const distance = () => trackEl.scrollWidth - window.innerWidth;
        track = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: "[data-disciplines]",
            pin: true,
            scrub: 0.8,
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });
      }

      // The active chapter is the furthest one whose trigger is live. The last
      // sideways panel stays "live" once the track finishes, and a jump (like
      // the Pricing link) can fire toggles out of order, so the order the
      // toggles arrive in can't be trusted.
      const chapterTriggers: ScrollTrigger[] = [];
      const syncChapter = () => {
        let chapter = -1;
        chapterTriggers.forEach((t, i) => {
          if (t.isActive) chapter = i;
        });
        if (chapter >= 0) setStory({ chapter });
      };
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section) => {
        const sideways = track && section.hasAttribute("data-panel");
        chapterTriggers.push(
          ScrollTrigger.create({
            trigger: section,
            ...(sideways
              ? { containerAnimation: track, start: "left 55%", end: "right 55%" }
              : { start: "top 55%", end: "bottom 55%" }),
            onToggle: syncChapter,
            onUpdate: (self) => setStory({ progress: self.progress }),
          }),
        );
      });

      if (reduced) return;

      // Panel copy slides in as each discipline arrives.
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
        const body = panel.querySelector(".panel-body");
        if (track) {
          gsap.from(body, {
            x: 80,
            opacity: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: panel, containerAnimation: track, start: "left 90%", end: "left 40%", scrub: true },
          });
        } else {
          gsap.from(body, {
            y: 40,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 80%" },
          });
        }
      });

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
      document.querySelector("[data-disciplines]")?.classList.remove("is-sideways");
      setStory({ active: false, chapter: 0, progress: 0 });
    };
  }, []);

  // Heading, list and block reveals. Created after the pinned track above so
  // their trigger points account for its scroll length.
  useReveals();

  return null;
}
