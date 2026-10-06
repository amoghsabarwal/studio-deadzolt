"use client";

import BookButton from "@/components/BookButton";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { showreel, site } from "@/content/site";
import { getLite, subscribeLite } from "@/lib/lite";
import { getReducedMotion, getSceneReady, setScenePaused, setStory, subscribeEntry } from "@/lib/story";
import { withMotion } from "@/lib/motion/load";

const { youtubeId, title } = showreel;

// Opens YouTube's connections early, once the visitor shows interest.
function preconnect() {
  for (const href of ["https://www.youtube-nocookie.com", "https://www.google.com"]) {
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
  const [inView, setInView] = useState(false);
  // A muted loop cut from the reel plays in the frame. It starts loading only
  // as the reel comes near; lite devices and reduced motion keep the poster.
  const [near, setNear] = useState(false);
  const lite = useSyncExternalStore(subscribeLite, getLite, () => true);
  const loop = near && lite === false && !getReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  // The poster sits below the first screen, so it's fetched once the page
  // has loaded and painted, never ahead of what the visitor sees first.
  const [poster, setPoster] = useState(false);
  useEffect(() => {
    let id = 0;
    const show = () => {
      id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setPoster(true));
      });
    };
    if (document.readyState === "complete") show();
    else window.addEventListener("load", show, { once: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("load", show);
    };
  }, []);
  useEffect(() => {
    const v = video.current;
    if (!loop || !v) return;
    v.load();
    v.play().catch(() => {});
  }, [loop]);

  // The 3D pauses while the reel plays on screen.
  useEffect(() => {
    setScenePaused(playing && inView);
    return () => setScenePaused(false);
  }, [playing, inView]);

  useEffect(() => withMotion(({ gsap, ScrollTrigger }) => {
    const el = root.current;
    const box = frame.current;
    if (!el || !box) return;
    // The star steps aside while the reel holds the screen.
    const stage = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 30%",
      onToggle: (self) => {
        setStory({ stage: self.isActive });
        setInView(self.isActive);
        // The loop only plays while the reel is on screen.
        const v = video.current;
        if (v?.currentSrc) {
          if (self.isActive) v.play().catch(() => {});
          else v.pause();
        }
      },
    });
    let stopWaiting: (() => void) | undefined;
    const approach = ScrollTrigger.create({
      trigger: el,
      start: "top bottom+=400",
      once: true,
      onEnter: () => {
        if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
        // Waits until the star has drawn, so on a slow connection the loop
        // never queues ahead of the 3D, then for an idle moment.
        const start = () => (window.requestIdleCallback ?? setTimeout)(() => setNear(true), { timeout: 2500 });
        if (getSceneReady()) return start();
        stopWaiting = subscribeEntry(() => {
          if (!getSceneReady()) return;
          stopWaiting?.();
          start();
        });
      },
    });
    // The frame zooms out to full size as it scrolls in, through a soft oval
    // mask that opens up, while the poster inside settles from a closer crop.
    const opens = getReducedMotion()
      ? null
      : gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "center 55%", scrub: 1.2 } })
          .fromTo(
            box,
            { scale: 0.8, y: 60, "--reel-round": "28px", "--reel-glow": 0, "--reel-mask": "18%" },
            { scale: 1, y: 0, "--reel-round": "14px", "--reel-glow": 1, "--reel-mask": "140%", ease: "none" },
            0,
          )
          .fromTo(box.querySelector(".reel-fallback"), { scale: 1.4 }, { scale: 1, ease: "none" }, 0);
    return () => {
      stage.kill();
      approach.kill();
      stopWaiting?.();
      opens?.scrollTrigger?.kill();
      opens?.kill();
      setStory({ stage: false });
    };
  }), []);

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
            <span className="reel-fallback" aria-hidden="true">
              <span>Showreel</span>
            </span>
            <video ref={video} className="reel-loop" poster={poster ? "/reel/poster.jpg" : undefined} muted loop playsInline autoPlay preload="none" aria-hidden="true">
              {loop && <source src="/reel/loop.webm" type="video/webm" />}
              {loop && <source src="/reel/loop.mp4" type="video/mp4" />}
            </video>
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
      <div className="reel-cta">
        <p>
          Motion graphics for venture-backed startups.
        </p>
        <div className="reel-book">
          <BookButton from="reel" />
          <p className="cta-note">{site.assurance}</p>
        </div>
      </div>
    </section>
  );
}
