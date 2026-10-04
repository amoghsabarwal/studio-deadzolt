import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { disciplineNames, getProject, projects } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/works/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="page case">
      <Link href="/works" className="label back-link">
        ← All works
      </Link>
      <h1 className="display case-title">{project.title}</h1>

      <dl className="case-meta">
        <div>
          <dt className="label">Discipline</dt>
          <dd>{disciplineNames(project)}</dd>
        </div>
        <div>
          <dt className="label">Date</dt>
          <dd>{project.date}</dd>
        </div>
        <div>
          <dt className="label">Studio</dt>
          <dd>Studio Deadzolt</dd>
        </div>
      </dl>

      <div className="case-body">
        <p className="case-summary">{project.summary}</p>
        <p>{project.body}</p>
      </div>

      <Link href={`/works/${next.slug}`} className="case-next">
        <span className="label">Next work</span>
        <span className="display case-next-title">{next.title}</span>
      </Link>
    </article>
  );
}
