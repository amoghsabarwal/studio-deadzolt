// All site copy lives here. Project text is taken from deadzolt.studio.

export const site = {
  name: "Studio Deadzolt",
  founder: "Amogh Sabarwal",
  tagline: "Building brands people remember.",
  email: "amoghsabarwal@gmail.com",
  url: "https://deadzolt.studio",
  location: "Indore, M.P.",
  description:
    "Studio Deadzolt is the design practice of Amogh Sabarwal: a designer obsessed with building brands that people remember.",
  manifesto:
    "A Y2K-born design studio for electric, chrome-finished web, visuals and objects. Identities, worlds, experiences, noise, desire, internet. 2000 to forever.",
  about: [
    "Hi, I'm Amogh, founder of Studio Deadzolt.",
    "I'm a brand designer who loves sitting with a problem until every piece falls into place, building identities that are original, intentional, and impossible to mistake for anything else.",
  ],
  // Where every "Book a consultation" button on the site goes: the studio's
  // Calendly page, which opens in a new tab.
  booking: "https://calendly.com/amoghsabarwal/30min",
  services: [
    "Creative direction",
    "Brand strategy",
    "Identity",
    "Digital design",
    "Motion",
    "Print and packaging",
    "Art direction",
    "Copywriting",
    "Tone of voice",
  ],
};

// Extra attributes for booking links: a web booking page opens in a new tab,
// an email link opens the mail app as usual.
export const bookingLink = {
  href: site.booking,
  ...(site.booking.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {}),
};

export type DisciplineSlug = "3d-experience" | "motion-direction" | "branding" | "art-direction";

export type Discipline = {
  slug: DisciplineSlug;
  name: string;
  line: string;
};

export const disciplines: Discipline[] = [
  {
    slug: "3d-experience",
    name: "3D Experience",
    line: "Products and worlds built from scratch, modelled, lit and rendered until they feel real enough to touch.",
  },
  {
    slug: "motion-direction",
    name: "Motion Direction",
    line: "Sound, hardware and systems turned into movement, timing and rhythm.",
  },
  {
    slug: "branding",
    name: "Branding",
    line: "Identities that are original, intentional and impossible to mistake for anything else.",
  },
  {
    slug: "art-direction",
    name: "Art Direction",
    line: "Self-initiated research into material, form and the visual language of music.",
  },
];

export type Project = {
  slug: string;
  title: string;
  date: string;
  year: number;
  disciplines: DisciplineSlug[];
  summary: string;
  body: string;
};

export const projects: Project[] = [
  {
    slug: "node-ecosystem",
    title: "Node Wireless Charging Ecosystem",
    date: "July 2026",
    year: 2026,
    disciplines: ["3d-experience"],
    summary:
      "A conceptual 3D product film exploring Daily Objects' NODE wireless ecosystem through a warm, tactile visual world.",
    body: "Built entirely from scratch in Cinema 4D and Octane, this project reimagines the NODE ecosystem within a carefully constructed domestic environment.",
  },
  {
    slug: "sound-studies",
    title: "Sound Studies",
    date: "Aug 2026",
    year: 2026,
    disciplines: ["art-direction"],
    summary:
      "A collection of self-initiated posters translating the music and visual identities of artists I listen to into graphic experiments.",
    body: "Sound Studies is an ongoing collection of personal poster work created around artists, albums, and tracks that have influenced my listening.",
  },
  {
    slug: "soft-structures",
    title: "Soft Structures",
    date: "Apr 2025",
    year: 2025,
    disciplines: ["art-direction"],
    summary:
      "A research-driven exploration of cloth simulation, using digital fabric to experiment with movement, form, and material behavior.",
    body: "This project began as an R&D study while learning and experimenting with cloth simulation in 3D.",
  },
  {
    slug: "frequency-fields",
    title: "Frequency Fields",
    date: "Feb 2025",
    year: 2025,
    disciplines: ["motion-direction"],
    summary:
      "A real-time audiovisual experiment transforming sound into fluid particle systems through TouchDesigner.",
    body: "Frequency Fields is an exploration of audio-reactive systems built in TouchDesigner, where incoming sound is translated into movement, density, scale, and spatial behaviour in real time.",
  },
  {
    slug: "teenage-engineering-ko-ii",
    title: "Teenage Engineering's KO II",
    date: "Jan 2025",
    year: 2025,
    disciplines: ["3d-experience", "motion-direction"],
    summary:
      "A 3D exploration of Teenage Engineering's KO II, deconstructing its iconic hardware into a study of form, interface, and mechanical detail.",
    body: "For this project, I modeled and animated the KO II entirely in Cinema 4D and Octane, breaking the sampler down into its individual components.",
  },
  {
    slug: "seeker",
    title: "Seeker — Onchain, Everywhere",
    date: "Jan 2025",
    year: 2025,
    disciplines: ["3d-experience", "motion-direction"],
    summary:
      "A conceptual 3D spec ad exploring Solana Seeker as a gateway between the physical device and the constantly evolving world of Web3.",
    body: "This project is a speculative product film for Solana Seeker, built around the idea of making an inherently digital ecosystem feel physical.",
  },
  {
    slug: "not-your-average-tee",
    title: "Not Your Average Tee",
    date: "Dec 2024",
    year: 2024,
    disciplines: ["branding"],
    summary:
      "A self-initiated apparel project turning graphic experimentation into a small collection of wearable pieces.",
    body: "Not Your Average Tee is a collection I designed, developed, and released as an exploration of how my visual language could exist beyond the screen.",
  },
  {
    slug: "solflare",
    title: "Solflare",
    date: "Nov 2024",
    year: 2024,
    disciplines: ["3d-experience"],
    summary:
      "A conceptual 3D product study reimagining the Solflare Card through custom modeling, materials, and lighting.",
    body: "Created entirely from scratch in Cinema 4D and Octane, this project is a focused product visualization of the Solflare Card.",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getDiscipline(slug: DisciplineSlug) {
  return disciplines.find((d) => d.slug === slug)!;
}

export function projectsIn(slug: DisciplineSlug) {
  return projects.filter((p) => p.disciplines.includes(slug));
}

export function disciplineNames(project: Project) {
  return project.disciplines.map((d) => getDiscipline(d).name).join(" · ");
}

// How a project runs, shown on the home page above the pricing.
export const process = [
  { title: "Consultation", line: "A short call about your brand, goals and timeline." },
  { title: "Proposal", line: "Scope, deliverables and a fixed quote, in writing." },
  { title: "Design", line: "Identity, 3D and motion, with a review at every stage." },
  { title: "Handover", line: "Final files, guidelines and everything you need to launch." },
];

export type Plan = {
  name: string;
  price: string;
  note: string;
  summary: string;
  includes: string[];
  cta: string;
  featured?: boolean;
  // The card's holographic foil: silver, full holo or brand red.
  foil: "silver" | "holo" | "red";
};

// Ways to work together. Every plan starts with the free consultation call.
export const plans: Plan[] = [
  {
    name: "Starter",
    foil: "silver",
    price: "$500",
    note: "One-off",
    summary: "One focused piece: a logo refresh, a product render or a short motion loop.",
    includes: ["One deliverable", "Two rounds of revisions", "Source files", "Free consultation call"],
    cta: "Book a consultation",
  },
  {
    name: "Project",
    foil: "holo",
    price: "$1,000",
    note: "Per project",
    summary: "A defined piece of work, from a new identity to a 3D product film.",
    includes: [
      "Brand identity or 3D visuals",
      "Fixed scope and price",
      "Weekly check-ins",
      "Source files and handover",
    ],
    cta: "Start a project",
    featured: true,
  },
  {
    name: "Studio partner",
    foil: "red",
    price: "$5,000",
    note: "Per month",
    summary: "Design, 3D and motion on call for brands that ship all the time.",
    includes: ["Ongoing design requests", "Priority turnaround", "Monthly planning call", "Design, 3D and motion"],
    cta: "Talk about a retainer",
  },
];

// The studio showreel, shown right after the hero on the home page.
export const showreel = {
  youtubeId: "FXHr9nYslgA",
  title: "Studio Deadzolt showreel",
};
