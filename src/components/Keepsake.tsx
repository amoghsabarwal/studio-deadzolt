"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import HoloLayers from "@/components/HoloLayers";
import { drawKeepsake, type KeepsakeFormat, toBlob, visitorLabel } from "@/lib/keepsake";
import { loadMotion } from "@/lib/motion/load";
import { getVisitor, startVisitor, subscribeVisitor } from "@/lib/visitor";

const noop = () => () => {};

// Phones that can hand a file to the share sheet (Instagram, X, Messages).
function canShareFiles() {
  try {
    const probe = new File([new Blob()], "probe.png", { type: "image/png" });
    return !!navigator.canShare?.({ files: [probe] });
  } catch {
    return false;
  }
}

// A thank-you at the end of every page: the visitor's number on a branded
// card that tilts like the pricing cards, ready to share or save.
export default function Keepsake() {
  const visitor = useSyncExternalStore(subscribeVisitor, getVisitor, () => null);
  const share = useSyncExternalStore(noop, canShareFiles, () => false);
  const [format, setFormat] = useState<KeepsakeFormat>("story");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  // The image is ready before the tap, so the share sheet opens straight
  // from the visitor's gesture (Safari needs that).
  const blob = useRef<Blob | null>(null);

  useEffect(() => {
    startVisitor();
  }, []);

  // Opens when the visitor reaches the bottom.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOpen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open || !canvas.current) return;
    let live = true;
    blob.current = null;
    drawKeepsake(canvas.current, format, visitor).then(async () => {
      if (!live || !canvas.current) return;
      blob.current = await toBlob(canvas.current);
    });
    return () => {
      live = false;
    };
  }, [open, format, visitor]);

  useEffect(() => {
    if (!open || visitor?.number == null) return;
    loadMotion().then(({ rollNumber }) => {
      if (number.current) rollNumber(number.current);
    });
  }, [open, visitor?.number]);

  const fileName = `deadzolt-keepsake-${format}.png`;

  async function save() {
    const data = blob.current ?? (canvas.current && (await toBlob(canvas.current)));
    if (!data) return;
    const file = new File([data], fileName, { type: "image/png" });
    if (share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My Deadzolt keepsake",
          text: `${visitorLabel(visitor)} at deadzolt.studio`,
        });
      } catch {}
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const label = visitorLabel(visitor);

  return (
    <section ref={root} className="keepsake" data-open={open || undefined} aria-labelledby="keepsake-title">
      <div className="keepsake-card" data-holo data-tier="holo" data-format={format}>
        <HoloLayers />
        <canvas ref={canvas} role="img" aria-label={`Deadzolt keepsake card, ${label}`} />
      </div>

      <div className="keepsake-copy">
        <h2 id="keepsake-title">Thanks for your time. Here&apos;s a keepsake.</h2>
        <p className="keepsake-note">
          {visitor?.number != null ? (
            <>
              You are visitor <span ref={number}>{label}</span>. Share your card to your story or feed.
            </>
          ) : (
            <>Your own card with the day you came, sized for your story or feed.</>
          )}
        </p>
      </div>

      <div className="keepsake-actions">
        <div className="keepsake-formats" role="group" aria-label="Card size">
          <button type="button" className="chip" aria-pressed={format === "story"} onClick={() => setFormat("story")}>
            Story
          </button>
          <button type="button" className="chip" aria-pressed={format === "post"} onClick={() => setFormat("post")}>
            Post
          </button>
        </div>
        <button type="button" className="button" onClick={save}>
          {share ? "Share" : "Download"}
        </button>
      </div>
    </section>
  );
}
