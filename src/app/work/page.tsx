import type { Metadata } from "next";
import WorkGrid from "@/components/WorkGrid";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected 3D, motion, branding and art direction projects.",
};

export default function WorkPage() {
  return (
    <section className="section page-top">
      <h1>Work</h1>
      <WorkGrid />
    </section>
  );
}
