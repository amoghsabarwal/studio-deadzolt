# creativecue.co: motion and interaction teardown

Captured 2026-10-05 from https://www.creativecue.co/ (Awwwards Honorable Mention; the "W. Honors" ribbon is pinned to the right edge).
Sources: the served HTML, the decoded Next.js chunks (page, layout, shared components, lazy chunks) and the CSS, plus headless-Chrome captures.

**Correction to the brief: this is not a Framer site.** It is a hand-built **Next.js (App Router)** site. The motion stack is:

| Layer | Tech | Settings |
|---|---|---|
| Smooth scroll | **Lenis**, desktop only (>1024px) | `duration: 1.2`, `smoothWheel: true`, easing `1 - (1 - t)^4` (quartic ease-out), wired into ScrollTrigger with `scrollerProxy`. At ≤1024px it uses native scroll plus `ScrollTrigger.config({ignoreMobileResize:true})` and `fastScrollEnd`/`preventOverlaps`. |
| Tweens and scroll | **GSAP 3 + ScrollTrigger + Draggable + InertiaPlugin + ScrollToPlugin** | Eases: `power2.out` (most common), `power2.inOut`, `power3.out`, `expo.out`; scrub 1 to 1.2 |
| Shaders | **Unicorn Studio** v2.1.4 WebGL embeds | Behind the booking calendar and the "2026" footer (ASCII/glyph shader). `fps: 60`, `dpi: 1.5`, `lazyLoad: true` |
| Icons | **Lottie** (lottie-react) | Pricing feature bullets. Each icon loops while its card is hovered and stops at the end of the loop on leave. |
| Booking | **Cal.com inline embed** | `lakshyasangwani/30min`, month view, dark theme. The "Discovery Call" is 30 min on Google Meet. |
| Payment | Stripe Payment Link | Behind "Get Started Today" on the Monthly plan; opens in a new tab |

Palette: `--bg-primary:#000`, `--text-primary:#fff`, `--text-secondary:#bdbdbd`, `--text-tertiary:#474747`, hairlines `rgba(255,255,255,.1)`, accents `--color-green:#80dd12` (status dot) and `--color-yellow:#ffbb00`.
Type: Neue Haas (UI and CTAs), Inter Display (body, 14/20, -0.01em), and **Hermaiona / Cormorant Upright** for a script swash on the **first letter of every heading** and on every "&". That one detail does most of the "premium" work.

---

## Signature systems (used everywhere)

### 1. Text scramble/decode ("TextScramble", used on every heading, label, price and CTA)
This is the site's main motion signature. Every heading reveals with it when it enters the viewport, and every CTA label replays it on hover.
- The text is split into per-character spans, and words are locked to their measured width so the line never reflows while it scrambles.
- Each character cycles through **width-matched glyphs from the same class**: A–Z, a–z, 0–9, and `&` → `($%@!?0987123456)`. Candidate glyphs must be 70–100% of the real glyph's width (measured on a canvas), so the jitter never shifts the layout.
- Timeline: two "scan" passes, then a resolve pass. Each pass lasts `h = clamp(0.03 × charCount, 0.3, 0.8) / speed` seconds. Speeds in use: hero H1 2.3, card titles 3, CTAs 2, status label 1.
  - During the scan passes a **CSS mask-image gradient sweeps left to right**: text sits at 50% opacity with a 100% "light bar" ±30% wide passing over it. Glyphs re-randomise every 5th tick.
  - During the resolve pass the gradient becomes a hard reveal edge (resolved = 100%, the rest = 50%) and characters lock in left to right.
- It pauses on `visibilitychange`. Triggers come from IntersectionObservers with `rootMargin: "-10% 0px"`, which re-arm when the element leaves the viewport, so headings replay each time you return.

### 2. "Ghost echo" body copy (DescriptionText)
Section descriptions are rendered **3 times** in the same grid cell:
- the main copy at 0.8 opacity;
- `blur1`: `filter: blur(4px)`, 0.1 opacity, translated (-25%, 50%);
- `blur2`: `blur(1px)`, 0.1 opacity, translated (25%, -25%).

The result is a faint smeared double-exposure behind every paragraph (visible in the screenshots). It is static and costs nothing, but it reads as "designed". Variants without the ghosts fade in with `opacity 0→1, y 16→0, 0.4s power2.inOut`.

### 3. Cursor-tracking glow hairlines (LineGlow)
Every 1px divider (`rgba(255,255,255,.1)`) has a **280px radial glow** (`rgba(255,255,255,.96)`) that follows the pointer along the line. Glow opacity falls off linearly to 0 within 150px of the line's perpendicular distance. It is updated once per frame with `gsap.quickSetter`. The whole page sits on a visible grid of these lines (page gutters plus section and card dividers), so moving the mouse anywhere lights up nearby edges. It is disabled on touch.

### 4. CTA component (one style site-wide)
- An underlined text link, not a pill: min-width 260px, Neue Haas 14px, `border-bottom: 1px rgba(255,255,255,.3)`, with a dot-ring icon on the right.
- On hover:
  - the border goes to 100% white;
  - `padding-right` collapses 6→0 (0.16s), so the icon nudges right;
  - the label **re-scrambles** (speed 2);
  - the icon, 8 dots on a slowly rotating circle (radius 8, 0.004 rad/frame), **springs into an arrow shape**. It uses a hand-rolled spring (stiffness 900, damping 45), dots stagger 26ms and fade in from 0.32→1 opacity over 120ms. On leave it springs back to the circle with a softer spring (400/34).
- Anchor clicks scroll with GSAP ScrollTo: `1.2s power3.inOut` (`power2.inOut` to top).
- Labels are always "Book A Call", "View Work", "Get Started Today" or "View All Testimonials (13)".

### 5. Persistent chrome
- **Top nav:** CREATIVECUE® wordmark, an "✕"-style mark, "View Works" and a 2-line hamburger. It fades in `opacity 0→1, y -32→0, 0.6s power3.inOut` after the loader. The hamburger lines slide in on hover; when open they rotate ±45° to an X (36px wide). The separator icon spins -180° on hover with an overshoot ease, `cubic-bezier(.34,1.56,.64,1)` at 0.6s.
- **Floating bottom dock:** a fixed, centred black box containing a 3D star and a menu glyph. It is hidden over the hero, the work showcase and the footer (`data-hide-bottomnav`).
- **Menu overlay:** opening it stops Lenis and restores scroll position on close.
- **Awwwards "W. Honors" tab:** fixed to the right edge.

---

## Page, section by section (desktop 1440 unless noted)

### 0. Preloader (≈4–6s on first visit). Frames: `screenshots/intro-sequence/`
- A black full-screen overlay fades in over 0.4s. A **3D chrome four-point star** (video) lights up and rotates in the centre.
- Meanwhile it preloads the brand logos, logo, star, separator, the first 2 project images, `document.fonts.ready` and the capabilities video, 5 images at a time with `img.decode()`.
- At **70% of the star video, or a 1.5s minimum**, two vertical lines (the page gutter rules) **drop in from y:-100vh → 0, 1.2s power2.inOut, staggered 0.5s**.
- Hard cap 4s. The overlay then fades out (0.4s) and, 600ms later, `markReady()` fires the hero.

### 1. Hero
- **Content:**
  - green pinging status dot + **"Currently Open"** (scrambles at speed 1);
  - H1 **"Premium design expertise backed by bandwidth that doesn't break."** (script "P");
  - sub: "Your dedicated design team for brand, web, email, and everything that touches design. One flat fee, unlimited requests, managed through Slack and Notion. No hiring. No freelancer roulette.";
  - CTA **Book A Call**.
- **Entrance:** the inner block goes `opacity 0→1, y 20→0, 0.8s power3.out`, the sub `y16, 0.6s, delay .3`, and the CTA `y16, 0.6s, delay .45`. The H1 scrambles at speed 2.3. Screenshot `intro-14` catches it half-decoded ("backeg uz uscgwjgtc tcst").
- **Background: the "Sine Carousel".** This is the hero visual: 24 project thumbnails strung along a **sine wave** running diagonally across the viewport.
  - Each card is placed at x = i × 8% of the width, y = `80·sin(x / (W/2) · 0.6π) + 0.2x`. Scale = `0.4 + 0.4·e^(-0.8·|distance from centre|)`, with z-index by distance, so it reads as a 3D ribbon with a big centre card.
  - Intro, pass 1: the cards **pop on one by one** along the wave (`opacity 0→1, scale 0.9→1, 0.24s power2.out`, ~0.04s per card).
  - Pass 2, after a 0.4s delay: the whole ribbon **rushes in and decelerates** to rest (`expo.out`, 0.22s × number of projects).
  - It is then **draggable** (GSAP Draggable, 0.3× drag ratio) with custom momentum: velocity × 0.984 per frame. It wraps infinitely by recycling cards.
- **Mobile (≤768):** a different "MobileCarousel". It is a flat horizontal strip, 21 cards at 36% width spacing, scale `0.3 + 0.6/(1 + 1.2·d)`, the same two-pass intro (expo.out, 0.4s × n), drag 0.9× with 0.98 friction.

### 2. Trusted brands
- **Content:** "Trusted by world's most exciting brands" with a logo grid of about 36 grayscale logos (Wander, AM MD, Grow Pronto, HIDE, Nailboo, monday, Eightfold, Kobalt Club and others).
- **Motion:** when the section is 20% in, the label fades and slides up (`y36, 0.48s power2.inOut`). Then the logos fade up **row by row** (8, 6 or 5 per row depending on width), each row overlapping the previous by `-=0.42`, which gives a fast cascading shimmer.
- **Mobile:** 3 vertical **tickers** of 12 logos each. They move in alternating directions (up/down/up), 40s linear loops.

### 3. (01) Why us: features grid
- **Content:** H2 "Not just another design team. The one you stop searching after."
  - Sub: "Over 12 years grinding alongside founders & agencies… the design partner teams turn to when speed & quality matter most."
  - **8 cards:** (01) The Best · (02) No Micromanaging · (03) Lightning Fast (start within 4h) · (04) Unique & all yours · (05) Elites only (5+ yrs) · (06) Reliable by default · (07) Flexible for you (pause/cancel anytime) · (08) Scaleable & dynamic.
- **Motion:**
  - The header children stagger in (`y20, 0.48s, stagger .1, power2.inOut`).
  - The cards stagger in at `top 80%` (`y36, 0.48s, stagger .08, power2.inOut`).
  - Each card title scrambles.
  - Big ghosted section numbers "(01)" sit behind the headings in `--text-tertiary`.

### 4. (02) Process: 3 steps
- **Content:** H2 "The process that is unbreakable & delivers every time without uncertainty."
  - Sub: "Three steps. Notion for tasks, Slack for comms, Figma for delivery…"
  - Steps:
    - (01) **Add your tasks to Notion**, shown with a mock "Waveless Rebranding" project board at 75%;
    - (02) **Relax or talk to us?**, shown with a mock Slack channel "You x CREATIVECUE®";
    - (03) **Wait for Results**, shown with a Figma-like canvas with a star toolbar.
  - Steps alternate left and right, and each sits over a "grill" of fine vertical lines with a coloured underglow (amber, blue, green).
- **Scroll (scrubbed, scrub 1.2):** from `top 80%` to `top 50%` (mobile: 100%→80%):
  - the text goes `opacity 0→1, y 36→0`;
  - the mock UI image rises `y 72→0`;
  - a CSS glow `--glow-scale/--glow-opacity` goes 0→1;

  together these make a coloured light "switching on" under each panel.
- **Mouse parallax:** small floating UI chips around each mock follow the cursor via `quickTo(x, 0.4s power2.out)`. The range is ±4px. Alternate chips move in the opposite direction (factors 0.8, 1, −1) for subtle depth.

### 5. (03) Capabilities ("The kind of work we do for our partners")
- **Content:** sub "Brand, web, email, and marketing… One team, one standard." with CTA **View Work**.
  - A full-bleed **autoplaying muted video** reel (Driftwell brand work in the capture).
  - Then **3 columns:**
    - (01) **Brand**: 1.1–1.8 Creative Strategy & Art Direction, Identity, Campaigns, Guidelines, Packaging, Digital, Illustration, Typography;
    - (02) **Digital**: 2.1–2.7 Web Design, Web Dev, Apps, Generative AI, UI & UX, App Design, Product Design;
    - (03) **Marketing**: 3.1–3.6 CRO, Email & SMS, Ad Creatives, Generative AI, Strategy & Consultation, Campaign Strategy.
- **Motion:**
  - The video wrapper scrubs `scale 0.8→1, y 60→0` (ease power3.inOut) from its top hitting the viewport bottom until its bottom does.
  - The video itself counter-scales `1.4→1` (top 80%→20%), a "zoom-out reveal" inside a growing frame.
  - The video plays and pauses on enter and leave.
  - The columns drop in `y80→0, 1s power3.out`, reversing when you scroll back up.
  - Hovering any list item **re-scrambles that line**.

### 6. (04) Testimonials ("From the mouth of our beloved partners & winners")
- **Content:**
  - Sub: "Don't take our word for it…"
  - 2-up **grayscale video testimonial cards**: webcam-style founder clips with a quote, name and role, and a client logo bottom-right. Examples: Jayson Koss (Eightfold Ventures), Dolapo Sangowawa (Hashtag Monday).
  - Text quotes: Luca Matarazzo (GrowPronto), Luca Hontau (KobaltClub), Yenney Curbelo, Kira Poole, Caitlin Sise, Brandon Bal (DADFUEL).
  - **"As Seen On"** row: awwwards., World Brand Design Society, Clutch 5.0 ★★★★★.
  - CTA **View All Testimonials (13)**.
- **Motion:** the same header and scramble system. The cards use the shared `cardAppear` keyframe (`opacity 0, y40 → 0`). I didn't decode this chunk's per-card timing, so treat that part as inferred from the CSS.

### 7. (05) Pricing ("The pricing is transparent, just like our process.")
- **Content:** sub "No hidden fees, no per-revision charges, no scope creep surprises…"
  - **Monthly ($5,000 / per month):**
    - Features: Unlimited Revisions & Requests ("NEW!" badge) · One Senior Designer · One Junior Support Designer · Daily Updates · Managed via Slack & Notion.
    - CTA **Get Started Today** goes to a Stripe payment link.
  - **Sprints ($10,000 / onwards):**
    - Features: Clear, pre-defined scope with fast turnaround · Daily Updates · Managed via Slack & Notion.
    - CTA **Book A Call**.
- **Motion:**
  - Each card's background is a **portfolio image ticker**. Monthly is a 3× image strip on an extremely slow CSS loop (`1800s linear`), paused when off-screen. Sprints is a GSAP loop at width/1.6 px/s that **only runs while the card is hovered**: it accelerates with `timeScale 0→1` over 1.6s expo.out and coasts to a stop with `timeScale→0` over 3s expo.out on leave. That gives a lovely "flywheel" feel.
  - On enter, the title scrambles.
  - The feature bullets rise in one by one (`y20→0`, 0.5s, `cubic-bezier(.215,.61,.355,1)`, delay 200ms + 70ms × i), each with a looping Lottie icon.
  - Then, after **200 + 70·n + 500 ms**, the **price scrambles in**: the "$" at speed 2 and the digits at speed 3. The price is the last thing to resolve, which works as a little drumroll.

### 8. Booking ("Different needs? Let's talk.")
- **Content:** "Unsure with your needs? or if you have any questions, book a call with us…"
  - A **Cal.com inline month-view calendar** sits in the page: "CREATIVECUE® Discovery Call" card, 30m, Google Meet, timezone selector, 12h/24h toggle, slot list.
  - No form and no modal: booking is fully inline.
- **Motion:** the background is a **Unicorn Studio WebGL shader** (the same coloured-ASCII "2026" piece as the footer, showing through). On mobile it falls back to a static webp.

### 9. (06) FAQ
- **Content:** H2 "Frequently Asked Questions"; sub "Find clear answers…"; CTA **Book A Call**.
  - Accordion items, e.g. "Why $5,000 a month?" and "What does 'unlimited' mean?".
- **Motion:**
  - Desktop has 3 overlapping work images beside the heading. When the section is 55% in (rootMargin -45% bottom) they **pop in at 0 / 100 / 300ms** with a 250ms "burst" image effect. They retract in reverse order at 0 / 150 / 300ms when you leave.
  - The accordion animates `grid-template-rows` 0fr→1fr (0.3s ease-in-out).
  - The open item gets a glow wrapper.
  - The +/− icon is 5 dots in a "chevron" pattern that **morph into an 8-dot spinning ring** (`cx/cy` transitions 0.5s `cubic-bezier(.4,0,.2,1)`, 30ms stagger per dot).

### 10. Work showcase (scattered collage)
- **Content:** 12 randomly chosen project images (from 13) at random widths (28–45% of the width; 52–80% on mobile). They are placed using one of 4 randomly picked left/right/centre patterns, and the last image is centred at 90%. **The layout changes on every visit.**
- **Motion:**
  - Each image has scrubbed **parallax** of y ±14% of its own height across its full pass (scrub 1). Centre items move opposite to side items.
  - Each image also fades in from top 100% to top 60%.
  - Over the last viewport of the section, the footer's year block rises `y100→0` and fades in, scrubbed.

### 11. Footer
- A giant **"2026" rendered as a Unicorn Studio WebGL ASCII/glyph shader** (multicoloured `2 0 6 % @ #` characters tracing script lettering).
- Below it, in a hairline grid:
  - star mark;
  - "A creative-first design service studio based out of Lucknow, India, Specialising in branding, web design & marketing.";
  - Instagram / Dribbble / LinkedIn / X;
  - Terms of Service ✕ Privacy Policy;
  - **"CREATIVECUE(®) 'The Book' 2026.pdf"** downloadable lead magnet.

---

## Motion language: what makes it feel premium

1. **One signature, used everywhere.** The width-locked text scramble with a sweeping light-mask is the brand's "voice". It runs on headings, prices, labels, CTAs and hovered list items. Repetition makes it feel intentional rather than gimmicky.
2. **Short, decisive durations.** Entrances last 0.4–0.8s, staggers 70–100ms, and y-offsets are small (16–36px, 72–80px for images). Nothing bounces. The only overshoot ease (`.34,1.56,.64,1`) is on a tiny nav icon.
3. **Ease vocabulary is narrow:** `power2.out/inOut` for UI, `power3.out` for content, `expo.out` for big momentum moves (carousel settle, ticker flywheel). Smooth scroll uses a 1.2s quartic ease-out.
4. **Scroll-linked rather than scroll-triggered for big visuals** (scrub 1–1.2): the process mocks, the video zoom-out and the showcase parallax. Small text uses one-shot triggers. Headings re-arm and replay.
5. **Physics in small things.** The CTA icon dots use a real spring; the carousels use custom inertia (0.98 / 0.984 friction); the pricing ticker spins up and coasts like a flywheel.
6. **Light as interaction.** Cursor-following glows on every hairline, light-bar masks on text, underglows switching on in the process panels. Everything is monochrome, so light is the accent.
7. **Restraint in colour and type.** Pure black, white and grey, with one green dot. The luxury comes from the script initial and ampersands against Neue Haas.
8. **Performance-aware:** IntersectionObservers pause tickers and videos off-screen, Lenis and glows are disabled on touch, shaders lazy-load, and the loader actually preloads the assets the first screens need.

## Takeaways for our build
- Copy the **system**, not the pieces: one text effect, one CTA, one divider-glow, one ease set, applied with discipline.
- A loader is justified only if it hides real preloading and is hard-capped (theirs is 1.5s minimum, 4s maximum).
- A visible **booking calendar on the page** (no modal) plus a **Stripe link straight from the pricing card** gives a short path to conversion.
- The proof stack is dense: a ~36-logo wall, video testimonials, Awwwards / WBDS / Clutch badges.

## Files
- `screenshots/desktop-1440/`: 24 viewport captures at 1440×900, one per 900px of scroll (page ≈ 21,400px), each after a 1.8s settle.
- `screenshots/mobile-390/`: 24 captures at 390×844 (iPhone UA, touch; page ≈ 20,000px).
- `screenshots/intro-sequence/`: 20 frames sampled every ~400ms from a CDP screencast of the first 8s (loader → star → lines → hero scramble). No MP4: ffmpeg isn't installed on the capture machine.
- `screenshots/mid-animation/`: each major section captured 250ms and 700ms into a smooth scroll, plus the CTA at rest and at 150ms / 750ms of hover.
