// All site copy lives here. Project text is taken from deadzolt.studio.

export const site = {
  name: "Studio Deadzolt",
  founder: "Amogh Sabarwal",
  tagline: "Motion graphics people can't scroll past.",
  email: "amoghsabarwal@gmail.com",
  url: "https://deadzolt.studio",
  location: "Indore, M.P.",
  description:
    "Studio Deadzolt is the motion graphics studio of Amogh Sabarwal, making launch films, product animation and social content for venture-backed startups.",
  // What Google shows for the home page: the title and the line under it.
  search: {
    title: "Studio Deadzolt · Motion design for venture-backed startups",
    description:
      "Motion design for venture-backed startups: launch films, product animation and social content. First frames in 48 hours, plans from $500. Book a free call.",
  },
  about: [
    "Hi, I'm Amogh, founder of Studio Deadzolt.",
    "I make motion graphics for venture-backed startups: launch films, product animation and social content, built so people stop scrolling and look.",
  ],
  // Where every booking button goes: the studio's Calendly page. With
  // JavaScript it opens over the site (BookingDialog); without, in a new tab.
  booking: "https://calendly.com/amoghsabarwal/30min",
  // The one call to action, worded the same everywhere, and its promise.
  cta: "Book a free call",
  ctaNote: "30 minutes. You leave with a fixed quote in writing.",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/deadzolt/" },
    { label: "X", href: "https://x.com/deadzoltt" },
  ],
  // Business promises shown around the booking buttons. The 48-hour promise
  // is confirmed by the studio; the craft line is still to be confirmed.
  speed: "First frames in 48 hours",
  assurance: "Free 30-min call · fixed quote in writing · no lock\u2011in",
  craft: "Every frame built from scratch in Cinema 4D and Octane. No templates, no stock.",
  // The availability line with a live dot, confirmed by the studio. Change it
  // when that stops being true (e.g. "Booking for November").
  availability: "Open for new projects",
  // How the monthly plan runs, shown under the plans. Placeholder.
  steps: ["Request in Slack or email", "Frames for review in 48h", "Exports for every platform"],
  // What happens on the free call, shown on the closing booking card.
  callSteps: [
    "You show what you're launching, and when",
    "We sketch the motion that fits it",
    "You leave with a fixed quote in writing",
  ],
  // What the studio makes. All of it is motion graphics.
  services: ["Launch films", "Product animation", "Brand motion", "Social content", "Logo animation", "3D motion"],
};

// Attributes for a booking button. `from` names where on the site it sits;
// it travels to Calendly as utm_content and to analytics, so bookings show
// which button brought them.
export function bookingLink(from: string) {
  const url = new URL(site.booking);
  url.searchParams.set("utm_source", "deadzolt.studio");
  url.searchParams.set("utm_content", from);
  return { href: url.toString(), target: "_blank", rel: "noopener noreferrer", "data-book": from };
}

// Calendly's embedded calendar. It keeps Calendly's own white page, shown as a
// framed card inside the dark popup. Calendly only posts the "booked" event
// back to embeds that name the page's host.
export function bookingEmbed(from: string, host: string) {
  const url = new URL(bookingLink(from).href);
  url.searchParams.set("embed_domain", host);
  url.searchParams.set("embed_type", "Inline");
  url.searchParams.set("hide_gdpr_banner", "1");
  return url.toString();
}

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
      "A 3D product film for Daily Objects' NODE wireless ecosystem, set in a warm, tactile visual world.",
    body: "Built entirely from scratch in Cinema 4D and Octane, this project reimagines the NODE ecosystem within a carefully constructed domestic environment.",
  },
  {
    slug: "sound-studies",
    title: "Sound Studies",
    date: "Aug 2026",
    year: 2026,
    disciplines: ["art-direction"],
    summary:
      "Posters translating the music and visual identities of artists into graphic experiments.",
    body: "Sound Studies is an ongoing collection of personal poster work created around artists, albums, and tracks that have influenced my listening.",
  },
  {
    slug: "soft-structures",
    title: "Soft Structures",
    date: "Apr 2025",
    year: 2025,
    disciplines: ["art-direction"],
    summary:
      "Cloth simulation in motion: digital fabric exploring movement, form and material behaviour.",
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
      "A 3D product film for Solana Seeker, a gateway between the physical device and the world of Web3.",
    body: "This project is a speculative product film for Solana Seeker, built around the idea of making an inherently digital ecosystem feel physical.",
  },
  {
    slug: "not-your-average-tee",
    title: "Not Your Average Tee",
    date: "Dec 2024",
    year: 2024,
    disciplines: ["branding"],
    summary:
      "Graphic experiments turned into a small collection of wearable pieces.",
    body: "Not Your Average Tee is a collection I designed, developed, and released as an exploration of how my visual language could exist beyond the screen.",
  },
  {
    slug: "solflare",
    title: "Solflare",
    date: "Nov 2024",
    year: 2024,
    disciplines: ["3d-experience"],
    summary:
      "The Solflare Card reimagined through custom modelling, materials and lighting.",
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

export type Plan = {
  name: string;
  price: string;
  note: string;
  summary: string;
  includes: string[];
  featured?: boolean;
  // A small line under the button.
  fine?: string;
  // The card's holographic foil: silver, full holo or brand red.
  foil: "silver" | "holo" | "red";
};

// Ways to work together. Every plan starts with the free 30-minute call.
export const plans: Plan[] = [
  {
    name: "Starter",
    foil: "silver",
    price: "$500",
    note: "One-off",
    summary: "One short motion piece: a logo animation, a product loop or a social clip.",
    includes: ["One animation", "Two rounds of revisions", "Exports for every platform", "Free call to start"],
  },
  {
    name: "Project",
    foil: "holo",
    price: "$1,000",
    note: "Per project",
    summary: "A launch film or product animation, from storyboard to final render.",
    includes: ["Storyboard and style frames", "Fixed scope and price", "Weekly check-ins", "Final renders and source files"],
  },
  {
    name: "Motion subscription",
    foil: "red",
    price: "$5,000",
    note: "Per month",
    summary: "One monthly fee, unlimited motion requests, one at a time. Pause or cancel any time.",
    includes: ["Unlimited requests, one at a time", "Priority turnaround", "Monthly planning call", "Launch, product and social"],
    featured: true,
    fine: "Pause or cancel any time",
  },
];

// Named proof under the reel. It shows only once there are real entries:
// client names, and optionally one quote. Never fill these with made-up names.
export const proof: { clients: string[]; quote?: { text: string; name: string; role: string } } = {
  clients: [],
};

// Questions answered between the plans and the closing ask. Confirmed by the
// studio: 48 hours, one to three weeks, unlimited requests one at a time,
// pausing with unused days carried over, USD invoices. The revision counts
// are still to be confirmed.
export const faq: { q: string; a: string }[] = [
  {
    q: "What do I get for $500 or $1,000?",
    a: "$500 covers one short piece, like a logo animation or a product loop. $1,000 covers a full launch film or product animation, from storyboard to final render. The call ends with a fixed quote, so you know before anything starts.",
  },
  {
    q: "How fast is it?",
    a: "First frames land within 48 hours of the brief. A full film usually takes one to three weeks, depending on length.",
  },
  {
    q: "How many revisions do I get?",
    a: "Two rounds on Starter, and revisions at storyboard, style frame and animation stages on Project. The subscription takes requests one at a time with no revision cap.",
  },
  {
    q: "Can I pause the monthly plan?",
    a: "Yes. Pause or cancel any time, with no lock-in. Unused days carry over when you resume.",
  },
  {
    q: "You're in India. How do time zones and payment work?",
    a: "Work is async, with updates waiting for you each morning and calls booked at a time that suits you. Invoices are in USD.",
  },
];

// The studio showreel, shown right after the hero on the home page.
export const showreel = {
  youtubeId: "FXHr9nYslgA",
  title: "Studio Deadzolt showreel",
};
