"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

const SRC = "https://gumroad.com/js/gumroad.js";
let loading: Promise<void> | null = null;

// Gumroad's overlay script turns product links into a checkout that opens
// over the site. It is fetched only when a visitor reaches for a buy button
// (hover, focus or touch), so the shop page loads nothing from Gumroad up
// front.
function loadGumroad() {
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("gumroad.js failed to load"));
    };
    document.body.appendChild(script);
  });
  return loading;
}

function buyLink(e: Event) {
  return (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-product]") ?? null;
}

// Each press of a buy button is counted, so the shop shows which products
// people reach for. A press that beats the script waits for it, then hands
// the click to Gumroad; if Gumroad can't load, the product page opens in a
// new tab instead.
export default function ShopCheckout() {
  useEffect(() => {
    let ready = false;
    let replaying = false;

    const warm = (e: Event) => {
      if (!buyLink(e)) return;
      loadGumroad().then(
        () => (ready = true),
        () => {},
      );
    };

    const click = (e: MouseEvent) => {
      const link = buyLink(e);
      if (!link || replaying) return;
      track("Shop click", { product: link.dataset.product ?? "unknown" });
      if (ready || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000));
      Promise.race([loadGumroad(), timeout]).then(
        () => {
          ready = true;
          replaying = true;
          link.click();
          replaying = false;
        },
        () => window.open(link.href, "_blank", "noopener"),
      );
    };

    document.addEventListener("pointerover", warm);
    document.addEventListener("focusin", warm);
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("pointerover", warm);
      document.removeEventListener("focusin", warm);
      document.removeEventListener("touchstart", warm);
      document.removeEventListener("click", click);
    };
  }, []);

  return null;
}
