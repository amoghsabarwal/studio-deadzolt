"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { withMotion } from "@/lib/motion/load";
import { getEntered, getReducedMotion, subscribeEntry } from "@/lib/story";

// Smooth, weighted scrolling that GSAP's ScrollTrigger stays in sync with.
// Skipped entirely when the visitor prefers reduced motion. Until the motion
// library arrives (just after the first paint) the page scrolls natively.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => withMotion(({ gsap, ScrollTrigger, Lenis }) => {
    if (getReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Still while the entry screen is up.
    if (!getEntered()) lenis.stop();
    const unsubscribe = subscribeEntry(() => {
      if (getEntered()) lenis.start();
    });
    return () => {
      unsubscribe();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }), []);

  // A new page starts at the top, or at its #section when the link named one
  // (like Pricing from the works page). The jump waits a frame so the page's
  // own scroll effects (pinned sections) are in place first.
  useEffect(() => {
    window.scrollTo(0, 0);
    let frame = 0;
    const stop = withMotion(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      frame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        document.getElementById(id)?.scrollIntoView();
      });
    });
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
