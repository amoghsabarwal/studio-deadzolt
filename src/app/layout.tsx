import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import BookingDialog from "@/components/BookingDialog";
import Cursor from "@/components/Cursor";
import HoloDriver from "@/components/HoloDriver";
import PageTransition from "@/components/PageTransition";
import SceneCanvas from "@/components/scene/SceneCanvas";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import TextFx from "@/components/TextFx";
import { site } from "@/content/site";
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
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${text.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll />
        <SceneCanvas />
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
        <BookingDialog />
        <Analytics />
      </body>
    </html>
  );
}
