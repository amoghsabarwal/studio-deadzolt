import Link from "next/link";
import { getDiscipline, type Project } from "@/content/site";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="project-card">
      <div
        className="project-thumb"
        style={{ "--accent": project.accent } as React.CSSProperties}
        aria-hidden="true"
      />
      <div className="project-card-body">
        <h3>{project.title}</h3>
        <p className="muted">
          {project.disciplines.map((d) => getDiscipline(d)?.name).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
