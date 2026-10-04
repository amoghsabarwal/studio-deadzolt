"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookButton from "./BookButton";

// Phones: a booking button docked at the bottom of the screen once the
// visitor is past the opening screen, out of the way while another booking
// ask (the closing card, the footer) is already in view.
export default function BookDock() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const asks = Array.from(document.querySelectorAll(".call-card, .site-footer"));
    const visible = new Set<Element>();
    let pastTop = false;
    const update = () => setShown(pastTop && visible.size === 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      update();
    });
    asks.forEach((a) => io.observe(a));
    const scroll = () => {
      const next = window.scrollY > window.innerHeight * 0.8;
      if (next === pastTop) return;
      pastTop = next;
      update();
    };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", scroll);
    };
  }, [pathname]);

  return (
    <div className="book-dock" data-shown={shown || undefined} aria-hidden={!shown} inert={!shown}>
      <BookButton from="dock" />
    </div>
  );
}
