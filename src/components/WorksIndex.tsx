"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { Discipline, Project } from "@/content/site";
import { getReducedMotion } from "@/lib/story";

gsap.registerPlugin(Flip);

type Props = {
  projects: (Project & { tags: string })[];
  disciplines: Discipline[];
};

// The works index with discipline filters. Changing the filter reflows the
// list with Flip: rows that stay glide to their new place, the rest fade.
export default function WorksIndex({ projects, disciplines }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const list = useRef<HTMLOListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const choose = (next: string) => {
    if (next === filter) return;
    if (list.current && !getReducedMotion()) {
      flipState.current = Flip.getState(list.current.querySelectorAll("li"));
    }
    setFilter(next);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.7,
      ease: "expo.out",
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
    });
  }, [filter]);

  const chips = [
    { slug: "all", name: "All", count: projects.length },
    ...disciplines.map((d) => ({
      slug: d.slug as string,
      name: d.name,
      count: projects.filter((p) => p.disciplines.includes(d.slug)).length,
    })),
  ];

  return (
    <>
      <div className="works-filters" role="group" aria-label="Filter by discipline" data-enter>
        {chips.map((chip) => (
          <button
            key={chip.slug}
            type="button"
            className="chip"
            aria-pressed={filter === chip.slug}
            onClick={() => choose(chip.slug)}
          >
            {chip.name} <span className="chip-count">{chip.count}</span>
          </button>
        ))}
      </div>
      <ol ref={list} className="works-list" data-stagger>
        {projects.map((p, i) => {
          const shown = filter === "all" || p.disciplines.some((d) => d === filter);
          return (
            <li key={p.slug} hidden={!shown} data-flip-id={p.slug}>
              <Link href={`/works/${p.slug}`} className="works-row" data-focus={p.disciplines[0]} data-cursor="View">
                <span className="label works-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="works-title">{p.title}</span>
                <span className="label works-tags">{p.tags}</span>
                <span className="label works-date">{p.date}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
