import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import WebClient from "./web-client";
import { createSeoMetadata, getBreadcrumbJsonLd, getServiceJsonLd, pageSeo } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata(pageSeo.web);

export default function SitesPage() {
  return (
    <>
      <JsonLd
        data={[
          getBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Разработка сайтов", path: "/services/web" },
          ]),
          getServiceJsonLd({
            name: "Разработка сайтов в\u00a0Казахстане",
            description:
              "Создание лендингов, корпоративных сайтов, промо-сайтов и\u00a0интернет-магазинов для бизнеса в\u00a0Казахстане, Алматы и\u00a0Астане.",
            path: "/services/web",
            serviceType: "Разработка сайтов",
          }),
        ]}
      />
      <WebClient />
    </>
  );
}
