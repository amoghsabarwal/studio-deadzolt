import Link from "next/link";
import { site } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-cta">
        Have something in mind? <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <p className="footer-meta">
        © 2000—forever {site.name}. {site.location}. <Link href="/contact">Start a project</Link>
      </p>
    </footer>
  );
}
