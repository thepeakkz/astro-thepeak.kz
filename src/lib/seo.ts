import type { Metadata } from "next";
import { CONTACTS } from "@/config/contacts";
import { allCasesData } from "@/data/cases";

export const SITE_URL = "https://www.thepeak.kz";
export const SITE_NAME = "ThePeak";

export const SEO_GEO = {
  country: "Казахстан",
  primaryCity: "Алматы",
  secondaryCity: "Астана",
  areaServed: ["Казахстан", "Алматы", "Астана"],
} as const;

export type SeoPageConfig = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const defaultKeywords = [
  "маркетинговое агентство Казахстан",
  "маркетинговое агентство Алматы",
  "маркетинговое агентство Астана",
  "digital агентство Казахстан",
  "SMM Алматы",
  "SMM Астана",
  "разработка сайтов Казахстан",
  "брендинг Казахстан",
  "продакшн Казахстан",
];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createSeoMetadata(config: SeoPageConfig): Metadata {
  const url = absoluteUrl(config.path);

  return {
    metadataBase: new URL(SITE_URL),
    title: config.title,
    description: config.description,
    keywords: [...defaultKeywords, ...(config.keywords ?? [])],
    alternates: {
      canonical: config.path,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      siteName: SITE_NAME,
      locale: "ru_KZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const pageSeo = {
  home: {
    title: "ThePeak — маркетинговое агентство в\u00a0Казахстане, Алматы и\u00a0Астане",
    description:
      "Маркетинговое агентство ThePeak помогает бизнесу в\u00a0Казахстане, Алматы и\u00a0Астане запускать SMM, digital-стратегии, брендинг, сайты и\u00a0продакшн под измеримый результат.",
    path: "/",
    keywords: ["маркетинг Алматы", "маркетинг Астана", "рекламное агентство Казахстан"],
  },
  cases: {
    title: "Кейсы ThePeak — SMM, digital и\u00a0продакшн для бизнеса в\u00a0Казахстане",
    description:
      "Портфолио ThePeak: кейсы по\u00a0SMM, digital-маркетингу, брендингу, сайтам и\u00a0видеопродакшну для компаний в\u00a0Казахстане, Алматы и\u00a0Астане.",
    path: "/cases",
    keywords: ["кейсы SMM Казахстан", "портфолио маркетингового агентства"],
  },
  web: {
    title: "Разработка сайтов в\u00a0Казахстане, Алматы и\u00a0Астане — ThePeak",
    description:
      "ThePeak разрабатывает лендинги, корпоративные сайты, промо-сайты и\u00a0интернет-магазины для бизнеса в\u00a0Казахстане, Алматы и\u00a0Астане с\u00a0маркетингом, UX/UI и\u00a0аналитикой.",
    path: "/services/web",
    keywords: ["разработка сайтов Алматы", "разработка сайтов Астана", "создание сайта Казахстан"],
  },
  gallery: {
    title: "Галерея ThePeak — визуальные проекты и\u00a0контент для брендов",
    description:
      "Галерея визуальных материалов ThePeak: контент, digital-подача и\u00a0креативные решения для брендов из\u00a0Казахстана, Алматы и\u00a0Астаны.",
    path: "/gallery",
    keywords: ["визуальный контент Казахстан", "контент Алматы"],
  },
  sofya: {
    title: "Коломеец Софья — маркетинговые кейсы ThePeak в\u00a0Казахстане",
    description:
      "Портфолио Софьи Коломеец: маркетинговые, SMM и\u00a0продакшн-проекты для брендов в\u00a0Казахстане, включая Алматы и\u00a0Астану.",
    path: "/team/sofya",
    keywords: ["маркетолог Казахстан", "SMM проекты Алматы"],
  },
  privacy: {
    title: "Политика конфиденциальности — ThePeak",
    description:
      "Политика конфиденциальности сайта ThePeak для пользователей из\u00a0Казахстана, включая Алматы и\u00a0Астану.",
    path: "/privacy",
    keywords: ["политика конфиденциальности Казахстан"],
  },
} satisfies Record<string, SeoPageConfig>;

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACTS.email,
    telephone: CONTACTS.phone.display,
    address: {
      "@type": "PostalAddress",
      addressLocality: SEO_GEO.primaryCity,
      addressCountry: "KZ",
      addressRegion: SEO_GEO.primaryCity,
    },
    areaServed: SEO_GEO.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACTS.phone.display,
      email: CONTACTS.email,
      contactType: "sales",
      areaServed: "KZ",
      availableLanguage: ["ru", "kk"],
    },
    sameAs: [CONTACTS.telegramUrl, CONTACTS.whatsappUrl],
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-KZ",
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
    potentialAction: {
      "@type": "ContactAction",
      target: absoluteUrl("/#contacts"),
      name: "Обсудить проект",
    },
  };
}

export function getBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function getServiceJsonLd(service: {
  name: string;
  description: string;
  path: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${service.path}#service`),
    name: service.name,
    description: service.description,
    serviceType: service.serviceType ?? service.name,
    provider: {
      "@id": absoluteUrl("/#organization"),
    },
    areaServed: SEO_GEO.areaServed.map((name) => ({
      "@type": "Place",
      name,
    })),
    url: absoluteUrl(service.path),
  };
}

export function getCaseJsonLd(caseItem: {
  title: string;
  description: string;
  path: string;
  industry: string;
  service: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": absoluteUrl(`${caseItem.path}#case`),
    name: caseItem.title,
    headline: caseItem.title,
    description: caseItem.description,
    url: absoluteUrl(caseItem.path),
    inLanguage: "ru-KZ",
    about: [
      caseItem.industry,
      caseItem.service,
      "маркетинг в\u00a0Казахстане",
      "digital-продвижение в\u00a0Алматы и\u00a0Астане",
    ],
    creator: {
      "@id": absoluteUrl("/#organization"),
    },
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };
}

export function getCaseSeoBySlug(slug: string) {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  const caseItem = allCasesData.find((item) => item.href === `/cases/${normalizedSlug}`);

  if (!caseItem) {
    return null;
  }

  const description = `${caseItem.text} Кейс ThePeak по\u00a0направлению ${caseItem.services.join(", ")} для бизнеса в\u00a0Казахстане, Алматы и\u00a0Астане.`;

  return {
    title: `${caseItem.name} — кейс ThePeak: ${caseItem.type} в\u00a0Казахстане`,
    description,
    path: caseItem.href,
    keywords: [
      `${caseItem.name} кейс`,
      `${caseItem.type} Казахстан`,
      `${caseItem.industry} маркетинг Казахстан`,
      "SMM Алматы",
      "SMM Астана",
    ],
    caseItem: {
      title: caseItem.name,
      description,
      path: caseItem.href,
      industry: caseItem.industry,
      service: caseItem.services.join(", "),
    },
  };
}

export function createCaseMetadata(slug: string): Metadata {
  const seo = getCaseSeoBySlug(slug);

  if (!seo) {
    return createSeoMetadata(pageSeo.cases);
  }

  return createSeoMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
  });
}

export function getCasePageJsonLd(slug: string) {
  const seo = getCaseSeoBySlug(slug);

  if (!seo) {
    return getBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Кейсы", path: "/cases" },
    ]);
  }

  return [
    getBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Кейсы", path: "/cases" },
      { name: seo.caseItem.title, path: seo.caseItem.path },
    ]),
    getCaseJsonLd(seo.caseItem),
  ];
}
