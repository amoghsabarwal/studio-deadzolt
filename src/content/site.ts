// Placeholder content until the real projects and copy arrive from the studio.
// Every page reads from here, so swapping in real content is a one-file change.

export const site = {
  name: "Studio Deadzolt",
  shortName: "Deadzolt",
  tagline: "Building brands that people remember.",
  intro:
    "A Y2K-born design and development studio for electric, chrome-finished web, visuals and objects. We build 3D worlds, motion, identities and the art direction that ties them together.",
  location: "Serving the world from Indore, M.P.",
  email: "hello@deadzolt.studio",
  url: "https://deadzolt.studio",
};

export type Discipline = {
  slug: string;
  name: string;
  summary: string;
};

export const disciplines: Discipline[] = [
  {
    slug: "3d-experience",
    name: "3D Experience",
    summary: "Real-time worlds for the web, built to be explored rather than scrolled past.",
  },
  {
    slug: "motion-direction",
    name: "Motion Direction",
    summary: "Motion systems and films that give a brand its rhythm.",
  },
  {
    slug: "branding",
    name: "Branding",
    summary: "Identities with a point of view, from naming to the last pixel.",
  },
  {
    slug: "art-direction",
    name: "Art Direction",
    summary: "One visual voice across every campaign, shoot and screen.",
  },
];

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  disciplines: Discipline["slug"][];
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  // Hex colour used as the project's accent until real imagery is supplied.
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    client: "Client name",
    year: 2026,
    disciplines: ["3d-experience", "art-direction"],
    summary: "An interactive 3D launch site. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#c6ff3d",
  },
  {
    slug: "project-two",
    title: "Project Two",
    client: "Client name",
    year: 2026,
    disciplines: ["motion-direction"],
    summary: "A motion identity system. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#ff5c39",
  },
  {
    slug: "project-three",
    title: "Project Three",
    client: "Client name",
    year: 2025,
    disciplines: ["branding", "art-direction"],
    summary: "A rebrand from strategy to rollout. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#7b61ff",
  },
  {
    slug: "project-four",
    title: "Project Four",
    client: "Client name",
    year: 2025,
    disciplines: ["3d-experience", "motion-direction"],
    summary: "A product film rendered in 3D. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#38d9ff",
  },
  {
    slug: "project-five",
    title: "Project Five",
    client: "Client name",
    year: 2025,
    disciplines: ["branding"],
    summary: "A visual identity for a new venture. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#ffd23d",
  },
  {
    slug: "project-six",
    title: "Project Six",
    client: "Client name",
    year: 2024,
    disciplines: ["art-direction", "motion-direction"],
    summary: "A campaign shot and animated across channels. Placeholder copy.",
    challenge: "What the client needed and why it was hard. Placeholder copy.",
    approach: "How the studio tackled it. Placeholder copy.",
    outcome: "What changed for the client afterwards. Placeholder copy.",
    accent: "#ff3da8",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getDiscipline(slug: string) {
  return disciplines.find((d) => d.slug === slug);
}
