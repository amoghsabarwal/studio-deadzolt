import type { MetadataRoute } from "next";
import { projects, site } from "@/content/site";

// Every public page, for Google. Case studies follow the project list.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/works`, changeFrequency: "monthly", priority: 0.7 },
    ...projects.map((p) => ({
      url: `${site.url}/works/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
