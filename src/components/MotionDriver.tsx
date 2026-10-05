"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { EASE } from "@/lib/motion/tokens";
import { getReducedMotion } from "@/lib/story";

// Site-wide pointer motion:
// - starlight hairlines: [data-hairline] edges light up near the pointer,
// - [data-parallax] blocks get --mx/--my (-1 to 1) for a slight lean,
// - the monthly plan's flywheel: its starfield drifts, spins up on hover over
//   1.6 s and coasts back down over 3 s.
// Both are for mice only, and the flywheel only runs while it's on screen.
const REACH = 150;

export default function MotionDriver() {
  const pathname = usePathname();

  // Looping CSS animations (the call card stamp, the availability ping) hold
  // still while they're off screen, on every device.
  useEffect(() => {
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => e.target.toggleAttribute("data-offscreen", !e.isIntersecting)),
    );
    document.querySelectorAll(".call-badge, .availability").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (getReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let px = -1e4;
    let py = -1e4;
    const lit = new WeakSet<HTMLElement>();
    const paint = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const mx = gsap.utils.clamp(-1, 1, (px - (r.left + r.width / 2)) / (r.width / 2));
        const my = gsap.utils.clamp(-1, 1, (py - (r.top + r.height / 2)) / (r.height / 2));
        el.style.setProperty("--mx", mx.toFixed(3));
        el.style.setProperty("--my", my.toFixed(3));
      });
      document.querySelectorAll<HTMLElement>("[data-hairline]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const near = Math.hypot(dx, dy) < REACH;
        if (near) {
          el.style.setProperty("--hx", `${px - r.left}px`);
          el.style.setProperty("--hy", `${py - r.top}px`);
          if (!lit.has(el)) {
            el.style.setProperty("--hon", "1");
            lit.add(el);
          }
        } else if (lit.has(el)) {
          el.style.setProperty("--hon", "0");
          lit.delete(el);
        }
      });
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    const wheel = document.querySelector<HTMLElement>(".flywheel");
    const card = wheel?.closest<HTMLElement>(".plan");
    if (!wheel || !card || getReducedMotion()) return;
    const state = { speed: 4, rot: 0 };
    let onScreen = false;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(card);
    const tick = (_: number, delta: number) => {
      if (!onScreen) return;
      state.rot = (state.rot + (state.speed * delta) / 1000) % 360;
      wheel.style.setProperty("--rot", `${state.rot}deg`);
    };
    gsap.ticker.add(tick);
    const enter = () => gsap.to(state, { speed: 160, duration: 1.6, ease: EASE.momentum, overwrite: true });
    const leave = () => gsap.to(state, { speed: 4, duration: 3, ease: "power2.out", overwrite: true });
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    return () => {
      io.disconnect();
      gsap.ticker.remove(tick);
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
    };
  }, [pathname]);

  return null;
}
