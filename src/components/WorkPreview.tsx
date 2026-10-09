"use client";

import { useEffect, useRef, useState } from "react";
import { workCover } from "@/content/media";

type Props = { works: { slug: string; title: string }[] };

// A small viewfinder of the hovered work that rides beside a list of works
// (mouse only). It opens like a shutter, each new work wipes in from the
// direction the pointer travelled, the counter rolls to the work's number and
// the card leans into fast moves. Everything runs on transforms and
// clip-paths set straight on the elements, so hovering never re-renders.
// The covers are small fixed files fetched once the page is idle, or the
// moment the pointer reaches the list, whichever comes first.
export default function WorkPreview({ works }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = root.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = Array.from(el.querySelectorAll<HTMLElement>(".wp-layer"));
    const digits = el.querySelector<HTMLElement>(".wp-digits");
    const name = el.querySelector<HTMLElement>(".wp-name");
    const index = new Map(works.map((w, i) => [w.slug, i]));

    // Fetch the covers once the page has settled.
    let idle = 0;
    const warm = () => setLoad(true);
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const onLoad = () => (idle = ric(warm, { timeout: 4000 }) as number);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let tilt = 0;
    let frame = 0;
    let current = -1;
    let depth = 1;

    const place = () => {
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${tilt}deg)`;
    };
    const loop = () => {
      const dy = (target.y - pos.y) * 0.16;
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += dy;
      // The card leans with its speed, then settles upright.
      tilt += ((still ? 0 : Math.max(-6, Math.min(6, -dy * 0.35))) - tilt) * 0.2;
      place();
      const moving = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) + Math.abs(tilt) > 0.3;
      frame = moving ? requestAnimationFrame(loop) : 0;
    };

    const show = (next: number) => {
      const from = current;
      current = next;
      if (digits) digits.style.transform = `translateY(${-next}em)`;
      if (name) name.textContent = works[next].title;
      const layer = layers[next];
      if (!layer || from === next) return;
      // Down the list the new work rises from below; up the list it drops in.
      const start = from === -1 ? "inset(0 0 0 0)" : next > from ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
      layer.style.transition = "none";
      layer.style.clipPath = start;
      layer.style.setProperty("--zoom", from === -1 || still ? "1" : "1.18");
      layer.style.zIndex = String(++depth);
      void layer.offsetWidth;
      layer.style.transition = "";
      layer.style.clipPath = "inset(0 0 0 0)";
      layer.style.setProperty("--zoom", "1");
    };

    const move = (e: PointerEvent) => {
      const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cover]");
      const slug = row?.dataset.cover;
      const next = slug ? index.get(slug) ?? -1 : -1;
      if (next === -1) {
        if (current !== -1) {
          current = -1;
          el.removeAttribute("data-on");
        }
        return;
      }
      setLoad(true);
      // The card rides beside the list: under the section's heading where the
      // list leaves that column free (the home page), else in the space to the
      // list's left or right.
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const list = row!.closest("ol")!.getBoundingClientRect();
      const head = row!.closest("section")?.querySelector(".section-head")?.getBoundingClientRect();
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
      if (current === -1) {
        pos.x = target.x;
        pos.y = target.y;
        tilt = 0;
        place();
        el.setAttribute("data-on", "");
      }
      if (next !== current) show(next);
      if (!frame) frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("load", onLoad);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
      cancelAnimationFrame(frame);
    };
  }, [works]);

  return (
    <div ref={root} className="wp" aria-hidden="true">
      <div className="wp-frame">
        {works.map((w) => (
          <div key={w.slug} className="wp-layer">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed small files, no optimiser round trip */}
            {load && <img src={workCover(w.slug)} alt="" width={440} height={550} decoding="async" />}
          </div>
        ))}
      </div>
      <p className="wp-label label">
        <span className="wp-count">
          <span className="wp-digits">
            {works.map((_, i) => (
              <span key={i}>{String(i + 1).padStart(2, "0")}</span>
            ))}
          </span>
        </span>
        <span className="wp-name" />
      </p>
    </div>
  );
}
