import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import SofyaClient from "./sofya-client";
import NativePageGate from "@/components/cms/NativePageGate";
import { absoluteUrl, createSeoMetadata, getBreadcrumbJsonLd, pageSeo } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata(pageSeo.sofya);

export default function SofyaPage() {
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": absoluteUrl("/team/sofya#profile"),
    name: "Коломеец Софья",
    description: pageSeo.sofya.description,
    url: absoluteUrl("/team/sofya"),
    mainEntity: {
      "@type": "Person",
      name: "Коломеец Софья",
      jobTitle: ["Маркетолог", "Продюсер", "Бренд-стратег"],
      worksFor: {
        "@id": absoluteUrl("/#organization"),
      },
      knowsAbout: ["маркетинг", "SMM", "брендинг", "продакшн", "Казахстан", "Алматы", "Астана"],
    },
  };

  return (
    <NativePageGate routePath="/team/sofya">
      <JsonLd
        data={[
          getBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Коломеец Софья", path: "/team/sofya" },
          ]),
          profileJsonLd,
        ]}
      />
      <SofyaClient />
    </NativePageGate>
  );
}
