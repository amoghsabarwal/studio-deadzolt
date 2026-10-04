"use client";

import { useEffect } from "react";
import { setFocus } from "@/lib/focus";

// Puts a case study's discipline piece on stage as the page's hero object.
export default function CaseFocus({ discipline }: { discipline: string }) {
  useEffect(() => {
    setFocus(discipline, "case");
    return () => setFocus(null);
  }, [discipline]);
  return null;
}
