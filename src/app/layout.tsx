import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import BookDock from "@/components/BookDock";
import BookingDialog from "@/components/BookingDialog";
import Cursor from "@/components/Cursor";
import EntryGate from "@/components/EntryGate";
import HoloDriver from "@/components/HoloDriver";
import MotionDriver from "@/components/MotionDriver";
import PageTransition from "@/components/PageTransition";
import SceneLoader from "@/components/scene/SceneLoader";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import TextFx from "@/components/TextFx";
import { site } from "@/content/site";
import { ENTRY_SKIP_SCRIPT } from "@/lib/story";
import "./globals.css";

// Text and headings: Inter Tight. Labels: JetBrains Mono.
const text = Inter_Tight({
  variable: "--font-text",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Share cards and absolute links resolve against deadzolt.studio.
  metadataBase: new URL(site.url),
  title: {
    default: site.search.title,
    template: `%s · ${site.name}`,
  },
  description: site.search.description,
  applicationName: site.name,
  authors: [{ name: site.founder, url: site.url }],
  creator: site.founder,
  // Each page sets its own canonical address; this covers the share card text.
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", creator: "@deadzoltt" },
  // Search Console's meta tag, if the studio verifies that way instead of DNS.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${text.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {/* Returning or campaign visitors skip the entry screen, decided before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: ENTRY_SKIP_SCRIPT }} />
        <noscript>
          <style>{".entry{display:none}"}</style>
        </noscript>
        <EntryGate />
        <SmoothScroll />
        <SceneLoader />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <HoloDriver />
        <PageTransition />
        <TextFx />
        <Cursor />
        <MotionDriver />
        <BookDock />
        <BookingDialog />
        <Analytics />
      </body>
    </html>
  );
}
