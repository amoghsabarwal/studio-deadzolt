"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { bookingEmbed } from "@/content/site";

// Every booking button opens Calendly over the site instead of sending the
// visitor to another tab, and each step is counted: which button was pressed,
// and whether a call was booked. Without JavaScript the buttons still open
// Calendly in a new tab.
export default function BookingDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-book]");
      if (!link) return;
      const source = link.dataset.book ?? "unknown";
      track("Book click", { from: source });
      // Let a new-tab click (cmd, ctrl, middle button) do what it asks.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      setFrom(source);
      dialog.current?.showModal();
    };
    // Calendly reports a finished booking from inside its frame.
    const message = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string } | null;
      if (data?.event === "calendly.event_scheduled") track("Call booked");
    };
    document.addEventListener("click", click);
    window.addEventListener("message", message);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("message", message);
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="booking-dialog"
      aria-label="Book a call"
      onClose={() => setFrom(null)}
      onClick={(e) => {
        // A click on the backdrop closes it.
        if (e.target === dialog.current) dialog.current?.close();
      }}
    >
      <button type="button" className="booking-close label" onClick={() => dialog.current?.close()}>
        Close ✕
      </button>
      {from && <iframe src={bookingEmbed(from)} title="Book a call with Studio Deadzolt" />}
    </dialog>
  );
}
