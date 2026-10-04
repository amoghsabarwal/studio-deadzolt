"use client";

import { useEffect, useRef, useState } from "react";
import { bookingEmbed } from "@/content/site";

// The calendar itself, in the closing section of the home page. It loads
// only when the visitor gets near it, so it costs nothing up front.
export default function BookingEmbed({ from }: { from: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className="booking-embed">
      {near && <iframe src={bookingEmbed(from, location.host)} title="Book a call with Studio Deadzolt" loading="lazy" />}
    </div>
  );
}
