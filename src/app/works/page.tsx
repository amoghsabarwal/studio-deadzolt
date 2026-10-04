import type { Metadata } from "next";
import Reveals from "@/components/Reveals";
import WorksIndex from "@/components/WorksIndex";
import { disciplineNames, disciplines, projects } from "@/content/site";

export const metadata: Metadata = {
  title: "Works",
  description: "3D experiences, motion direction, branding and art direction by Studio Deadzolt.",
};

// Hovering a row brings that work's discipline piece in beside the list;
// the chips filter by discipline.
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
      <WorksIndex projects={projects.map((p) => ({ ...p, tags: disciplineNames(p) }))} disciplines={disciplines} />
    </section>
  );
}
