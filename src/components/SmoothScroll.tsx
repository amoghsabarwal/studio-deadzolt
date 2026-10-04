"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getEntered, getReducedMotion, subscribeEntry } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

// Smooth, weighted scrolling that GSAP's ScrollTrigger stays in sync with.
// Skipped entirely when the visitor prefers reduced motion.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
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
  }, []);

  // A new page starts at the top, or at its #section when the link named one
  // (like Pricing from the works page). The jump waits a frame so the page's
  // own scroll effects (pinned sections) are in place first.
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      document.getElementById(id)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
