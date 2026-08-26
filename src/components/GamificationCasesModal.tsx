"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatTypography } from "@/utils/typography";

interface CaseMetric {
  value: string;
  label: string;
}

interface GamificationCase {
  client: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  metrics: CaseMetric[];
  imageSlots: string[];
}

const gamificationCases: GamificationCase[] = [
  {
    client: "ПИК",
    title: "Новый год с ПИК",
    subtitle: "Интерактивная карта с мини-играми",
    paragraphs: [
      "Задача была вовлечь пользователя в изучение проектов ПИК и нативно подвести к получению скидки на квартиру — такую задачу мы решили через новогодний игровой спецпроект.",
      "Создали интерактивную карту с семью заснеженными локациями, мини-играми и скрытыми механиками. Пользователь исследует мир, выполняет задания, изучает преимущества ЖК и зарабатывает скидочный промокод на квартиру.",
      "Внутри — карта, личный кабинет с прогрессом и вечерний режим, усиливающий атмосферу и иммерсию.",
    ],
    metrics: [{ value: "33%", label: "получили промокоды" }],
    imageSlots: ["Главное фото проекта", "Интерфейс и мини-игры"],
  },
  {
    client: "Авито",
    title: "Авито Стражи",
    subtitle: "Геймифицированое обучение правилам безопасности",
    paragraphs: [
      "Авито стремились повысить осведомлённость о безопасных сделках в сети для разных возрастных аудиторий, используя увлекательный формат, который бы одновременно обучал и привлекал пользователей.",
      "Мы создали три игры-раннера для разных возрастных категорий — детской, подростковой и взрослой. Игры обучали пользователей правилам безопасного взаимодействия на платформе Авито, предлагая участникам выбирать персонажей и проходить препятствия, собирая полезные артефакты.",
    ],
    metrics: [
      { value: "21%", label: "рост доверия пользователей (с 69% до 90%)" },
      { value: "22%", label: "участников повторно заходили на сайт" },
      { value: "175 806", label: "пользователей завершили игру" },
    ],
    imageSlots: ["Главное фото проекта", "Интерфейсы игр"],
  },
  {
    client: "Okko",
    title: "Мамонты в кибервселенной",
    subtitle: "Геймифицированое промо сериала «Мамонты»",
    paragraphs: [
      "Реализовали игровой промо-проект для сериала «Мамонты» с Юрием Стояновым.",
      "Перенесли пользователя в пиксельную вселенную кибератак и интернет-мошенников, где он проходил челленджи, отражал атаки и взаимодействовал с механиками, вдохновлёнными сюжетом сериала.",
      "Игровой опыт был построен так, чтобы не только вовлекать, но и давать дополнительную ценность: через механику игрок сталкивался с реальными сценариями интернет-угроз. Это усиливало погружение и делало коммуникацию более осмысленной и запоминающейся.",
    ],
    metrics: [
      { value: "39 591", label: "уникальных пользователей" },
      { value: "14 млн", label: "охват промо" },
      { value: "445 000", label: "перепрохождений игры" },
    ],
    imageSlots: ["Главное фото проекта", "Игровой процесс"],
  },
];

interface GamificationCasesModalProps {
  onClose: () => void;
}

export default function GamificationCasesModal({ onClose }: GamificationCasesModalProps) {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeCase = gamificationCases[activeCaseIndex];
  const closeModal = useCallback(() => setIsClosing(true), []);

  useEffect(() => {
    if (reduceMotion || isSliderPaused || activeCase.imageSlots.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) =>
        (currentIndex + 1) % activeCase.imageSlots.length,
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [activeCase.imageSlots.length, isSliderPaused, reduceMotion]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[1100] overflow-hidden bg-black/90 p-2 backdrop-blur-md md:p-5"
      onClick={closeModal}
      role="presentation"
      initial={{ opacity: reduceMotion ? 1 : 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0 : isClosing ? 0.42 : 0.28, ease: "easeOut" }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="gamification-case-title"
        onClick={(event) => event.stopPropagation()}
        className="mx-auto flex h-[calc(100dvh-1rem)] min-h-0 w-full max-w-[94rem] flex-col overflow-hidden bg-white text-[#111] md:h-[calc(100dvh-2.5rem)]"
        initial={{ y: reduceMotion ? 0 : "calc(100% + 1.25rem)" }}
        animate={{ y: isClosing ? "calc(100% + 1.25rem)" : 0 }}
        transition={{ duration: reduceMotion ? 0 : isClosing ? 0.48 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (isClosing) onClose();
        }}
      >
        <header className="relative shrink-0 border-b border-black/15 bg-white px-4 py-4 pr-16 md:px-7 md:py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#FD4B32]">
            Кейсы / Геймификация
          </p>
          <nav className="mt-3 flex gap-2 overflow-x-auto md:mt-2" aria-label="Кейсы геймификации">
            {gamificationCases.map((item, index) => (
              <button
                key={item.client}
                type="button"
                onClick={() => {
                  setActiveCaseIndex(index);
                  setActiveSlideIndex(0);
                }}
                className={`shrink-0 border px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide transition-colors ${
                  index === activeCaseIndex
                    ? "border-[#FD4B32] bg-[#FD4B32] text-white"
                    : "border-black/15 bg-white text-black hover:border-black hover:bg-black hover:text-white"
                }`}
              >
                {item.client}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={closeModal}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center border border-black/15 text-2xl font-light leading-none transition-colors hover:border-black hover:bg-black hover:text-white md:right-7 md:top-4"
            aria-label="Закрыть кейсы"
          >
            ×
          </button>
        </header>

        <div
          className="grid h-0 min-h-0 flex-1 touch-pan-y overscroll-contain overflow-y-scroll [-webkit-overflow-scrolling:touch] lg:grid-cols-12"
        >
          <div
            className="relative min-h-[22rem] overflow-hidden bg-[#efefef] md:min-h-[32rem] lg:col-span-7 lg:min-h-0"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
            onFocusCapture={() => setIsSliderPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsSliderPaused(false);
              }
            }}
            aria-roledescription="слайдер"
            aria-label={`Фотографии кейса ${activeCase.client}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={`${activeCase.client}-${activeSlideIndex}`}
                className="absolute inset-0 flex items-center justify-center p-6"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -36 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-live="polite"
              >
                <div className="text-center">
                  <span className="mx-auto mb-5 block h-10 w-10 bg-[#FD4B32]" />
                  <p className="font-headline text-xl font-semibold text-black/35">
                    {formatTypography(activeCase.imageSlots[activeSlideIndex])}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-black/30">
                    Фото будет добавлено
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <span className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
              {String(activeSlideIndex + 1).padStart(2, "0")} / {String(activeCase.imageSlots.length).padStart(2, "0")}
            </span>

            {activeCase.imageSlots.length > 1 && (
              <div className="absolute inset-x-5 bottom-5 z-10 flex items-center justify-between gap-5">
                <div className="flex flex-1 gap-2" aria-label="Выбор фотографии">
                  {activeCase.imageSlots.map((slot, index) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setActiveSlideIndex(index)}
                      className="group h-8 flex-1 cursor-pointer py-[0.9375rem]"
                      aria-label={`Показать фотографию ${index + 1}: ${slot}`}
                      aria-current={index === activeSlideIndex ? "true" : undefined}
                    >
                      <span
                        className={`block h-px w-full transition-colors ${
                          index === activeSlideIndex ? "bg-[#FD4B32]" : "bg-black/25 group-hover:bg-black/60"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex shrink-0 gap-px">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((currentIndex) =>
                        (currentIndex - 1 + activeCase.imageSlots.length) % activeCase.imageSlots.length,
                      )
                    }
                    className="flex h-10 w-10 cursor-pointer items-center justify-center border border-black/15 bg-white/80 text-lg transition-colors hover:border-black hover:bg-black hover:text-white"
                    aria-label="Предыдущая фотография"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((currentIndex) =>
                        (currentIndex + 1) % activeCase.imageSlots.length,
                      )
                    }
                    className="flex h-10 w-10 cursor-pointer items-center justify-center border border-black/15 bg-white/80 text-lg transition-colors hover:border-black hover:bg-black hover:text-white"
                    aria-label="Следующая фотография"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white px-5 py-7 md:px-10 md:py-10 lg:col-span-5 lg:px-[clamp(2rem,3.5vw,4rem)] lg:py-[clamp(0.875rem,1.8dvh,1.5rem)]">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#FD4B32]">
              {activeCase.client}
            </p>
            <h2
              id="gamification-case-title"
              className="mt-5 max-w-[13ch] font-headline text-[clamp(2.3rem,4vw,5rem)] font-semibold leading-[0.9] tracking-[-0.045em] lg:mt-[clamp(0.75rem,1.8dvh,1.25rem)] lg:text-[clamp(2.25rem,5.4dvh,4rem)]"
            >
              {formatTypography(activeCase.title)}
            </h2>
            <p className="mt-5 max-w-xl font-sans text-[clamp(1.05rem,1.35vw,1.35rem)] leading-tight text-black/60 lg:mt-[clamp(0.75rem,1.6dvh,1.25rem)] lg:text-[clamp(0.9rem,1.8dvh,1.15rem)]">
              {formatTypography(activeCase.subtitle)}
            </p>

            <div className="mt-12 lg:mt-[clamp(1rem,2.4dvh,1.75rem)]">
              <h3 className="font-sans text-sm font-bold text-[#FD4B32]">О проекте</h3>
              <div className="mt-5 space-y-5 lg:mt-[clamp(0.75rem,1.8dvh,1.25rem)] lg:space-y-[clamp(0.625rem,1.5dvh,1.25rem)]">
                {activeCase.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="font-sans text-base leading-[1.3] text-black/80 md:text-lg lg:text-[clamp(0.8125rem,1.55dvh,1rem)] lg:leading-[1.2]">
                    {formatTypography(paragraph)}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-12 pb-8 lg:mt-[clamp(1rem,2.4dvh,1.75rem)] lg:pb-2">
              <h3 className="font-sans text-sm font-bold text-[#FD4B32]">Результат</h3>
              <div className="mt-5 border-t border-[#FD4B32]/45 lg:mt-[clamp(0.75rem,1.8dvh,1.25rem)]">
                {activeCase.metrics.map((metric) => (
                  <div
                    key={`${metric.value}-${metric.label}`}
                    className="grid grid-cols-[minmax(7rem,auto)_1fr] items-end gap-5 border-b border-[#FD4B32]/45 py-5 lg:py-[clamp(0.625rem,1.6dvh,1.125rem)]"
                  >
                    <strong className="font-headline text-[clamp(2.6rem,4vw,5rem)] font-semibold leading-none tracking-[-0.04em] text-[#FD4B32] lg:text-[clamp(2.25rem,4.8dvh,4rem)]">
                      {metric.value}
                    </strong>
                    <span className="pb-1 text-right font-sans text-sm leading-tight text-[#FD4B32] md:text-base lg:text-[clamp(0.75rem,1.45dvh,0.9375rem)]">
                      {formatTypography(metric.label)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>,
    document.body,
  );
}
