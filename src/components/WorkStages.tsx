"use client";

import React, { useState } from "react";
import { Search, Target, Layers, Cpu, Rocket, Sliders, BarChart, TrendingUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";

interface Stage {
  id: string;
  num: string;
  title: string;
  description: string;
  iconName: string;
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Search,
  Target,
  Layers,
  Cpu,
  Rocket,
  Sliders,
  BarChart,
  TrendingUp,
};

const stagesData: Stage[] = [
  {
    id: "stage-01",
    num: "01",
    title: "Исследование",
    description: "Изучаем бизнес, продукт, рынок, конкурентов и аудиторию.",
    iconName: "Search",
  },
  {
    id: "stage-02",
    num: "02",
    title: "Стратегия",
    description: "Определяем цели, точки роста, каналы продвижения и путь клиента.",
    iconName: "Target",
  },
  {
    id: "stage-03",
    num: "03",
    title: "Проектирование",
    description: "Разрабатываем решения под задачи бизнеса.",
    iconName: "Layers",
  },
  {
    id: "stage-04",
    num: "04",
    title: "Производство",
    description: "Создаём всё необходимое для реализации.",
    iconName: "Cpu",
  },
  {
    id: "stage-05",
    num: "05",
    title: "Запуск",
    description: "Запускаем рекламные кампании, контент-маркетинг, воронки продаж и специальные проекты.",
    iconName: "Rocket",
  },
  {
    id: "stage-06",
    num: "06",
    title: "Управление",
    description: "Контролируем реализацию, сроки, показатели и эффективность команды.",
    iconName: "Sliders",
  },
  {
    id: "stage-07",
    num: "07",
    title: "Аналитика",
    description: "Измеряем результаты и принимаем решения на основе данных.",
    iconName: "BarChart",
  },
  {
    id: "stage-08",
    num: "08",
    title: "Масштабирование",
    description: "Усиливаем работающие инструменты и развиваем новые направления роста.",
    iconName: "TrendingUp",
  },
];

export default function WorkStages() {
  const [activeStage, setActiveStage] = useState<string | null>("stage-01");

  const handleScrollToContacts = () => {
    const contactsSection = document.getElementById("contacts");
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] bg-black text-white border-b border-white/10 scroll-mt-[clamp(2rem,2.8vw,3.5rem)]"
      id="work-stages"
    >
      <div className="swiss-grid items-stretch rounded-none w-full">
        {/* Left Column: Fixed Content */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 pt-[clamp(3rem,6vw,5.4rem)] pb-[clamp(3rem,6vw,5.4rem)] lg:pb-[clamp(4.2rem,8.4vw,8.4rem)] pr-0 lg:pr-[clamp(1.5rem,3vw,3rem)] flex flex-col">
          <div className="flex flex-col gap-6">
            <h2 className="no-invert font-headline font-bold text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.0] tracking-tight text-white max-w-sm">
              {formatTypography("Как мы создаем результат")}
            </h2>
            <p className="no-invert font-sans font-medium text-white/50 text-[clamp(0.95rem,1.05vw,1.1rem)] leading-relaxed max-w-md">
              {formatTypography(
                "Пошаговый процесс реализации вашего проекта от первичного анализа до кратного масштабирования результатов."
              )}
            </p>
          </div>

          <Button01
            onClick={handleScrollToContacts}
            text={formatTypography("Обсудить проект")}
            variant="dark"
            className="mt-[72px]"
          />
        </div>

        {/* Right Column: Interactive Content */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-7 pt-[clamp(3rem,6vw,5.4rem)] pb-[clamp(3rem,6vw,5.4rem)] lg:pb-[clamp(4.2rem,8.4vw,8.4rem)] lg:pl-[clamp(1.5rem,3vw,3rem)] flex flex-col">
          {/* Accordion List */}
          <div className="flex flex-col border-t-0 lg:border-t border-white/10">
            {stagesData.map((stage) => {
              const isOpen = activeStage === stage.id;
              const StageIcon = iconMap[stage.iconName] || Search;
              return (
                <div key={stage.id} className="border-b border-white/10 last:border-b-0 lg:last:border-b">
                  <button
                    onClick={() => setActiveStage(isOpen ? null : stage.id)}
                    className="w-full text-left py-8 flex items-center justify-between group cursor-pointer focus:outline-none select-none"
                  >
                    <div className="flex items-center flex-grow min-w-0 pr-4">
                      {/* Number */}
                      <span className="no-invert font-mono text-xs md:text-sm text-white/30 w-8 md:w-12 shrink-0">
                        {stage.num}
                      </span>
                      {/* Icon + Title */}
                      <div className="flex items-center gap-4 flex-grow min-w-0">
                        <StageIcon className="w-5 h-5 text-white/50 group-hover:text-[#FD4B32] transition-colors shrink-0" />
                        <h3 className="no-invert font-headline font-semibold text-[clamp(0.95rem,1.5vw,1.1rem)] text-white group-hover:text-white/80 transition-colors truncate">
                          {formatTypography(stage.title)}
                        </h3>
                      </div>
                    </div>

                    {/* Circle Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
                        isOpen
                          ? "border-white bg-white text-black"
                          : "border-white/10 text-white/50 group-hover:border-white/30 group-hover:text-white"
                      }`}
                    >
                      <Plus
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="no-invert pb-[2.235rem] pl-8 md:pl-12 lg:pl-[64px] text-white/50 font-sans text-[clamp(0.95rem,1.05vw,1.1rem)] leading-relaxed max-w-xl">
                          {formatTypography(stage.description)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
