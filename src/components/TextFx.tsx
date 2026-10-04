"use client";

import gsap from "gsap";
import { useEffect } from "react";
import { scramble } from "@/lib/motion/text";
import { getReducedMotion } from "@/lib/story";

// Hover scrambles for the header and footer links: the word decodes again
// each time the pointer arrives.
export default function TextFx() {
  useEffect(() => {
    if (getReducedMotion()) return;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-scramble-hover]");
      if (!link || link.contains(e.relatedTarget as Node | null)) return;
      if (gsap.isTweening(link)) return;
      scramble(link);
    };
    document.addEventListener("pointerover", over);
    return () => document.removeEventListener("pointerover", over);
  }, []);
  return null;
}
