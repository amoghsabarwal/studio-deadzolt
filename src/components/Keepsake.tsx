"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import HoloLayers from "@/components/HoloLayers";
import { drawKeepsake, type KeepsakeFormat, toBlob, visitorLabel } from "@/lib/keepsake";
import { rollNumber } from "@/lib/motion/text";
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
    if (open && visitor?.number != null && number.current) rollNumber(number.current);
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
      <div className="keepsake-copy">
        <p className="label">You reached the end</p>
        <h2 id="keepsake-title">Thank you for your time. Here is something to keep.</h2>
        <p className="keepsake-note">
          {visitor?.number != null ? (
            <>
              You are visitor <span ref={number}>{label}</span> to this site. Your number is on a card made for your
              story or your feed.
            </>
          ) : (
            <>A card with your own code and the day you came, made for your story or your feed.</>
          )}
        </p>

        <div className="keepsake-formats" role="group" aria-label="Card size">
          <button type="button" className="chip" aria-pressed={format === "story"} onClick={() => setFormat("story")}>
            Story <span className="chip-count">9:16</span>
          </button>
          <button type="button" className="chip" aria-pressed={format === "post"} onClick={() => setFormat("post")}>
            Post <span className="chip-count">16:9</span>
          </button>
        </div>

        <button type="button" className="button button-primary button-foil" onClick={save}>
          {share ? "Share your keepsake" : "Download your keepsake"}
        </button>
      </div>

      <div className="keepsake-card" data-holo data-tier="holo" data-format={format}>
        <HoloLayers />
        <canvas ref={canvas} role="img" aria-label={`Deadzolt keepsake card, ${label}`} />
      </div>
    </section>
  );
}
