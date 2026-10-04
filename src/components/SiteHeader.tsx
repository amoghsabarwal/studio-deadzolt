"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const nav = [
  { href: "/", label: "index" },
  { href: "/works", label: "works" },
  { href: "/about", label: "about" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={`${site.name}, home`}>
        <Image src="/brand/wordmark.svg" alt="" width={583} height={61} priority />
      </Link>
      <nav aria-label="Main">
        <ul>
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <a href={`mailto:${site.email}`} className="nav-cta">
              get in touch
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
