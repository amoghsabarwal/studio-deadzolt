"use client";

import { useSyncExternalStore } from "react";

const ZONE = "Asia/Kolkata";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
}

function minuteKey() {
  return Math.floor(Date.now() / 60_000);
}

// The time in Indore right now, and how far the visitor is from it, so a
// studio on the other side of the world reads as real people in a real place.
export default function StudioClock() {
  const minute = useSyncExternalStore(subscribe, minuteKey, () => 0);
  if (!minute) return null;

  const now = new Date(minute * 60_000);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: ZONE }).format(now);
  // Minutes between the visitor's clock and Indore's (IST is UTC+5:30).
  const diff = 330 + now.getTimezoneOffset();
  let away = "";
  if (diff !== 0) {
    const h = Math.floor(Math.abs(diff) / 60);
    const m = Math.abs(diff) % 60;
    away = ` · you're ${h ? `${h}h` : ""}${h && m ? " " : ""}${m ? `${m}m` : ""} ${diff > 0 ? "behind" : "ahead"}`;
  }

  return (
    <span className="studio-clock">
      <time dateTime={now.toISOString()}>{time} IST</time>
      {away}
    </span>
  );
}
