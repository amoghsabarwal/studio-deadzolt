import { site } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2000—forever {site.name}</span>
      <span>{site.location}</span>
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </footer>
  );
}
