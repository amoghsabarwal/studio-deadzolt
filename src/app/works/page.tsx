import type { Metadata } from "next";
import Link from "next/link";
import Reveals from "@/components/Reveals";
import { disciplineNames, projects } from "@/content/site";

export const metadata: Metadata = {
  title: "Works",
  description: "3D experiences, motion direction, branding and art direction by Studio Deadzolt.",
};

// Hovering a row brings that work's discipline piece in beside the list.
export default function WorksPage() {
  return (
    <section className="page works">
      <Reveals />
      <header className="page-head">
        <p className="label" data-enter>
          Index of works · {projects.length}
        </p>
        <h1 className="display page-title" data-split>
          Works
        </h1>
      </header>
      <ol className="works-list" data-stagger>
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/works/${p.slug}`} className="works-row" data-focus={p.disciplines[0]} data-cursor="View">
              <span className="label works-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="works-title">{p.title}</span>
              <span className="label works-tags">{disciplineNames(p)}</span>
              <span className="label works-date">{p.date}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
