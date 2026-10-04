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
- `src/components/scene/Star.tsx`: the chrome star, its pose for each chapter, and drag, cursor and scroll interaction. `starShape.ts` builds the inflated star mesh from the logo outline.
- `public/brand/`: logo, star mark, wordmark and brand imagery.
- `src/app/`: pages (home scroll story, works, case studies, about).
- `src/components/story/`: the scroll story driver (GSAP ScrollTrigger) and the chapter nav. `src/lib/story.ts` shares the active chapter with the 3D scene.

The plan is in five phases. Phase 1 is the 2D site, which also serves as the fallback and SEO base. Phase 2 makes the 3D star the centrepiece of the scroll story.

## 3D models

The star is built in code for now. Blender models (a hero star and one piece per discipline) will land in `public/models/` as meshopt-compressed GLBs, with a matching environment map in `public/models/env/`. To swap one in, load it with drei's `useGLTF` inside `Star.tsx` in place of the generated geometry; the poses and interaction stay the same.
