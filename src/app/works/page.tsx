import type { Metadata } from "next";
import Link from "next/link";
import { disciplineNames, projects } from "@/content/site";

export const metadata: Metadata = {
  title: "Works",
  description: "3D experiences, motion direction, branding and art direction by Studio Deadzolt.",
};

export default function WorksPage() {
  return (
    <section className="page">
      <header className="page-head">
        <p className="label">Index of works · {projects.length}</p>
        <h1 className="display page-title">Works</h1>
      </header>
      <ol className="works-list">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/works/${p.slug}`} className="works-row">
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
