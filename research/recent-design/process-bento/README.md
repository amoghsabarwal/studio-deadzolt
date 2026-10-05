# Process bento: art direction

Art direction for the "How it works" section. It builds on the in-progress `ProcessBento` on branch `claude/process-bento-0rnlo0` (commit `a94c0d3`) and on the recent.design reference pack one folder up.

- `concept.html` is a working concept board. The tile illustrations are plain SVG and the star is the existing render. Open it in a browser: it loads `public/models/previews/deadzolt-star.webp` by relative path, and `?t=0..1` scrubs the animation.
- `concept-t015/t055/t100.jpg` are the board at three points in its loop.
- `current-*.jpg` are the branch as it renders today.

## The idea in one line

**Show the work becoming a render.** Each tile is one stage of the same object, the Deadzolt star, drawn in one hairline style and moving from words to sketch, wireframe, clay, render and exports. The current tiles show the tools (a Slack window, a viewport, a list). The illustrations should show the craft instead.

## What's working now, and what to change

| Tile | Now | Keep | Change |
|---|---|---|---|
| 01 Request | Slack chat mock-up with a typing loop | the brief copy, the red "live" dot | Swap most of the chat for an **isometric brief card** whose lines draw in, three file slabs travelling a dotted route, and a **storyboard of three frames** where the star is sketched shot by shot. The first frame of the current loop shows one message in a mostly empty box (`current-desktop.jpg`). |
| 02 Frames in 48h | Viewport with a perspective floor, bucket render, T-minus clock | the 48h clock, Octane label, "v1 ready for review" | Make it a **48-hour dial** (after Shopify Design's scroll dial). The ring has 48 ticks and phase arcs WIREFRAME 0–16h, CLAY 16–32h and RENDER 32–48h. A red hand sweeps round, and the centre object goes from a hairline wireframe star to a greyscale clay render to the chrome render. This should be the hero tile, tall and spanning both rows. |
| 03 Exports | One frame resizing next to a list | the ratio list with ticks | Show **all four crops nested over one master frame**, like crop marks on a contact sheet. Unused crops sit at 18% white and the active one is red with corner crop marks. The star stays still while the crops change, which says "one frame, every feed" better than resizing a single box. Drop the dashed placeholder box: it reads as unfinished. |
| Craft | A generic wireframe globe | the craft line | Draw the **star as a topology mesh** (nested contours plus spokes, like Topology and Podium's contour lines) that turns on its axis. A red vertex dot rides the tip. Add a "SUBD 2 · 4,812 POLYS" caption in mono. |

## Bugs I saw while rendering the branch

1. On desktop, the floating chrome star from the scroll story overlaps tile 02's heading as the section enters (`current-overlap.jpg`). Fade or park it before `.pb` reaches the viewport.
2. On phones, the same star sits behind the chat text in tile 01 (`current-phone.jpg`) and lowers contrast.
3. On phones, the hollow cursor ring stays on screen over tile 01 (`current-phone.jpg`). This might only happen with my automated pointer, so check it on a real device.

## Illustration system

- **Line:** 1px hairline with `vector-effect: non-scaling-stroke`, in three weights:
  - `--hair` is `rgba(237,237,237,.55)` for the drawing.
  - `--faint` is `.18` for construction lines.
  - Dotted `2 5` lines show routes.
- **One accent:** `--red #ff1f1f`, used only for the live thing in each tile (the clock hand, the active crop, the vertex dot, the live dot). Don't use it for decoration.
- **One rendered object:** only the chrome star is a render; everything else is line. In clay it gets `grayscale(1)`. Mask it with a soft radial so the webp's square background never shows; this was visible in my first pass.
- **Texture:** an 18px dot grid inside each tile, masked to the illustration area at about 9% opacity. This is the "graph paper" the drawings sit on.
- **Labels:** mono, 10–11px, tracked out and uppercase (`SH 01 · 0:00`, `T-21:35:00`, `WIREFRAME`). These do the explaining, so the headings can stay short.
- **Grid (desktop, 12 columns):** 01 spans 7 columns × 1 row, 02 spans 5 × 2 (the hero), 03 spans 4 × 1, and Craft spans 3 × 1. On phones keep the existing sideways swipe, with the dial tile first at full width.

## Motion

- Use the tokens already in `src/lib/motion/tokens.ts`:
  - `DUR.base 0.6` / `DUR.slow 0.8`, `EASE.content` for drawings, and `STAGGER 0.08`.
  - Line draws use `stroke-dashoffset`, with `ease: "power3.out"` and 0.6–0.9 s per path.
- **Entrance:** tiles blur in (filter `blur(10px)` → 0 with opacity and `y: 24`) instead of the current rise alone. This is the Interfere/Augen move from the research pack.
- **Loops:** each loops only while on screen, as now.
  - 01 runs about 6 s: card lines, files travel, then the storyboard sketches.
  - 02 runs about 7 s: the hand sweeps in roughly 5 s, holds on "V1 · READY FOR REVIEW" for about 1.5 s, then resets with a quick 0.4 s fade.
  - 03 steps every 1.5 s.
  - Craft turns continuously at about 8 s per revolution.
- **Hover (desktop):** the hovered tile's hairlines brighten from `.55` to `.85` over 0.18 s and its loop speeds up to 1.5× (`timeline.timeScale`). No scale or tilt.
- **Reduced motion:** freeze each drawing at its finished state, as the branch already does.

## Build notes

- Everything is inline SVG plus the existing star webp, so it needs no new dependencies and no WebGL. It fits the branch's "plays the same with or without WebGL" rule.
- The geometry helpers in `concept.html` (`starPath`, `iso`, `isoBox`, `draw`) can be lifted straight into `ProcessBento.tsx`. Recompute coordinates from each SVG's viewBox instead of measuring the DOM.
- The concept board is static per `t`. In the component, drive the same functions from a GSAP timeline's `progress()`, or keep the paths fixed and tween `strokeDashoffset`, the hand's `rotate` and the crop classes.
- **Optional upgrade:** I can render matching wireframe and clay passes of the star in Blender on this machine, so tile 02 uses three real renders instead of an SVG wireframe and a CSS greyscale filter.
