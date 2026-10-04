import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiscipline, getProject, projects } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="case-study page-top">
      <header className="case-head">
        <p className="eyebrow">
          {project.client} · {project.year}
        </p>
        <h1>{project.title}</h1>
        <p className="lede">{project.summary}</p>
        <p className="muted">
          {project.disciplines.map((d) => getDiscipline(d)?.name).join(" · ")}
        </p>
      </header>

      <div
        className="case-hero"
        style={{ "--accent": project.accent } as React.CSSProperties}
        aria-hidden="true"
      />

      <section className="case-body">
        <div>
          <h2>The challenge</h2>
          <p>{project.challenge}</p>
        </div>
        <div>
          <h2>Our approach</h2>
          <p>{project.approach}</p>
        </div>
        <div>
          <h2>The outcome</h2>
          <p>{project.outcome}</p>
        </div>
      </section>

      <nav className="case-next" aria-label="Next project">
        <span className="eyebrow">Next project</span>
        <Link href={`/work/${next.slug}`}>{next.title}</Link>
      </nav>
    </article>
  );
}
