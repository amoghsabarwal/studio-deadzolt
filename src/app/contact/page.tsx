import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <section className="section page-top contact">
      <h1>Let&apos;s make something people remember.</h1>
      <p className="lede">
        Tell us about the brand, the idea and the timeline. We reply to every message.
      </p>
      <a className="button contact-email" href={`mailto:${site.email}`}>
        {site.email}
      </a>
    </section>
  );
}
