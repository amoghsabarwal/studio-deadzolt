"use client";

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getProject } from "@/content/site";
import { setDomCursorLabel } from "@/lib/cursor";
import { clearHoverFocus } from "@/lib/focus";
import { getReducedMotion } from "@/lib/story";

function labelFor(pathname: string) {
  if (pathname === "/") return "Studio";
  if (pathname === "/works") return "Works";
  if (pathname === "/about") return "About";
  if (pathname === "/shop") return "Shop";
  const project = pathname.startsWith("/works/") ? getProject(pathname.split("/")[2] ?? "") : undefined;
  return project?.title ?? "Studio Deadzolt";
}

// Lifts the curtain off a freshly loaded page and brings its [data-enter]
// elements up behind it.
function liftCurtain(el: HTMLElement, covering: { current: boolean }) {
  // Give the new page a frame to lay out before the curtain lifts.
  requestAnimationFrame(() => {
    gsap
      .timeline({
        onComplete: () => {
          covering.current = false;
        },
      })
      .to(el, { yPercent: -100, duration: 0.8, ease: "expo.inOut", delay: 0.1 })
      .set(el, { visibility: "hidden" });
    const enter = gsap.utils.toArray<HTMLElement>("[data-enter]");
    if (enter.length) {
      gsap.fromTo(
        enter,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: 0.45, clearProps: "transform,opacity" },
      );
    }
  });
}

// Moving between pages: a black curtain rises over the page with the name of
// where you are going, the new page loads behind it, and the curtain carries
// on up and away. Internal links are caught here, so every link on the site
// gets the same transition without wrapping each one.
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);
  const fallback = useRef(0);

  useEffect(() => {
    const el = curtain.current;
    if (!el) return;

    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest("a");
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      // Other sites, mailto links and jumps within the same page are left alone.
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (getReducedMotion()) return;

      e.preventDefault();
      e.stopPropagation();
      if (covering.current) return;
      covering.current = true;
      if (label.current) label.current.textContent = labelFor(url.pathname);

      const href = url.pathname + url.search + url.hash;
      router.prefetch(href);
      gsap
        .timeline()
        .set(el, { visibility: "visible", yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
        .add(() => router.push(href));
      // Never leave the page covered if the navigation stalls.
      fallback.current = window.setTimeout(() => {
        if (covering.current) liftCurtain(el, covering);
      }, 4000);
    };

    // Capture on window runs before Next's own link handling, so one handler
    // can hold the navigation until the curtain is down.
    window.addEventListener("click", click, true);
    return () => window.removeEventListener("click", click, true);
  }, [router]);

  useEffect(() => {
    clearHoverFocus();
    setDomCursorLabel("");
    window.clearTimeout(fallback.current);
    if (covering.current && curtain.current) liftCurtain(curtain.current, covering);
  }, [pathname]);

  return (
    <div ref={curtain} className="transition" aria-hidden="true">
      <span className="transition-dot" />
      <span ref={label} className="label transition-label" />
    </div>
  );
}
