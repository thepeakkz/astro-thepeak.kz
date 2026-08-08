import { allCasesData } from "@/data/cases";
import { targetCases } from "@/data/target-cases";
import type { CaseData } from "@/app/cases/[slug]/CaseClient";

const staticCaseMeta: Record<string, { year: string; profileUrl?: string }> = {
  ark: { year: "2025", profileUrl: "https://www.instagram.com/ark_detailing_alm/" },
  avtopilot: { year: "2020", profileUrl: "https://www.instagram.com/avtopilot__service" },
  bazisa: { year: "2025", profileUrl: "https://www.instagram.com/bazis.kz/" },
  blink: { year: "2024", profileUrl: "https://www.instagram.com/blink_map.kz" },
  bossxo: { year: "2026" },
  cadillac: { year: "2025", profileUrl: "https://www.instagram.com/cadillac.qazaqstan/" },
  diskokras: { year: "Ноябрь 2024" },
  "double-coffee": { year: "2025", profileUrl: "https://www.instagram.com/doublecoffee_almaty/" },
  gippo: { year: "2024", profileUrl: "https://www.instagram.com/gippo.kz" },
  "invictus-academy": { year: "2025" },
  lukoil: { year: "2025", profileUrl: "https://www.instagram.com/lukoil.lubricants.kz/" },
  mindofbody: { year: "2024", profileUrl: "https://www.instagram.com/mindofbody.almaty/" },
  onmacabim: { year: "2024", profileUrl: "https://www.instagram.com/onmacabim_cosmetic.kz" },
  puma: { year: "2024", profileUrl: "https://www.instagram.com/puma_fam_kz/" },
  racoon: { year: "2025", profileUrl: "https://www.instagram.com/sale_tyre/" },
  ris: { year: "2025", profileUrl: "https://www.instagram.com/ris.nazarbaeva/reels/" },
  sensata: { year: "2025", profileUrl: "https://www.instagram.com/sensata_almaty/" },
  velmar: { year: "2025", profileUrl: "https://www.instagram.com/velmar_kz/reels/" },
};

const narrativeOverrides: Record<string, Pick<CaseData, "contentBlocks">> = {
  bossxo: {
    contentBlocks: [
      {
        chapter: "01 / Задача",
        text: "Для Bossxo важно было показать мебель не только как товар, а как часть готового интерьера и повседневного сценария жизни. Коммуникация должна была работать на доверие, ощущение качества и желание рассмотреть продукт ближе.",
      },
      {
        chapter: "02 / Подход",
        text: "Мы выстроили SMM вокруг визуального контента: акцентировали материалы, формы, детали, сочетания в интерьере и понятные преимущества для покупателя. Контент стал спокойным, предметным и ориентированным на выбор.",
      },
      {
        chapter: "03 / Результат",
        text: "Кейс усилил digital-присутствие бренда и сделал коммуникацию более системной: продукт стал выглядеть дороже, понятнее и убедительнее для аудитории, которая выбирает мебель для дома или проекта.",
      },
    ],
  },
};

function isTargetCase(slug: string): slug is keyof typeof targetCases {
  return slug in targetCases;
}

export function getLegacyCaseData(slug: string): CaseData | null {
  if (isTargetCase(slug)) return targetCases[slug] as CaseData;

  const item = allCasesData.find((candidate) => candidate.href === `/cases/${slug}`);
  if (!item) return null;

  const meta = staticCaseMeta[slug];
  const heroUrl = item.video || item.image || "";
  const heroType = /\.(?:mp4|mov|m4v|webm)(?:\?|$)/i.test(heroUrl) ? "video" : "image";

  return {
    title: item.name,
    year: meta?.year || "",
    service: item.services.join(", "),
    industry: item.industry,
    hero_desc: item.text,
    insta_url: meta?.profileUrl,
    heroMedia: heroUrl ? { src: heroUrl, type: heroType } : undefined,
    ...narrativeOverrides[slug],
  };
}
