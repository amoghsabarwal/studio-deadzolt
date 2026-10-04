import BookButton from "@/components/BookButton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CaseFocus from "@/components/CaseFocus";
import HoloLayers from "@/components/HoloLayers";
import Reveals from "@/components/Reveals";
import { disciplineNames, getDiscipline, getProject, projects, site } from "@/content/site";

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

// A case study: the title beside the work's discipline piece in 3D, the
// facts, the story, a way to start a similar project, and the next work.
export default async function CaseStudyPage({ params }: PageProps<"/works/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const number = (n: number) => String(n).padStart(2, "0");

  return (
    <article className="page case">
      <CaseFocus discipline={project.disciplines[0]} />
      <Reveals />

      <header className="case-hero">
        <Link href="/works" className="label back-link" data-enter>
          ← All works
        </Link>
        <p className="label" data-enter>
          Case study · {number(index + 1)} / {number(projects.length)}
        </p>
        <h1 className="display case-title" data-split>
          {project.title}
        </h1>
        <p className="case-summary" data-enter>
          {project.summary}
        </p>
      </header>

      <dl className="case-meta" data-stagger>
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
          <dd>Studio Deadzolt, Indore</dd>
        </div>
      </dl>

      <section className="case-section" data-reveal>
        <p className="label" data-scramble>Overview</p>
        <p className="case-text">{project.body}</p>
      </section>

      <section className="case-section" data-reveal>
        <p className="label" data-scramble>Practice</p>
        <ul className="case-disciplines">
          {project.disciplines.map((slug) => {
            const discipline = getDiscipline(slug);
            return (
              <li key={slug}>
                <h2>{discipline.name}</h2>
                <p>{discipline.line}</p>
                <Link href={`/#${slug}`} className="text-link">
                  More {discipline.name.toLowerCase()} <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="case-cta" data-holo data-reveal>
        <HoloLayers />
        <div>
          <p className="label" data-scramble>Work with the studio</p>
          <h2 className="section-title">Want something like this?</h2>
          <p className="section-sub">
            {site.ctaNote}
          </p>
        </div>
        <div className="actions">
          <BookButton from="case" />
          <Link href="/#pricing" className="button">
            See pricing
          </Link>
        </div>
      </section>

      <Link href={`/works/${next.slug}`} className="case-next" data-cursor="Next">
        <span className="label">
          Next work · {number(((index + 1) % projects.length) + 1)}
        </span>
        <span className="display case-next-title">
          {next.title} <span aria-hidden="true">→</span>
        </span>
        <span className="label">{disciplineNames(next)}</span>
      </Link>
    </article>
  );
}
