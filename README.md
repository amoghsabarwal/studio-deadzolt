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
- `src/components/scene/SceneCanvas.tsx`: the persistent 3D canvas. It's mounted once in the root layout, so it survives page navigation.
- `public/brand/`: logo, star mark, wordmark and brand imagery.
- `src/app/`: pages (home scroll story, works, case studies, about).
- `src/components/story/`: the scroll story driver (GSAP ScrollTrigger) and the chapter nav. `src/lib/story.ts` shares the active chapter with the 3D scene.

The plan is in five phases. This is phase 1: the 2D site, which also serves as the fallback and SEO base. Next comes the scroll-driven 3D world.
