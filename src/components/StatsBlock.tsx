import React from "react";
import { formatTypography } from "@/utils/typography";

export default function StatsBlock() {
  return (
    <section
      className="w-full relative overflow-hidden h-auto select-none py-4 md:py-0 md:h-[15vh] md:min-h-[128px] flex items-center"
      id="hero-stats"
    >
      <div className="swiss-grid w-full h-full items-stretch md:items-center">
        {/* Card 1: 83% Retention */}
        <div className="col-span-12 md:col-span-4 flex items-center gap-4 h-full py-5 md:py-2 border-b md:border-b-0">
          <div className="flex min-w-0 flex-col text-left justify-center">
            <div className="no-invert font-headline font-semibold text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] text-brand-gray leading-[1.1]">
              <span className="text-brand-orange">{formatTypography("83% заказчиков")}</span>{" "}
              {formatTypography("остаются с нами на долгосрочное сотрудничество 3+ лет")}
            </div>
          </div>
        </div>

        {/* Card 2: 10+ Years Experience */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-4 h-full py-5 md:py-2 border-b md:border-b-0 md:border-l md:border-r border-brand-gray/10 md:px-6">
          <div className="flex min-w-0 flex-col text-left justify-center">
            <div className="no-invert font-headline font-semibold text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] text-brand-gray leading-[1.1]">
              <span className="text-brand-orange">{formatTypography("10+ лет")}</span>{" "}
              {formatTypography("опыта")}
            </div>
          </div>
        </div>

        {/* Card 3: 150+ Projects */}
        <div className="col-span-12 md:col-span-5 flex items-center gap-4 h-full py-5 md:py-2">
          <div className="flex min-w-0 flex-col text-left justify-center">
            <span className="no-invert font-headline font-semibold text-brand-orange text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.1] block mb-1.5">
              {formatTypography("150+ проектов")}
            </span>
            <div className="no-invert font-sans font-medium text-[clamp(1.15rem,4.5vw,1.75rem)] md:text-[clamp(0.85rem,0.85vw,0.9rem)] text-brand-gray/80 leading-[1.12] md:leading-snug">
              {formatTypography(
                "Объединяем опыт большой команды специалистов, где каждый знает свою зону ответственности. Благодаря этому одинаково эффективно реализуем как локальные задачи малого бизнеса, так и масштабные проекты крупных компаний."
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
