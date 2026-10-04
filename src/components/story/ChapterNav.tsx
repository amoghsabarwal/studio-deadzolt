"use client";

import { useSyncExternalStore } from "react";
import { chapters } from "@/content/site";
import { getStory, subscribeStory } from "@/lib/story";

export default function ChapterNav() {
  const chapter = useSyncExternalStore(
    subscribeStory,
    () => getStory().chapter,
    () => 0,
  );

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      <ol>
        {chapters.map((c, i) => (
          <li key={c.id}>
            <a href={`#${c.id}`} aria-current={i === chapter ? "step" : undefined}>
              <span className="chapter-num">{String(i).padStart(2, "0")}</span>
              <span className="chapter-label">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
