import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SHOW_TEMPORARILY_HIDDEN_PAGES } from "@/config/page-visibility";

export default function GalleryLayout({ children }: { children: ReactNode }) {
  if (!SHOW_TEMPORARILY_HIDDEN_PAGES) {
    notFound();
  }

  return children;
}
