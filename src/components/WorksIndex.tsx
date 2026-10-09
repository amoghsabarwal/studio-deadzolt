"use client";

import type { Flip } from "gsap/Flip";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import WorkPreview from "@/components/WorkPreview";
import { workCover } from "@/content/media";
import type { Discipline, Project } from "@/content/site";
import { loadMotion, type Motion } from "@/lib/motion/load";
import { getReducedMotion } from "@/lib/story";

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
  // Flip arrives with the rest of the motion library after the first paint;
  // a filter picked before then simply switches without the glide.
  const motion = useRef<Motion | null>(null);
  useEffect(() => {
    loadMotion().then((m) => (motion.current = m));
  }, []);

  const choose = (next: string) => {
    if (next === filter) return;
    if (list.current && motion.current && !getReducedMotion()) {
      flipState.current = motion.current.Flip.getState(list.current.querySelectorAll("li"));
    }
    setFilter(next);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    const m = motion.current;
    if (!state || !m) return;
    flipState.current = null;
    const { gsap, Flip } = m;
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
              <Link
                href={`/works/${p.slug}`}
                className="works-row"
                data-focus={p.disciplines[0]}
                data-cover={p.slug}
                data-cursor="View"
              >
                <Image className="work-thumb" src={workCover[p.slug]} alt="" width={96} height={120} sizes="48px" />
                <span className="label works-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="works-title">{p.title}</span>
                <span className="label works-tags">{p.tags}</span>
                <span className="label works-date">{p.date}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <WorkPreview />
    </>
  );
}
