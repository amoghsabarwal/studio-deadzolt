"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getCursorLabel, setDomCursorLabel, subscribeCursor } from "@/lib/cursor";
import { clearHoverFocus, setHoverFocus } from "@/lib/focus";

// A two-part cursor for mouse users: a dot that tracks exactly and a ring
// that trails it, grows over links and shows hints like "drag" on the star or
// "view" on a work. It also drives the other pointer effects: the 3D preview
// beside a hovered work row and the light that follows the pointer on cards.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useSyncExternalStore(subscribeCursor, getCursorLabel, () => "");

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let frame = 0;

    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const el = e.target as HTMLElement | null;
      ring.current?.classList.toggle("is-link", Boolean(el?.closest("a, button")));
      setDomCursorLabel(el?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "");

      const focus = el?.closest<HTMLElement>("[data-focus]")?.dataset.focus;
      if (focus) setHoverFocus(focus);
      else clearHoverFocus();

      const card = el?.closest<HTMLElement>("[data-spotlight]");
      if (card) {
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - box.left}px`);
        card.style.setProperty("--my", `${e.clientY - box.top}px`);
      }
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      frame = requestAnimationFrame(loop);
    };
    const leave = () => {
      document.documentElement.classList.add("cursor-hidden");
      clearHoverFocus();
    };
    const enter = () => document.documentElement.classList.remove("cursor-hidden");

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className={`cursor-ring${label ? " has-label" : ""}`}>
        <span>{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
