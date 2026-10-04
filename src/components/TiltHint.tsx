"use client";

import { useState, useSyncExternalStore } from "react";
import { isGyroEnabled, needsMotionPermission, requestMotionPermission, startGyro, subscribeGyro } from "@/lib/tilt";

const noop = () => () => {};

// On iPhones motion needs a tap to allow it. This chip asks once; elsewhere
// (Android, desktop) it never shows.
export default function TiltHint() {
  const askable = useSyncExternalStore(
    noop,
    () => needsMotionPermission() && window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
  const enabled = useSyncExternalStore(subscribeGyro, isGyroEnabled, () => false);
  const [denied, setDenied] = useState(false);
  if (!askable || enabled || denied) return null;

  return (
    <button
      type="button"
      className="tilt-hint label"
      onClick={async () => {
        if (await requestMotionPermission()) startGyro();
        else setDenied(true);
      }}
    >
      <span aria-hidden="true">✦</span> Tilt your phone to see the foil
    </button>
  );
}
