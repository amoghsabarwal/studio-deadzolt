"use client";

import { useEffect } from "react";
import { getReducedMotion } from "@/lib/story";
import { getTilt, needsMotionPermission, setTilt, startGyro } from "@/lib/tilt";

type Card = {
  el: HTMLElement;
  visible: boolean;
  hover: boolean;
  local: { x: number; y: number };
  // Current, smoothed values.
  cur: { rx: number; ry: number; mx: number; my: number; on: number };
};

const MAX_X = 9; // degrees of tilt around the vertical axis
const MAX_Y = 7; // and around the horizontal axis

// Drives the holographic cards ([data-holo]) and the shared tilt input.
// Each visible card gets CSS variables every frame: --rx/--ry (tilt, deg),
// --mx/--my (where the light hits, %), --hyp (0 at rest, 1 at full tilt) and
// --on (how lit the foil is). The mouse drives a card while hovering it; on
// phones the gyroscope drives every card at once, and before the gyroscope is
// on the cards catch the light as they scroll.
export default function HoloDriver() {
  useEffect(() => {
    if (getReducedMotion()) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && !needsMotionPermission()) startGyro();

    const cards = new Map<HTMLElement, Card>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = cards.get(entry.target as HTMLElement);
        if (card) card.visible = entry.isIntersecting;
      });
    });

    const collect = () => {
      document.querySelectorAll<HTMLElement>("[data-holo]").forEach((el) => {
        if (cards.has(el)) return;
        cards.set(el, {
          el,
          visible: false,
          hover: false,
          local: { x: 0.5, y: 0.5 },
          cur: { rx: 0, ry: 0, mx: 50, my: 50, on: 0 },
        });
        observer.observe(el);
      });
      cards.forEach((card, el) => {
        if (!el.isConnected) {
          observer.unobserve(el);
          cards.delete(el);
        }
      });
    };
    collect();
    // Cards come and go as pages change.
    const mutations = new MutationObserver(collect);
    mutations.observe(document.body, { childList: true, subtree: true });

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setTilt((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1, "pointer");
      const over = (e.target as Element | null)?.closest<HTMLElement>("[data-holo]");
      cards.forEach((card) => {
        card.hover = card.el === over;
        if (card.hover) {
          const box = card.el.getBoundingClientRect();
          card.local.x = (e.clientX - box.left) / box.width;
          card.local.y = (e.clientY - box.top) / box.height;
        }
      });
    };
    const leave = () => cards.forEach((card) => (card.hover = false));
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = 1 - Math.exp(-8 * dt);
      const tilt = getTilt();
      cards.forEach((card) => {
        if (!card.visible) return;
        let x = 0;
        let y = 0;
        let on = 0;
        if (card.hover) {
          x = card.local.x * 2 - 1;
          y = card.local.y * 2 - 1;
          on = 1;
        } else if (tilt.source === "gyro") {
          x = tilt.x;
          y = tilt.y;
          on = 1;
        } else if (coarse) {
          // No gyroscope yet: the foil catches the light as the card scrolls.
          const box = card.el.getBoundingClientRect();
          const p = (box.top + box.height / 2) / window.innerHeight; // 0 top, 1 bottom
          x = Math.sin(p * Math.PI * 2) * 0.6;
          y = (p - 0.5) * 1.4;
          on = 0.7;
        }
        const c = card.cur;
        c.ry += (x * MAX_X - c.ry) * k;
        c.rx += (-y * MAX_Y - c.rx) * k;
        c.mx += ((0.5 + x * 0.5) * 100 - c.mx) * k;
        c.my += ((0.5 + y * 0.5) * 100 - c.my) * k;
        c.on += (on - c.on) * k;
        const s = card.el.style;
        s.setProperty("--rx", `${c.rx.toFixed(2)}deg`);
        s.setProperty("--ry", `${c.ry.toFixed(2)}deg`);
        s.setProperty("--mx", `${c.mx.toFixed(1)}%`);
        s.setProperty("--my", `${c.my.toFixed(1)}%`);
        s.setProperty("--hyp", Math.min(Math.hypot(c.ry / MAX_X, c.rx / MAX_Y), 1).toFixed(3));
        s.setProperty("--on", c.on.toFixed(3));
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return null;
}
