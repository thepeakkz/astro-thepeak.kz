"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { allCasesData } from "@/data/cases";
import { formatTypography } from "@/utils/typography";
import CasesProduxGrid from "@/components/CasesProduxGrid";

// Filter and order cases specifically requested for the homepage:
// Лукойл, Компасс, Гиппо, Пума, Шандинг, Сенсата, Базис, Дискокрас, Онмакабин
const homeCasesOrder = [
  "/cases/lukoil",
  "/cases/shanding-logistics",
  "/cases/gippo",
  "/cases/puma",
  "/cases/compass",
  "/cases/sensata",
  "/cases/bazisa",
  "/cases/onmacabim",
  "/cases/diskokras",
  "/cases/cadillac",
];

const homeCases = homeCasesOrder
  .map((href) => allCasesData.find((caseItem) => caseItem.href === href))
  .filter((caseItem): caseItem is typeof allCasesData[number] => !!caseItem);


export default function CasesMasonrySection() {
  return (
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] overflow-hidden pt-[16.6vh] max-lg:pt-[11.7vh] max-sm:pt-[6.86vh] pb-[11.67vh] bg-[#0B0B0C] text-[#F2F2F2] select-none scroll-mt-[clamp(2rem,2.8vw,3.5rem)] relative"
      id="cases"
    >
      {/* Header section (Aligned to default swiss-grid, matching Produx style but keeping Russian copywriting) */}
      <div className="swiss-grid pb-[6vh] flex items-end justify-between">
        <div className="col-span-8 lg:col-span-9 overflow-hidden text-left flex flex-col gap-4">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
            className="font-headline text-[clamp(1.4rem,2.45vw,2.24rem)] font-semibold leading-[1.1] text-[#F2F2F2] text-left"
          >
            {formatTypography("За\u00a0каждым кейсом стоят стратегия, сильная команда и\u00a0конкретные показатели.")}
          </motion.h2>
          <motion.p
            initial={{ y: "50%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-sans font-medium text-white/50 text-[clamp(0.95rem,1.05vw,1.1rem)] leading-relaxed max-w-xl text-left"
          >
            {formatTypography("Мы\u00a0работаем с\u00a0бизнесом, который хочет расти, а\u00a0не\u00a0просто присутствовать в\u00a0digital.")}
          </motion.p>
        </div>

        <div className="col-span-4 lg:col-span-3 flex justify-end items-end h-full self-end pb-2">
          <Link href="/cases" className="group flex flex-col items-end">
            <div className="projects-sections-see-all-link font-sans text-[clamp(0.8rem,1vw,1.1rem)] font-bold uppercase tracking-wider text-[#F2F2F2] flex items-center gap-[0.4vw] mb-[0.5vh] transition-colors duration-200 hover:text-white">
              <span>{formatTypography("Все кейсы")}</span>
            </div>
            <div className="bg-[#F2F2F2] h-px w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>
        </div>
      </div>

      {/* Projects Grid Rows (All aligned to standard swiss-grid) */}
      <CasesProduxGrid cases={homeCases} limit={12} />

      {/* Bottom Button "Все кейсы" */}
      <div className="w-full mt-[8vh] flex justify-center">
        <Button01
          href="/cases"
          text={formatTypography("Все кейсы")}
          variant="dark"
        />
      </div>
    </section>
  );
}
