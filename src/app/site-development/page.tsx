import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";
import SiteDevelopmentClient from "./SiteDevelopmentClient";
import NativePageGate from "@/components/cms/NativePageGate";

const title = "Разработка сайтов под ключ — The Peak";
const description =
  "The Peak разрабатывает сайты под ключ: от\u00a0маркетинговой стратегии и\u00a0структуры до\u00a0дизайна, запуска и\u00a0продвижения. Лендинги, корпоративные сайты и\u00a0интернет-магазины.";

export const metadata: Metadata = createSeoMetadata({
  title,
  description,
  path: "/site-development",
  keywords: [
    "разработка сайтов под ключ",
    "создание лендинга",
    "корпоративный сайт",
    "интернет-магазин",
  ],
});

export default function SiteDevelopmentPage() {
  return (
    <NativePageGate routePath="/site-development">
      <SiteDevelopmentClient />
    </NativePageGate>
  );
}
