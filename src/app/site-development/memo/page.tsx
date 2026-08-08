import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";
import SiteDevelopmentMemoClient from "./SiteDevelopmentMemoClient";
import NativePageGate from "@/components/cms/NativePageGate";

const title = "Памятка по заголовкам /site-development — The Peak";
const description = "Полный список заголовков, используемых классов и стилей на странице разработки сайтов под ключ.";

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: "/site-development/memo",
  keywords: ["памятка заголовков", "стили заголовков", "разработка сайтов"],
});

export default function SiteDevelopmentMemoPage() {
  return (
    <NativePageGate routePath="/site-development/memo">
      <SiteDevelopmentMemoClient />
    </NativePageGate>
  );
}
