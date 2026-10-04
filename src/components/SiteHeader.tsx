"use client";

import BookButton from "@/components/BookButton";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const nav = [
  { href: "/works", label: "Work" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About" },
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
            const active = !item.href.includes("#") && pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <BookButton from="header" small />
          </li>
        </ul>
      </nav>
    </header>
  );
}
