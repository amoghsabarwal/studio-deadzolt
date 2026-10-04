"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getReducedMotion } from "@/lib/story";

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
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
