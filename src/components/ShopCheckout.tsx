"use client";

import { track } from "@vercel/analytics";
import Script from "next/script";
import { useEffect } from "react";

// Gumroad's overlay script turns every product link on the page into a
// checkout that opens over the site. Each press of a buy button is counted,
// so the shop shows which products people reach for.
export default function ShopCheckout() {
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[data-product]");
      if (link) track("Shop click", { product: link.dataset.product ?? "unknown" });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);

  return <Script id="gumroad" src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />;
}
