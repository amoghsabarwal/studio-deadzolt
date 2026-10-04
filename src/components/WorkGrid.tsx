"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { disciplines, projects } from "@/content/site";

export default function WorkGrid() {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? projects.filter((p) => p.disciplines.includes(filter)) : projects;

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by discipline">
        <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
          All
        </button>
        {disciplines.map((d) => (
          <button
            key={d.slug}
            type="button"
            aria-pressed={filter === d.slug}
            onClick={() => setFilter(d.slug)}
          >
            {d.name}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {shown.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}
