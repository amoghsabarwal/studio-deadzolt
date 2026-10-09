"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getLite, subscribeLite } from "@/lib/lite";
import { getReducedMotion, subscribeReducedMotion } from "@/lib/story";

type Props = { src: string; poster: string; width: number; height: number; label: string };

// A silent loop from a work. Until it nears the screen it is only its poster
// frame; then it loads, plays while in view and pauses once scrolled past.
// Lite devices and reduced motion keep the poster with play controls, so
// nothing downloads unless the visitor asks for it.
export default function LoopVideo({ src, poster, width, height, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const lite = useSyncExternalStore(subscribeLite, getLite, () => true);
  const still = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const auto = lite === false && !still;

  useEffect(() => {
    const v = ref.current;
    if (!v || !auto) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        setInView(entry.isIntersecting);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [auto]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !auto || !near) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [auto, near, inView]);

  return (
    <video
      ref={ref}
      className="work-video"
      src={near || !auto ? src : undefined}
      poster={poster}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      controls={!auto}
      aria-label={label}
    />
  );
}
