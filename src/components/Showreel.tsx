"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { showreel } from "@/content/site";
import { getReducedMotion, setStory } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

const { youtubeId, title } = showreel;
const POSTERS = [
  `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
];

// Opens YouTube's connections early, once the visitor shows interest.
function preconnect() {
  for (const href of ["https://www.youtube-nocookie.com", "https://i.ytimg.com", "https://www.google.com"]) {
    if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    document.head.appendChild(link);
  }
}

// The showreel, straight after the hero: a viewport out into space that
// opens up to the full width as it scrolls in. The YouTube player loads only
// when the visitor presses play; until then it is a poster frame.
export default function Showreel() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(0);

  useEffect(() => {
    const el = root.current;
    const box = frame.current;
    if (!el || !box) return;
    // The star steps aside while the reel holds the screen.
    const stage = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 30%",
      onToggle: (self) => setStory({ stage: self.isActive }),
    });
    const opens = getReducedMotion()
      ? null
      : gsap.fromTo(
          box,
          { scale: 0.74, "--reel-round": "28px", "--reel-glow": 0 },
          {
            scale: 1,
            "--reel-round": "14px",
            "--reel-glow": 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "center 55%", scrub: 0.6 },
          },
        );
    return () => {
      stage.kill();
      opens?.scrollTrigger?.kill();
      opens?.kill();
      setStory({ stage: false });
    };
  }, []);

  return (
    <section ref={root} id="showreel" className="reel" aria-label="Showreel">
      <div ref={frame} className="reel-frame" data-playing={playing || undefined}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&color=white`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="reel-poster"
            data-cursor="play"
            onPointerEnter={preconnect}
            onFocus={preconnect}
            onClick={() => setPlaying(true)}
            aria-label={`Play the ${title}`}
          >
            {poster < POSTERS.length && (
              // eslint-disable-next-line @next/next/no-img-element -- a remote poster that falls back on error
              <img
                src={POSTERS[poster]}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setPoster((p) => p + 1)}
                onLoad={(e) => {
                  // YouTube answers a missing size with a small grey frame.
                  if (e.currentTarget.naturalWidth < 200) setPoster((p) => p + 1);
                }}
              />
            )}
            <span className="reel-hud label" aria-hidden="true">
              <span>Showreel</span>
              <span>Deadzolt · {new Date().getFullYear()}</span>
              <span>Selected work</span>
              <span>Sound on</span>
            </span>
            <span className="reel-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
