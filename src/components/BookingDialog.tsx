"use client";

import { track } from "@vercel/analytics";
import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";
import { bookingEmbed, bookingLink, site } from "@/content/site";
import { count } from "@/lib/count";
import { setScenePaused } from "@/lib/story";

// Every booking button opens Calendly over the site instead of sending the
// visitor to another tab, and each step is counted: which button was pressed,
// and whether a call was booked. Without JavaScript the buttons still open
// Calendly in a new tab.
export default function BookingDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [from, setFrom] = useState<string | null>(null);
  // The button behind the open popup, so a booking is counted against it.
  const opener = useRef<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  // Warm the connection to Calendly up front, so the calendar starts loading
  // the moment the popup opens.
  preconnect("https://calendly.com");
  preconnect("https://assets.calendly.com", { crossOrigin: "anonymous" });

  useEffect(() => {
    const click = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-book]");
      if (!link) return;
      const source = link.dataset.book ?? "unknown";
      opener.current = source;
      // Let a new-tab click (cmd, ctrl, middle button) do what it asks.
      if (!(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) {
        e.preventDefault();
        // The popup opens first; the 3D behind it holds still while it is open.
        dialog.current?.showModal();
        setFrom(source);
        setScenePaused(true, "booking");
      }
      // Counted after the popup is up, so counting never delays it.
      track("Book click", { from: source });
      count("book", source);
    };
    // Calendly reports a finished booking from inside its frame.
    const message = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string } | null;
      if (data?.event !== "calendly.event_scheduled") return;
      track("Call booked");
      count("booked", opener.current);
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
      onClose={() => {
        setScenePaused(false, "booking");
        setFrom(null);
        setLoaded(false);
      }}
      onClick={(e) => {
        // A click on the backdrop closes it.
        if (e.target === dialog.current) dialog.current?.close();
      }}
    >
      <header className="booking-bar">
        <p className="label">
          <span className="dot" aria-hidden="true" /> {site.cta}
          <span className="booking-long"> · 30 min</span>
        </p>
        <div className="booking-actions">
          {/* A way out if the calendar can't load here (an ad blocker, a
              company firewall, a Calendly outage): the same page in a tab. */}
          {from && (
            <a
              className="booking-tab label"
              href={bookingLink(from).href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => count("book", `${from}-tab`)}
            >
              <span className="booking-long">Open in </span>Calendly ↗
            </a>
          )}
          <button type="button" className="booking-close label" onClick={() => dialog.current?.close()}>
            Close ✕
          </button>
        </div>
      </header>
      <div className="booking-frame" data-loaded={loaded || undefined}>
        <p className="label booking-wait" aria-hidden={loaded}>
          Loading the calendar
        </p>
        {from && (
          <iframe
            src={bookingEmbed(from, location.host)}
            title="Book a call with Studio Deadzolt"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </dialog>
  );
}
