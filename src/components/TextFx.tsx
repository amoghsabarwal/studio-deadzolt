"use client";

import { useEffect } from "react";
import { holoScramble } from "@/lib/motion/holo";
import { getReducedMotion } from "@/lib/story";
import { inOwnTask } from "@/lib/task";

// Hover scrambles for links and the booking buttons: the words scan again
// each time the pointer arrives.
export default function TextFx() {
  useEffect(() => inOwnTask(() => {
    if (getReducedMotion()) return;
    const busy = new WeakSet<HTMLElement>();
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-scramble-hover], a.button[data-book]");
      if (!link || link.contains(e.relatedTarget as Node | null)) return;
      if (busy.has(link)) return;
      busy.add(link);
      // The primary button's light fill would hide the foil bar.
      const bar = !link.classList.contains("button-primary");
      holoScramble(link, { speed: 2, bar }).then(() => busy.delete(link));
    };
    document.addEventListener("pointerover", over);
    return () => document.removeEventListener("pointerover", over);
  }), []);
  return null;
}
