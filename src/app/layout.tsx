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
  // Share cards resolve against the live Vercel domain until deadzolt.studio
  // points at this site (it still serves the old Framer site).
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : site.url,
  ),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
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
