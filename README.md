# Studio Deadzolt

The website for Studio Deadzolt, a design and development studio. It's built with Next.js and React Three Fiber.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, also type-checks
npm run lint
```

## Where things live

- `src/content/site.ts`: all copy, disciplines, projects and the home page chapters. Project text comes from deadzolt.studio.
- `src/components/scene/SceneCanvas.tsx`: the persistent 3D canvas, its studio lighting and postprocessing. It's mounted once in the root layout, so it survives page navigation.
- `src/components/scene/Star.tsx`: the chrome star, its pose for each chapter, and drag, cursor and scroll interaction.
- `src/components/scene/ChapterPieces.tsx`: one Blender piece per discipline chapter, which takes the star's place as the story reaches it.
- `public/models/`: the Blender models and environment map (see its README; the scripts that build them are in `tools/models/`).
- `public/brand/`: logo, star mark, wordmark and brand imagery.
- `src/app/`: pages (home scroll story, works, case studies, about).
- `src/components/story/`: the scroll story driver (GSAP ScrollTrigger) and the chapter nav. `src/lib/story.ts` shares the active chapter with the 3D scene.

The plan is in five phases. Phase 1 is the 2D site, which also serves as the fallback and SEO base. Phase 2 makes the 3D star the centrepiece of the scroll story.
