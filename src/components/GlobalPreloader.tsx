"use client";

import { usePagePreloader } from "@/hooks/usePagePreloader";

export default function GlobalPreloader() {
  usePagePreloader();

  return null;
}
