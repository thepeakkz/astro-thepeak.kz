"use client";

import React from "react";
import Navigation from "@/components/Navigation";
import { formatTypography } from "@/utils/typography";

import CasesProduxGrid from "@/components/CasesProduxGrid";
import { allCasesData } from "@/data/cases";
import type { CaseItem } from "@/data/cases";
import { cn } from "@/lib/utils";
import HeroWave from "@/components/ui/dynamic-wave-canvas-background";
import type { CmsEditorBlock } from "@/types/cms";

const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "180px 180px",
};

function contentText(content: Record<string, unknown>, key: string, fallback = "") {
  return typeof content[key] === "string" && content[key] ? String(content[key]) : fallback;
}

export default function CasesClient({ blocks, cases = allCasesData }: { blocks?: CmsEditorBlock[]; cases?: CaseItem[] }) {
  const [selectedService, setSelectedService] = React.useState("Все");
  const services = React.useMemo(
    () => ["Все", ...Array.from(new Set(cases.flatMap((caseItem) => caseItem.services)))],
    [cases],
  );
  const filteredCases = React.useMemo(() => {
    if (selectedService === "Все") {
      return cases;
    }

    return cases.filter((caseItem) => caseItem.services.includes(selectedService));
  }, [cases, selectedService]);

  const sections = blocks || [
    {
      id: "default-cases-hero",
      template: { type: "cases_hero" },
      content: {
        title: "Кейсы",
        description: "Проекты, разработанные нашей командой: от комплексного SMM до масштабного видеопроизводства.",
      },
    },
    { id: "default-cases-grid", template: { type: "cases_grid" }, content: {} },
  ];

  return (
    <>
      <Navigation />
      <div className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] min-h-screen relative overflow-hidden" style={{ backgroundColor: "#060606", color: "#ffffff" }}>
        {/* Шумовой слой */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] z-50" style={GRAIN_STYLE} />
        <HeroWave />

        {sections.map((section) => {
          if (section.template.type === "cases_hero") {
            return (
              <header key={section.id} className="relative z-10 border-b border-white/10 px-[var(--page-margin)] pb-12 pt-24">
                <h1 className="no-invert mb-4 font-sans text-5xl font-bold uppercase tracking-tighter md:text-7xl">
                  {formatTypography(contentText(section.content, "title", "Кейсы"))}
                </h1>
                <p className="no-invert max-w-xl font-mono text-xs text-white/60">
                  {formatTypography(contentText(section.content, "description", "Проекты, разработанные нашей командой: от комплексного SMM до масштабного видеопроизводства."))}
                </p>
              </header>
            );
          }

          if (section.template.type !== "cases_grid") return null;

          return (
            <section key={section.id} className="relative z-10 border-b border-white/10 px-[var(--page-margin)] py-16">
              <div className="w-full">
                <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Фильтр кейсов по услуге">
                  {services.map((service) => {
                    const isSelected = selectedService === service;

                    return (
                      <button
                        key={service}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedService(service)}
                        className={cn(
                          "shrink-0 border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                          isSelected
                            ? "border-white bg-white text-black"
                            : "border-white/15 bg-white/[0.03] text-white/60 hover:border-white/40 hover:text-white",
                        )}
                      >
                        {formatTypography(service)}
                      </button>
                    );
                  })}
                </div>

                {filteredCases.length > 0 ? (
                  <CasesProduxGrid cases={filteredCases} />
                ) : (
                  <p className="py-16 text-center font-mono text-xs uppercase tracking-widest text-white/50">
                    {formatTypography("Кейсы по этой услуге скоро появятся")}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
