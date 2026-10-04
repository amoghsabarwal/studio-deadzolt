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

- `src/content/site.ts`: all copy, disciplines and projects. Edit this file to change site content.
- `src/components/scene/SceneCanvas.tsx`: the persistent 3D canvas. It's mounted once in the root layout, so it survives page navigation.
- `public/brand/`: logo, star mark, wordmark and brand imagery.
- `src/app/`: pages (home, work, case studies, studio, contact).

The plan is in five phases. This is phase 1: the 2D site, which also serves as the fallback and SEO base. Next comes the scroll-driven 3D world.
