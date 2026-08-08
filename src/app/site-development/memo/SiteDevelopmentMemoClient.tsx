"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

interface CSSProperty {
  name: string;
  value: string;
}

interface HeadingItem {
  id: string;
  section: string;
  tag: string;
  text: string;
  classes: string;
  properties: CSSProperty[];
  description: string;
  noInvert?: boolean;
}

const headingsData: HeadingItem[] = [
  {
    id: "hero-title",
    section: "Герой-блок (Hero)",
    tag: "h1",
    text: "Сайт как часть работающего маркетинга",
    classes: "max-w-[12ch] font-headline text-[clamp(2.5rem,4.5vw,5.5rem)] font-semibold !leading-[0.95] tracking-[-0.03em]",
    noInvert: false,
    description: "Главный заголовок страницы. Использует адаптивный размер шрифта (clamp) и имеет очень плотный интерлиньяж (line-height: 0.95).",
    properties: [
      { name: "max-width", value: "12ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2.5rem, 4.5vw, 5.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important" },
      { name: "letter-spacing", value: "-0.03em" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "hero-card-num",
    section: "Герой-блок (Карточки)",
    tag: "div (визуальный)",
    text: "10+\nлет",
    classes: "font-headline text-[clamp(3.5rem,6vw,7rem)] font-bold leading-[0.8] tracking-[-0.05em]",
    noInvert: true,
    description: "Крупный числовой показатель в первой карточке преимуществ.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(3.5rem, 6vw, 7rem)" },
      { name: "font-weight", value: "700 (bold)" },
      { name: "line-height", value: "0.8" },
      { name: "letter-spacing", value: "-0.05em" }
    ]
  },
  {
    id: "hero-card-sub",
    section: "Герой-блок (Карточки)",
    tag: "div (визуальный)",
    text: "развиваемся\nв\u00a0своём деле",
    classes: "font-headline text-[clamp(1.5rem,2.2vw,2.4rem)] font-medium leading-[1.0] tracking-[-0.03em]",
    noInvert: true,
    description: "Текст описания в первой карточке под числовым показателем.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.5rem, 2.2vw, 2.4rem)" },
      { name: "font-weight", value: "500 (medium)" },
      { name: "line-height", value: "1.0" },
      { name: "letter-spacing", value: "-0.03em" }
    ]
  },
  {
    id: "hero-card-title-2",
    section: "Герой-блок (Карточки)",
    tag: "div (визуальный)",
    text: "Более 100\nпроектов",
    classes: "font-headline text-[clamp(2rem,3vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#111]",
    noInvert: true,
    description: "Заголовки во второй и третьей карточках преимуществ.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2rem, 3vw, 3.2rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95" },
      { name: "letter-spacing", value: "-0.04em" },
      { name: "color", value: "#111" }
    ]
  },
  {
    id: "principles-title",
    section: "Принципы (Principles)",
    tag: "h2",
    text: "Маркетинг, дизайн и разработка в одной команде",
    classes: "mb-12 max-w-[22ch] font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1] tracking-[-0.04em]",
    noInvert: false,
    description: "Основной заголовок секции принципов работы агентства.",
    properties: [
      { name: "margin-bottom", value: "3rem (48px)" },
      { name: "max-width", value: "22ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2.5rem, 5vw, 5.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "letter-spacing", value: "-0.04em" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "principles-card-title",
    section: "Принципы (Principles)",
    tag: "h3",
    text: "Начинаем с бизнес-задачи, а не с красивой картинки",
    classes: "font-headline text-[clamp(1.5rem,2.4vw,3rem)] font-semibold leading-[1]",
    noInvert: false,
    description: "Заголовки внутри карточек принципов работы.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.5rem, 2.4vw, 3rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "services-title",
    section: "Услуги (Services)",
    tag: "h2",
    text: "Разработка сайтов, которая решает задачи бизнеса",
    classes: "max-w-[12ch] self-start font-headline text-[clamp(1.75rem,3.5vw,3.85rem)] font-semibold leading-[1] lg:sticky lg:top-28",
    noInvert: false,
    description: "Левый липкий (sticky) заголовок секции видов сайтов.",
    properties: [
      { name: "max-width", value: "12ch" },
      { name: "align-self", value: "flex-start" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.75rem, 3.5vw, 3.85rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "position", value: "sticky (при ширине экрана >= 1024px)" },
      { name: "top", value: "7rem (112px, при ширине экрана >= 1024px)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "services-card-title",
    section: "Услуги (Services)",
    tag: "h3",
    text: "Интернет-магазин",
    classes: "no-invert font-headline font-semibold text-[clamp(1.2rem,1.78vw,1.6rem)] mb-6 md:mb-[clamp(0.75rem,1.5vw,1.5rem)] tracking-wide text-brand-gray leading-[0.9]",
    noInvert: true,
    description: "Заголовки карточек услуг внутри грида. Не инвертируются, чтобы сохранять исходный серый цвет.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "font-size", value: "clamp(1.2rem, 1.78vw, 1.6rem)" },
      { name: "margin-bottom", value: "адаптивный от 6px до 24px" },
      { name: "letter-spacing", value: "0.025em (tracking-wide)" },
      { name: "color", value: "#434343 (text-brand-gray)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" }
    ]
  },
  {
    id: "pricing-title",
    section: "Стоимость (Pricing)",
    tag: "h2",
    text: "Стоимость сайта зависит от масштаба, функциональности, контента и состава команды",
    classes: "col-span-12 font-headline text-[clamp(2.4rem,5vw,5.5rem)] font-semibold leading-[1] lg:col-span-7",
    noInvert: false,
    description: "Крупный текстовый заголовок в секции стоимости разработки.",
    properties: [
      { name: "grid-column", value: "span 12 (на мобильных) / span 7 (lg)" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2.4rem, 5vw, 5.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "timeline-title",
    section: "Сроки (Timeline)",
    tag: "motion.h2",
    text: "Задача будет выполнена в срок",
    classes: "mb-[clamp(4rem,9vw,8rem)] font-headline text-[clamp(2rem,3.3vw,3.5rem)] font-semibold leading-[1] will-change-transform",
    noInvert: false,
    description: "Анимированный скролл-заголовок над блоком с диаграммой Ганта.",
    properties: [
      { name: "margin-bottom", value: "адаптивный от 4rem до 8rem" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2rem, 3.3vw, 3.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "will-change", value: "transform" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "stages-title",
    section: "Процесс (Stages)",
    tag: "h2",
    text: "Как The Peak разрабатывает сайты",
    classes: "mb-16 max-w-[20ch] font-headline text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-[1] text-[#111]",
    noInvert: false,
    description: "Главный заголовок секции этапов разработки в стиле таймлайна.",
    properties: [
      { name: "margin-bottom", value: "4rem (64px)" },
      { name: "max-width", value: "20ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2rem, 4vw, 4.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "1" },
      { name: "color", value: "#111" }
    ]
  },
  {
    id: "stages-item-title",
    section: "Процесс (Stages)",
    tag: "h3",
    text: "Исследование, стратегия и техническое задание",
    classes: "mt-4 font-headline text-[clamp(1.35rem,1.8vw,1.65rem)] font-semibold leading-[1.15] text-[#111] group-hover:text-[#FD4B32] transition-colors duration-350 min-h-[3.6rem] lg:min-h-[4.5rem] flex items-start",
    noInvert: false,
    description: "Заголовки каждого отдельного этапа в списке процессов (в стиле таймлайна).",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.35rem, 1.8vw, 1.65rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "1.15" },
      { name: "transition", value: "color 350ms" },
      { name: "hover-color", value: "#FD4B32" }
    ]
  },
  {
    id: "extra-sidebar-title",
    section: "Доп. услуги (Extra Services)",
    tag: "h3",
    text: "Нужен проект под нестандартную задачу?",
    classes: "max-w-[13ch] font-headline text-[clamp(1.8rem,3vw,3rem)] font-semibold leading-[1]",
    noInvert: false,
    description: "Заголовок во вспомогательном красном блоке боковой панели.",
    properties: [
      { name: "max-width", value: "13ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.8rem, 3vw, 3rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "extra-main-title",
    section: "Доп. услуги (Extra Services)",
    tag: "h2",
    text: "Соберём решение под задачу",
    classes: "max-w-[15ch] font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1]",
    noInvert: false,
    description: "Основной заголовок раздела дополнительных услуг.",
    properties: [
      { name: "max-width", value: "15ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2.5rem, 5vw, 5.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "extra-item-title",
    section: "Доп. услуги (Extra Services)",
    tag: "h3",
    text: "SEO-продвижение",
    classes: "font-headline text-[clamp(1rem,1.35vw,1.3rem)] font-medium",
    noInvert: false,
    description: "Названия конкретных услуг в списке доп. работ.",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1rem, 1.35vw, 1.3rem)" },
      { name: "font-weight", value: "500 (medium)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "brief-title",
    section: "Бриф (Brief)",
    tag: "h2",
    text: "Какой сайт вам нужен?",
    classes: "max-w-[9ch] font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1]",
    noInvert: false,
    description: "Главный заголовок секции опросника.",
    properties: [
      { name: "max-width", value: "9ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2.5rem, 5vw, 5.5rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "brief-question",
    section: "Бриф (Brief)",
    tag: "h3",
    text: "Какую задачу должен решить сайт?",
    classes: "max-w-[19ch] font-headline text-[clamp(1.8rem,3vw,3.2rem)] font-semibold leading-[1]",
    noInvert: false,
    description: "Заголовок текущего вопроса в карточке шагов брифа.",
    properties: [
      { name: "max-width", value: "19ch" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(1.8rem, 3vw, 3.2rem)" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "mix-blend-mode", value: "difference" }
    ]
  },
  {
    id: "faq-title",
    section: "Вопросы и ответы (FAQ)",
    tag: "h2",
    text: "Часто задаваемые вопросы",
    classes: "no-invert max-w-sm font-headline text-[clamp(2rem,3.5vw,3.2rem)] font-bold leading-[1] tracking-tight text-white",
    noInvert: true,
    description: "Заголовок блока аккордеона FAQ. Не инвертируется, отображается чисто белым на черном фоне.",
    properties: [
      { name: "no-invert", value: "активно (отключает mix-blend-mode: difference)" },
      { name: "max-width", value: "24rem (384px)" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "clamp(2rem, 3.5vw, 3.2rem)" },
      { name: "font-weight", value: "700 (bold)" },
      { name: "line-height", value: "0.95 !important (наследуется от main)" },
      { name: "letter-spacing", value: "-0.025em" },
      { name: "color", value: "#ffffff" }
    ]
  },
  {
    id: "faq-item-title",
    section: "Вопросы и ответы (FAQ)",
    tag: "h3",
    text: "От чего зависит стоимость сайта?",
    classes: "no-invert font-headline text-base font-semibold text-white transition-colors group-hover:text-white/80 md:text-lg",
    noInvert: true,
    description: "Кликабельные вопросы-кнопки в аккордеоне. Не инвертируются.",
    properties: [
      { name: "no-invert", value: "активно (отключает mix-blend-mode: difference)" },
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-size", value: "1rem (16px) / 1.125rem (18px) на md" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "color", value: "#ffffff / при наведении opacity: 0.8" },
      { name: "transition", value: "transition-property: colors" }
    ]
  },
  {
    id: "contact-title",
    section: "Контакты (ContactSection)",
    tag: "h2",
    text: "Начать проект",
    classes: "font-headline font-semibold text-brand-gray tracking-tight text-[clamp(2rem,3vw,3.25rem)] !leading-[1]",
    noInvert: false,
    description: "Заголовок в сквозном блоке контактов (ContactSection).",
    properties: [
      { name: "font-family", value: "var(--font-inter-display), sans-serif" },
      { name: "font-weight", value: "600 (semibold)" },
      { name: "color", value: "#434343 (text-brand-gray)" },
      { name: "letter-spacing", value: "-0.025em (tracking-tight)" },
      { name: "font-size", value: "clamp(2rem, 3vw, 3.25rem)" },
      { name: "line-height", value: "1" }
    ]
  }
];

export default function SiteDevelopmentMemoClient() {
  const [selectedItem, setSelectedItem] = useState<HeadingItem>(headingsData[0]);
  const [previewText, setPreviewText] = useState<string>("");
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "red">("light");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>("Все");

  const sections = ["Все", ...Array.from(new Set(headingsData.map((item) => item.section)))];

  const filteredHeadings = filterSection === "Все"
    ? headingsData
    : headingsData.filter((item) => item.section === filterSection);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getPreviewBg = () => {
    switch (themeMode) {
      case "dark":
        return "bg-black text-white";
      case "red":
        return "bg-[#FD4B32] text-white";
      default:
        return "bg-white text-[#111]";
    }
  };

  const currentText = previewText.trim() !== "" ? previewText : selectedItem.text;

  return (
    <>
      <Navigation />
      <main className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] overflow-hidden bg-[#F8F9FA] text-[#111] min-h-screen pt-28 pb-20">
        
        {/* Шапка Памятки */}
        <header className="swiss-grid py-12 border-b border-black/10 bg-white">
          <div className="col-span-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FD4B32] font-semibold">[ Документация ]</span>
            <h1 className="font-headline text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight mt-4 leading-none text-[#111]">
              Памятка заголовков
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60 font-medium">
              Интерактивный справочник по заголовкам, типографике и стилям, используемым на странице{" "}
              <Link href="/site-development" className="text-[#FD4B32] underline underline-offset-4 font-semibold hover:text-[#e03a22] transition-colors">
                Разработка сайтов (/site-development)
              </Link>.
            </p>
          </div>
        </header>

        {/* Глобальные правила типографики */}
        <section className="swiss-grid py-12 bg-white border-b border-black/5">
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F8F9FA] p-6 border border-black/5 rounded-none flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#FD4B32] font-bold">[ 01. Инверсия цветов ]</span>
                <h3 className="font-headline text-lg font-bold mt-3 mb-2">mix-blend-mode: difference</h3>
                <p className="text-xs text-black/60 leading-relaxed font-medium">
                  Заголовки без класса <code className="bg-black/5 px-1 py-0.5 font-mono text-[10px] text-[#FD4B32]">no-invert</code> автоматически меняют цвет при прохождении над фоном. На светлом фоне они черные, на темном и красном — белые.
                </p>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-6 border border-black/5 rounded-none flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#FD4B32] font-bold">[ 02. Интерлиньяж ]</span>
                <h3 className="font-headline text-lg font-bold mt-3 mb-2">Сжатый leading-[0.95]</h3>
                <p className="text-xs text-black/60 leading-relaxed font-medium">
                  В то время как глобальный интерлиньяж заголовков в проекте равен <code className="bg-black/5 px-1 py-0.5 font-mono text-[10px]">1.1</code>, весь контент `/site-development` переопределен родителем на более плотный <code className="bg-black/5 px-1 py-0.5 font-mono text-[10px]">line-height: 0.95 !important</code>.
                </p>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-6 border border-black/5 rounded-none flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#FD4B32] font-bold">[ 03. Адаптивность шрифтов ]</span>
                <h3 className="font-headline text-lg font-bold mt-3 mb-2">CSS clamp()</h3>
                <p className="text-xs text-black/60 leading-relaxed font-medium">
                  Большинство заголовков используют адаптивный расчет <code className="bg-black/5 px-1 py-0.5 font-mono text-[10px]">clamp(min, val, max)</code>, что обеспечивает идеальный масштаб шрифта на мобильных устройствах, планшетах и десктопах.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Интерактивный интефейс */}
        <section className="swiss-grid py-12 gap-y-8">
          
          {/* Фильтры и навигация по секциям */}
          <div className="col-span-12 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-black/40 mr-2">Фильтр по разделам:</span>
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setFilterSection(sec)}
                className={`px-3 py-1.5 font-sans text-xs font-semibold rounded-none border transition-colors cursor-pointer ${
                  filterSection === sec
                    ? "bg-[#FD4B32] border-[#FD4B32] text-white"
                    : "bg-white border-black/10 hover:border-black/30 text-black/75"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Левая часть: список заголовков, Правая часть: детальный просмотр и Live Preview */}
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Список */}
            <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-2 [scrollbar-width:thin]">
              <div className="text-xs font-bold uppercase tracking-wider text-black/40 px-1 mb-2">
                Заголовки ({filteredHeadings.length})
              </div>
              {filteredHeadings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setPreviewText("");
                  }}
                  className={`w-full text-left p-4 rounded-none border transition-all flex flex-col gap-2 cursor-pointer ${
                    selectedItem.id === item.id
                      ? "bg-white border-[#FD4B32] shadow-sm"
                      : "bg-white border-black/5 hover:border-black/20"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-[10px] text-black/45 bg-black/5 px-2 py-0.5 uppercase tracking-wide font-bold">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-black/40 font-mono font-medium truncate max-w-[200px]">
                      {item.section}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-[#111] line-clamp-1">
                    {item.text}
                  </h4>
                  <p className="text-[11px] text-black/50 line-clamp-1 font-medium">
                    {item.classes}
                  </p>
                </button>
              ))}
            </div>

            {/* Детали, Стили и Live Preview */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Панель детального просмотра */}
              <div className="bg-white border border-black/10 p-6 md:p-8 space-y-6">
                
                {/* Спецификация заголовка */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
                  <div>
                    <span className="font-mono text-xs text-[#FD4B32] font-semibold">{selectedItem.section}</span>
                    <h2 className="font-headline text-2xl font-bold text-[#111] mt-1">
                      Детали элемента
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-black text-white px-2.5 py-1 uppercase font-bold">
                      HTML: {selectedItem.tag}
                    </span>
                    {selectedItem.noInvert && (
                      <span className="font-mono text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 font-semibold">
                        no-invert
                      </span>
                    )}
                  </div>
                </div>

                {/* Описание назначения */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2">Назначение / Описание:</h4>
                  <p className="text-sm text-black/70 leading-relaxed font-medium">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Tailwind классы */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/40">Используемые классы Tailwind CSS:</h4>
                    <button
                      onClick={() => copyToClipboard(selectedItem.classes, "classes")}
                      className="text-xs font-bold text-[#FD4B32] hover:text-[#e03a22] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedId === "classes" ? "Скопировано! ✓" : "Скопировать"}
                    </button>
                  </div>
                  <div className="bg-[#F8F9FA] border border-black/5 p-4 rounded-none font-mono text-xs text-black/75 break-words select-all">
                    {selectedItem.classes}
                  </div>
                </div>

                {/* CSS свойства */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-3">Сопоставление CSS свойств:</h4>
                  <div className="border border-black/5 rounded-none overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8F9FA] border-b border-black/5">
                          <th className="p-3 font-semibold text-black/70 w-1/3">CSS свойство</th>
                          <th className="p-3 font-semibold text-black/70">Значение</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.properties.map((prop, idx) => (
                          <tr key={idx} className="border-b border-black/5 last:border-b-0">
                            <td className="p-3 font-mono font-medium text-black/50">{prop.name}</td>
                            <td className="p-3 font-mono font-semibold text-[#111]">{prop.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Зона Live Preview */}
              <div className="bg-white border border-black/10 p-6 md:p-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#111]">
                      Живой предпросмотр (Live Preview)
                    </h3>
                    <p className="text-xs text-black/50 font-medium mt-1">
                      Протестируйте отображение шрифта с оригинальными стилями и интерактивной сменой фонов.
                    </p>
                  </div>
                  
                  {/* Переключатель фонов */}
                  <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-black/5 p-1">
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                        themeMode === "light" ? "bg-white text-black shadow-xs" : "text-black/50 hover:text-black"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                        themeMode === "dark" ? "bg-black text-white" : "text-black/50 hover:text-black"
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => setThemeMode("red")}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                        themeMode === "red" ? "bg-[#FD4B32] text-white" : "text-black/50 hover:text-black"
                      }`}
                    >
                      Red
                    </button>
                  </div>
                </div>

                {/* Поле ввода текста */}
                <div className="space-y-1.5">
                  <label className="font-sans text-[10px] font-extrabold text-black/40 uppercase tracking-widest block">
                    Текст для тестирования
                  </label>
                  <input
                    type="text"
                    placeholder={`Например: ${selectedItem.text}`}
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full font-sans text-xs text-black bg-[#F8F9FA] border border-black/10 focus:border-black/30 px-4 py-3 outline-none transition-colors rounded-none placeholder-black/35 font-medium"
                  />
                </div>

                {/* Окно рендеринга */}
                <div className="space-y-2">
                  <label className="font-sans text-[10px] font-extrabold text-black/40 uppercase tracking-widest block">
                    Результат рендеринга:
                  </label>
                  <div className={`p-8 min-h-48 flex items-center justify-center border border-black/5 transition-colors relative overflow-hidden ${getPreviewBg()}`}>
                    
                    {/* Сетка разметки в фоне для реалистичности */}
                    <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-[0.03]">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border-r border-black last:border-r-0 h-full" />
                      ))}
                    </div>

                    <div className="relative w-full text-left">
                      {/* Отрендеренный элемент с его динамическими стилями */}
                      {selectedItem.tag.includes("h1") && (
                        <h1 
                          className={selectedItem.classes}
                          style={{
                            mixBlendMode: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "difference" : "normal",
                            color: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "#ffffff" : undefined
                          }}
                        >
                          {currentText}
                        </h1>
                      )}
                      {selectedItem.tag.includes("h2") && (
                        <h2 
                          className={selectedItem.classes}
                          style={{
                            mixBlendMode: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "difference" : "normal",
                            color: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "#ffffff" : undefined
                          }}
                        >
                          {currentText}
                        </h2>
                      )}
                      {selectedItem.tag.includes("h3") && (
                        <h3 
                          className={selectedItem.classes}
                          style={{
                            mixBlendMode: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "difference" : "normal",
                            color: !selectedItem.noInvert && (themeMode === "dark" || themeMode === "red") ? "#ffffff" : undefined
                          }}
                        >
                          {currentText}
                        </h3>
                      )}
                      {selectedItem.tag.includes("div") && (
                        <div 
                          className={selectedItem.classes}
                        >
                          {currentText.split("\n").map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              {idx < currentText.split("\n").length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>
    </>
  );
}
