// The shop: digital assets from the studio, sold through Gumroad. Each
// product opens Gumroad's checkout over the site; without JavaScript the
// link opens the product page on Gumroad in a new tab.
//
// To list a product, paste its Gumroad link (https://<name>.gumroad.com/l/<id>)
// into `gumroad`. A product without a link shows as coming soon and can't be
// bought.

export type Product = {
  slug: string;
  title: string;
  // One line on what it is and who it's for.
  line: string;
  // What's in the download: formats, counts, resolution.
  format: string;
  // In USD, as set on Gumroad.
  price: number;
  image: string;
  alt: string;
  gumroad: string;
};

// PLACEHOLDERS: the titles, prices and pictures below are samples until the
// studio's real Gumroad products are linked.
export const products: Product[] = [
  {
    slug: "chrome-star-kit",
    title: "Chrome star kit",
    line: "The bevelled Deadzolt star, ready to light, spin and render.",
    format: "C4D · glTF · Octane scene",
    price: 24,
    image: "/models/previews/deadzolt-star.webp",
    alt: "A chrome four-pointed star with bevelled edges",
    gumroad: "",
  },
  {
    slug: "space-set",
    title: "Space set",
    line: "Asteroids, a moon and a probe, modelled for close-up camera moves.",
    format: "3 models · C4D · glTF",
    price: 29,
    image: "/models/previews/asteroids-space.webp",
    alt: "A cluster of rough grey asteroids",
    gumroad: "",
  },
  {
    slug: "chrome-materials",
    title: "Chrome materials",
    line: "The chrome and holographic finishes used across the studio's films.",
    format: "12 materials · Octane",
    price: 18,
    image: "/models/previews/orb-3d-experience.webp",
    alt: "A glossy holographic orb",
    gumroad: "",
  },
  {
    slug: "loop-pack",
    title: "Loop pack",
    line: "Seamless abstract loops for intros, backgrounds and social posts.",
    format: "10 loops · 4K · ProRes and MP4",
    price: 15,
    image: "/models/previews/loop-art-direction.webp",
    alt: "A soft looping ribbon of light",
    gumroad: "",
  },
];

export function price(p: Product) {
  return `$${p.price}`;
}
