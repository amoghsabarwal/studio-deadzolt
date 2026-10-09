"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { workCover } from "@/content/media";

// A small card of the work that rides beside the pointer while a work row is
// hovered. The pictures load only once the pointer first reaches a list of
// works, so the page's first load carries none of them.
export default function WorkPreview() {
  const card = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let frame = 0;
    let current: string | null = null;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      if (card.current) card.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cover]");
      const next = row?.dataset.cover ?? null;
      if (row) setArmed(true);
      // The card rides up and down beside the list, in the free space to its
      // left where there is room (the home page), else to its right.
      const w = card.current?.offsetWidth ?? 220;
      const h = card.current?.offsetHeight ?? 275;
      // On the home page that space is the column under the section's
      // heading, so the card lines up with the heading and stays below it.
      const list = row?.closest("ol")?.getBoundingClientRect();
      const head = row?.closest("section")?.querySelector(".section-head")?.getBoundingClientRect();
      if (list) {
        let top = 96;
        if (head && list.left - head.left > w + 56) {
          target.x = head.left;
          top = head.bottom + 32;
        } else if (list.left - w - 56 > 24) {
          target.x = list.left - w - 56;
        } else {
          target.x = Math.min(list.right + 56, window.innerWidth - w - 24);
        }
        target.y = Math.max(Math.min(e.clientY - h / 2, window.innerHeight - h - 24), top);
      }
      if (next && !current) {
        pos.x = target.x;
        pos.y = target.y;
      }
      if (next !== current) {
        current = next;
        setSlug(next);
      }
      if (next && !frame) frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!armed) return null;
  return (
    <div ref={card} className="work-preview" data-on={slug ? "" : undefined} aria-hidden="true">
      {Object.entries(workCover).map(([key, src]) => (
        <Image
          key={key}
          src={src}
          alt=""
          width={560}
          height={700}
          sizes="280px"
          loading="eager"
          data-on={key === slug ? "" : undefined}
        />
      ))}
    </div>
  );
}
