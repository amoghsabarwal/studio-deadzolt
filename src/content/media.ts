// Pictures and films for each work, ported from the studio's old Framer
// site and compressed for the web (public/work/<slug>/). Videos are silent
// H.264 loops with a poster frame; stills are WebP. Order follows the old
// case pages; the first item leads the case study.

export type WorkMedia =
  | { kind: "image"; src: string; width: number; height: number }
  | { kind: "video"; src: string; poster: string; width: number; height: number };

export const workMedia: Record<string, WorkMedia[]> = {
  "node-ecosystem": [
    { kind: "video", src: "/work/node-ecosystem/01.mp4", poster: "/work/node-ecosystem/01-poster.webp", width: 720, height: 900 },
    { kind: "image", src: "/work/node-ecosystem/02.webp", width: 2000, height: 2000 },
    { kind: "image", src: "/work/node-ecosystem/03.webp", width: 2000, height: 2000 },
    { kind: "image", src: "/work/node-ecosystem/04.webp", width: 2000, height: 1124 },
    { kind: "image", src: "/work/node-ecosystem/05.webp", width: 1600, height: 2000 },
  ],
  "sound-studies": [
    { kind: "image", src: "/work/sound-studies/01.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/sound-studies/02.webp", width: 1125, height: 1406 },
    { kind: "image", src: "/work/sound-studies/03.webp", width: 735, height: 920 },
    { kind: "image", src: "/work/sound-studies/04.webp", width: 1200, height: 1500 },
    { kind: "image", src: "/work/sound-studies/05.webp", width: 1200, height: 1200 },
    { kind: "image", src: "/work/sound-studies/06.webp", width: 1200, height: 1500 },
    { kind: "image", src: "/work/sound-studies/07.webp", width: 1200, height: 1500 },
    { kind: "image", src: "/work/sound-studies/08.webp", width: 1200, height: 1200 },
    { kind: "image", src: "/work/sound-studies/09.webp", width: 1200, height: 1500 },
    { kind: "image", src: "/work/sound-studies/10.webp", width: 736, height: 920 },
  ],
  "soft-structures": [
    { kind: "video", src: "/work/soft-structures/01.mp4", poster: "/work/soft-structures/01-poster.webp", width: 1080, height: 1920 },
    { kind: "image", src: "/work/soft-structures/02.webp", width: 720, height: 1280 },
    { kind: "image", src: "/work/soft-structures/03.webp", width: 720, height: 1280 },
    { kind: "image", src: "/work/soft-structures/04.webp", width: 720, height: 1280 },
    { kind: "image", src: "/work/soft-structures/05.webp", width: 720, height: 1280 },
  ],
  "frequency-fields": [
    { kind: "video", src: "/work/frequency-fields/01.mp4", poster: "/work/frequency-fields/01-poster.webp", width: 720, height: 900 },
    { kind: "video", src: "/work/frequency-fields/02.mp4", poster: "/work/frequency-fields/02-poster.webp", width: 720, height: 900 },
    { kind: "video", src: "/work/frequency-fields/03.mp4", poster: "/work/frequency-fields/03-poster.webp", width: 720, height: 900 },
    { kind: "video", src: "/work/frequency-fields/04.mp4", poster: "/work/frequency-fields/04-poster.webp", width: 720, height: 900 },
    { kind: "video", src: "/work/frequency-fields/05.mp4", poster: "/work/frequency-fields/05-poster.webp", width: 720, height: 900 },
    { kind: "image", src: "/work/frequency-fields/06.webp", width: 1080, height: 1350 },
  ],
  "teenage-engineering-ko-ii": [
    { kind: "image", src: "/work/teenage-engineering-ko-ii/01.webp", width: 1080, height: 1350 },
    { kind: "image", src: "/work/teenage-engineering-ko-ii/02.webp", width: 1080, height: 1350 },
    { kind: "image", src: "/work/teenage-engineering-ko-ii/03.webp", width: 1080, height: 1350 },
    { kind: "image", src: "/work/teenage-engineering-ko-ii/04.webp", width: 1080, height: 1350 },
    { kind: "image", src: "/work/teenage-engineering-ko-ii/05.webp", width: 1080, height: 1350 },
    { kind: "image", src: "/work/teenage-engineering-ko-ii/06.webp", width: 1080, height: 1350 },
  ],
  "seeker": [
    { kind: "video", src: "/work/seeker/01.mp4", poster: "/work/seeker/01-poster.webp", width: 1600, height: 900 },
    { kind: "image", src: "/work/seeker/02.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/03.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/04.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/05.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/06.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/07.webp", width: 1920, height: 1080 },
    { kind: "image", src: "/work/seeker/08.webp", width: 1920, height: 1080 },
  ],
  "not-your-average-tee": [
    { kind: "image", src: "/work/not-your-average-tee/01.webp", width: 1200, height: 1600 },
    { kind: "image", src: "/work/not-your-average-tee/02.webp", width: 1200, height: 1590 },
    { kind: "image", src: "/work/not-your-average-tee/03.webp", width: 1200, height: 1600 },
    { kind: "image", src: "/work/not-your-average-tee/04.webp", width: 1200, height: 1498 },
    { kind: "image", src: "/work/not-your-average-tee/05.webp", width: 1200, height: 1498 },
    { kind: "image", src: "/work/not-your-average-tee/06.webp", width: 1200, height: 1600 },
    { kind: "image", src: "/work/not-your-average-tee/07.webp", width: 1200, height: 1600 },
  ],
  "solflare": [
    { kind: "video", src: "/work/solflare/01.mp4", poster: "/work/solflare/01-poster.webp", width: 1600, height: 900 },
    { kind: "image", src: "/work/solflare/02.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/03.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/04.webp", width: 1920, height: 1200 },
    { kind: "image", src: "/work/solflare/05.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/06.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/07.webp", width: 1920, height: 1200 },
    { kind: "image", src: "/work/solflare/08.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/09.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/10.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/11.webp", width: 1600, height: 1600 },
    { kind: "image", src: "/work/solflare/12.webp", width: 2000, height: 1009 },
  ],};

// The still that stands for each work in lists: the old site's card image.
export const workCover: Record<string, string> = {
  "node-ecosystem": "/work/node-ecosystem/01-poster.webp",
  "sound-studies": "/work/sound-studies/02.webp",
  "soft-structures": "/work/soft-structures/01-poster.webp",
  "frequency-fields": "/work/frequency-fields/01-poster.webp",
  "teenage-engineering-ko-ii": "/work/teenage-engineering-ko-ii/01.webp",
  seeker: "/work/seeker/01-poster.webp",
  "not-your-average-tee": "/work/not-your-average-tee/01.webp",
  solflare: "/work/solflare/12.webp",
};
