import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { disciplines, projects, site } from "@/content/site";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>{site.tagline}</h1>
        <p className="lede">{site.intro}</p>
        <Link href="/work" className="button">
          See the work
        </Link>
      </section>

      <section className="section">
        <h2 className="eyebrow">What we do</h2>
        <ul className="discipline-list">
          {disciplines.map((d) => (
            <li key={d.slug}>
              <h3>{d.name}</h3>
              <p className="muted">{d.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="eyebrow">Selected work</h2>
          <Link href="/work">All projects</Link>
        </div>
        <div className="project-grid">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>
    </>
  );
}
