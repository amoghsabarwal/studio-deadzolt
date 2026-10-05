# recent.design reference pack

Design references for the Deadzolt studio site, taken from [recent.design](https://recent.design/) (the gallery that used to be called Godly). Captured on 2026-10-05 with headless Chromium at 1440×900. All screenshots are in `screenshots/` as JPGs, 1280px wide and under 150 KB each.

**How I picked:** I browsed the Websites gallery with the **Agency**, **Portfolio**, **SaaS**, **AI** and **Technology** filters and read the tag metadata on each entry (Style / Interaction / Library / Technology). I chose the 14 sites below for their interaction and illustration work. I favoured dark, minimal and premium sites; bento, process and how-it-works sections; and animated line or 3D illustration.

**How to read the build notes:**
- **"Tags"** are recent.design's own metadata for the entry.
- **"Observed"** is what I measured on the live page: canvas count, whether Lenis was present, and what changed between frames.
- **Timings** are estimates from frame gaps (usually 80 ms, 300–400 ms and 1–1.5 s after an action), not values read from the source.

**Skipped:** avara.xyz showed a Cloudflare bot-verification page. I didn't try to get past it.

---

## 0. recent.design itself: the gallery UI

`00-recent-design-grid` · `-filter-crossfade` · `-card-to-detail-mid` · `-detail`

- **Grid:** a masonry feed of cards with 8px corner radius. Each card shows a `.webp` poster with a muted, looping 480p `.mp4` on top (`preload="metadata"`, no autoplay attribute). Script starts the videos when cards come into view, so the grid feels alive without a hover.
- **Filters:** pill chips (All / AI / Agency / Portfolio …). Clicking one keeps the URL in sync (`?category=agency`) and swaps the feed with an opacity and filter crossfade: the old cards dim, then the new set fades in. The whole swap takes about 0.3–0.5 s.
- **Card to detail:** a shared-element transition. The card's media has `data-feed-transition-visual` and scales up into the detail panel while the grid behind it blurs and dims. The left column then shows a metadata table (Impressions, Category, Style, Interaction, Library, Technology).
- **Easing tokens found in its CSS:**
  - `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, used for the big moves)
  - `cubic-bezier(0.2, 0, 0, 1)`
  - `cubic-bezier(0.4, 0, 0.2, 1)`
  - `cubic-bezier(0.65, 0, 0.35, 1)`
  - Durations are 0.12 / 0.15 / 0.18 / 0.2 / 0.28 / 0.3 / 0.5 s. The transitioned properties are mostly `opacity, transform, filter`.
- **Type:** Inter, plus Departure Mono for small labels. No custom cursor.
- **Steal:** expo-out easing on everything, poster-then-video cards, and a filter crossfade instead of a re-layout.

---

## 1. Ragged Edge, raggededge.com

`01-ragged-edge-hero-shader-a/b/c` · `-case-hover-a/b`

- **What it does:** a full-bleed WebGL "spectrum burst" behind a giant extended wordmark. The radial colour streaks keep flowing and shift hue; frames 700 ms apart show quite different palettes. Further down, each case study is a split row: client name and stats on the left, a large media panel on the right. The panel cycles through brand assets (a product UI, then a poster, then a share modal) about every second, and a small "More" pill rides on the cursor.
- **Feel:** a slow, liquid, never-ending loop in the hero, against a crisp, editorial case list.
- **Build:** tags say GSAP, Three.js, Lenis, Tempus. I observed 2 canvases, Lenis present and 15 videos.
- **Steal:** a shader hero behind one oversized word, and case rows with an auto-cycling media panel and a cursor pill.

## 2. Podium, podium.global

`02-podium-hero-blob-mask` · `-blob-scroll-a/b` · `-contour-line-section`

- **What it does:** the loader is a single black dot with a % counter in the corner. The hero is a metaball/blob shape used as a mask over sports footage. On scroll the blobs swell and merge until the footage fills the frame, then it drops into a dark 3D card collage. The "about" section sits on a dashed technical grid with dotted topographic contour lines, which works as a line illustration.
- **Feel:** gooey and organic on scroll, against a strict black-and-white grid.
- **Build:** tags say Next.js, GSAP, Three.js, Lenis. I observed 1 canvas, Lenis present and 27 videos.
- **Steal:** a blob-mask reveal for the showreel, and a contour-line or dashed-grid backdrop for the process section.

## 3. Displace, displace.agency

`03-displace-hero` · `-services-stack` · `-offer-cards`

- **What it does:** an agency site built like a desktop OS, with a floating menu bar, a search field and a "Talk to us" voice dock. Services are a big stacked word list (Build / Takeover / Run / Systems) with sticky thumbnails beside it. The offer section uses tilted "paper" UI cards: a price slip, a "31 December 2026" calendar card and a product tile. The UI itself acts as the illustration. It's very close to Deadzolt's pricing and process story.
- **Feel:** calm, product-like, with small spring tilts on the cards.
- **Build:** tags say Next.js and Motion (Framer Motion). I observed Lenis present and no canvas. I rejected the cookie banner (Reject all) before capturing.
- **Steal:** pricing and deadline as physical cards, and a services word stack with sticky media.

## 4. Area Technology, area.tech

`04-area-technology-logo-a` · `-logo-crossfade` · `-logo-c` · `-projects-transition-mid` · `-projects-fan`

- **What it does:** a giant grey "AREA" wordmark sits on white while a carousel of glossy 3D brand objects (a tennis ball, a chrome logo, a red wireframe sphere) crossfades in the centre, about once a second. Clicking **Projects** fades the object out and blooms the projects into a radial fan of cards, like a pinwheel, in about 1–1.5 s.
- **Feel:** toy-like, chunky, with soft crossfades.
- **Build:** tags say Next.js and Tailwind. I observed no canvas, so the 3D is probably pre-rendered images or video.
- **Steal:** a rotating "object of the day" hero, and a radial fan layout for the work index.

## 5. Dirt, dirtverse.co

`05-dirt-hero-orbs` · `-work` · `-footer-chrome-wordmark`

- **What it does:** a hero row of circular 3D "orbs" (iridescent flower, chrome balls, neon petals) drifting sideways. The footer ends on a huge glassy chrome "dirt" wordmark rendered in WebGL.
- **Feel:** a minimal white layout with jewel-like 3D accents.
- **Build:** a Framer site with the Motion library. I observed 1 canvas, Lenis present and 13 videos.
- **Steal:** a chrome or glass 3D wordmark as the footer sign-off, and small circular 3D vignettes for service icons.

## 6. UNVEIL, unveil.fr

`06-unveil-diagonal-stack` · `-stack-hover` · `-stack-scroll`

- **What it does:** a "100%" loader, then the whole portfolio becomes a diagonal 3D-perspective stack of project cards running from bottom-left to top-right. Hovering or scrolling slides the stack along the diagonal, and a card expands to full screen when opened.
- **Feel:** spatial and cinematic. In headless Chromium the frames barely changed, so the motion is subtle or needs a real pointer.
- **Build:** tags list Custom Cursor and Transitions. I observed no canvas, so this is likely CSS 3D transforms.
- **Steal:** a diagonal card stack for a "selected work" index.

## 7. Pacôme Pertant, pacomepertant.com

`07-pacome-pertant-enter-gate` · `-enter-transition-a/b` · `-reel-scroll`

- **What it does:** a dark entry gate (a green orb, "enter with sound" / "enter without sound"). After entering, curved video cards fly in from depth and settle into a floating 3D spiral; frame b is about 1 s after frame a. A rotating circular "showreel • 2025" text badge sits bottom-left. Scrolling rotates the spiral, and a "spiral / list" toggle switches views.
- **Feel:** playful and weighty, with a long ease-out on the fly-in.
- **Build:** tags say Nuxt, GSAP, Lenis, Howler.js, LottieFiles, Three.js. I observed 1 canvas and Lenis present.
- **Steal:** a spiral/list view toggle for the work, a rotating text badge, and optional sound.

## 8. Belen Jones, belenjones.com

`08-belen-jones-cube` · `-list-hover-a/b`

- **What it does:** a full-screen list of clients set in outlined Monument Extended, with a Three.js box floating in front. Hovering a name fills that line solid and swaps what is inside the box (texture, lid branding, objects); the change lands within about 150 ms.
- **Feel:** snappy hover and a heavy, physical object.
- **Build:** tags say Next.js, GSAP, Three.js. I observed 1 canvas.
- **Steal:** a hover-to-preview client list where one 3D object changes per row.

## 9. Mintlify, mintlify.com

`09-mintlify-hero-lines-a/b` · `-bento`

- **What it does:** the hero has a field of hundreds of thin green and mint strokes flowing like wind behind a product UI card. This is the best **animated line illustration** in the set. The bento grid below ("Agent-native platform", "Self-updating knowledge", "Connect with your systems") mixes line-field fragments with small UI vignettes. A live "Agents at work today" counter strip ticks up.
- **Feel:** a gentle continuous drift, against precise UI.
- **Build:** tags say Next.js, Motion, Radix/Base UI. I observed 15 canvases, so the line fields are canvas-drawn.
- **Steal:** a flowing line field as the hero illustration, bento cells with tiny UI vignettes, and live counters.

## 10. Interfere, interfere.com

`10-interfere-intro-blur-in` · `-hero` · `-product-cards`

- **What it does:** on load the headline and the large product UI fade in from a heavy blur to sharp in about 1 s. A soft pink/lilac haze sits behind the UI. Product sections use quiet cards with highlighted words ("finds / understands / resolution").
- **Feel:** soft and premium. A blur-in (filter plus opacity) instead of a slide.
- **Build:** tags say React, Motion, Radix/Base UI, Tailwind. I observed no canvas.
- **Steal:** a blur-to-sharp entrance for the hero and section headings.

## 11. Aside, aside.com

`11-aside-hero` · `-bento-reveal-a/b` · `-privacy-illustrations`

- **What it does:** a sky-and-clouds hero with a browser mock. The integrations row is glossy 3D app tiles. The bento cards first show only soft gradients, then the UI screenshots resolve into them about 0.8 s later (frames a and b). The privacy section uses monochrome **line and isometric illustrations**: stacked layers, a padlocked sandbox panel and an orbiting icon ring.
- **Feel:** airy, with staggered reveals.
- **Build:** tags say Next.js, Motion, Base UI. I observed 3 canvases.
- **Steal:** gradient-first bento cards that resolve into UI, and grey isometric line illustrations for the "how it works" steps.

## 12. Topology, topology.vc

`12-topology-hero` · `-scroll-tunnel-a/b`

- **What it does:** a full-screen WebGL iridescent topographic surface of concentric rings with rainbow chromatic edges. Scrolling drives the camera down into the rings while lines of copy fade in and out at the centre ("You jump…", "We jump…").
- **Feel:** a hypnotic, scroll-scrubbed camera move with no hard cuts.
- **Build:** a custom Vite-style bundle and a Three.js canvas (1). Tags list Scrolling Animation.
- **Steal:** a scroll-scrubbed 3D "process tunnel" with one short phrase per step.

## 13. Augen, augen.pro

`13-augen-hero` · `-invisible-a/b` · `-dark-specs`

- **What it does:** a light editorial hero (a portrait fading into white) with a pill nav. In the "Invisible Approach" section, giant blue type goes from blurred to sharp as you scroll, while a 3D render of the device rotates over the words. The dark sections reveal spec columns line by line.
- **Feel:** restrained, with long scroll-scrubbed fades.
- **Build:** tags say Nuxt, GSAP, Lenis. I observed Lenis present and no canvas, so the product is image or video.
- **Steal:** a blur-to-sharp headline scrubbed on scroll, with a product or object rotating over it.

## 14. Shopify Design, shopify.design

`14-shopify-design-hero` · `-dial-a/b/c`

- **What it does:** a "Make the new normal" hero over a scattered collage of UI cards. The standout is a scroll-scrubbed **line illustration**: a huge orange dial with tick marks and an outlined "26". The orange clock hand sweeps round as you scroll, then the numerals fill solid and roll to "22" while small 3D objects orbit the dial. Each scroll step moves the hand by a visible amount.
- **Feel:** a precise, mechanical, 1:1 scroll scrub.
- **Build:** tags say React Router, GSAP, Three.js. I observed 1 canvas and 36 videos.
- **Steal:** a scroll-scrubbed dial or timeline illustration for "how a project runs, week by week".

---

## Patterns worth adopting for Deadzolt

1. **Motion tokens:** use expo-out `cubic-bezier(0.16,1,0.3,1)` at 0.3–0.5 s for reveals and 0.12–0.2 s for hovers, and animate only `opacity, transform, filter` (from recent.design's own CSS).
2. **Blur-to-sharp entrances** (Interfere, Augen) instead of slide-ups. They feel premium on a dark background.
3. **Animated line illustration** for the hero or process section: a flowing stroke field (Mintlify), contour lines (Podium, Topology), or a scroll-scrubbed dial (Shopify Design).
4. **Bento with resolving content** (Aside, Mintlify): gradient-only cells that resolve into UI vignettes when they enter the viewport.
5. **Pricing and process as physical UI cards** (Displace): a price slip, a deadline calendar card and a product tile.
6. **Hover-to-preview work lists** (Belen Jones, Ragged Edge): one stage that changes per hovered row, plus a cursor pill.
7. **One 3D signature moment:** a chrome wordmark in the footer (Dirt) or a spiral reel (Pacôme). Keep the rest of the page quiet.
8. **Poster-then-video cards** (recent.design grid) to keep the work grid alive and cheap: posters load first and short muted loops play in view.
