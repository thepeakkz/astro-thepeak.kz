"use client";

import React, { useEffect, useRef, useState, Fragment } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import type { MotionStyle, MotionValue } from "framer-motion";
import Navigation from "@/components/Navigation";
import SiteDevelopmentContactSection from "@/components/SiteDevelopmentContactSection";
import { ServiceCard } from "@/components/ServicesAnimate";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { formatTypography } from "@/utils/typography";
import CasesProduxGrid from "@/components/CasesProduxGrid";
import { allCasesData } from "@/data/cases";
import Link from "next/link";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { preloadedCache, sessionInitialLoadDone } from "@/hooks/usePagePreloader";

const principles = [
  {
    image: "/imported-home/images/principle-1.webp",
    title: "Начинаем с бизнес-задачи, а не с красивой картинки",
    text: "Соединяем маркетинговую стратегию, структуру, тексты и дизайн, чтобы сайт приводил клиентов и поддерживал рост бизнеса",
  },
  {
    image: "/imported-home/images/principle-2.webp",
    title: "Ведём проект от идеи и прототипа до запуска и продвижения",
    text: "Фиксируем этапы, сроки и зоны ответственности. Вы понимаете статус проекта и видите результат каждой итерации.",
  },
  {
    image: "/imported-home/images/principle-3.webp",
    title: "Команда и бюджет под реальную задачу бизнеса",
    text: "Подбираем состав работ под задачу и заранее согласовываем прозрачную смету без скрытых расходов",
  },
];

const siteTypes = [
  {
    title: "Лендинг",
    time: "от 2 недель",
    text: "Создаём лендинг с продуманной структурой, сильным предложением и дизайном, который ведёт аудиторию к заявке",
    shape: "/shapes/shape-target.svg",
  },
  {
    title: "Многостраничный сайт",
    time: "от 60 дней",
    text: "Разработаем корпоративный сайт, настроим интеграции, аналитику и подготовим контент",
    shape: "/shapes/shape-web.svg",
  },
  {
    title: "Интернет-магазин",
    time: "от 60 дней",
    text: "Спроектируем каталог и сценарии покупки, подключим оплату, аналитику и необходимые сервисы",
    shape: "/shapes/shape-marketing.svg",
  },
  {
    title: "Дизайн-концепция",
    time: "от 30 дней",
    text: "Соберём выразительную визуальную систему, которая поддерживает позиционирование бренда",
    shape: "/shapes/shape-design.svg",
  },
];

const weeks = [
  "1 неделя",
  "2 неделя",
  "3 неделя",
  "4 неделя",
  "5 неделя",
  "6 неделя",
];

const timeline = [
  { week: "1 неделя", task: "Брифинг", start: 1, span: 1, color: "#111111" },
  {
    week: "3 неделя",
    task: "Сбор референсов в мудборд",
    start: 2,
    span: 1,
    color: "#FD4B32",
  },
  {
    week: "4 неделя",
    task: "Разработка прототипа и копирайтинга",
    start: 2,
    span: 2,
    color: "#4a4a4a",
  },
  {
    week: "5 неделя",
    task: "Создание дизайн-концепции сайта",
    start: 3,
    span: 2,
    color: "#FD4B32",
  },
  {
    week: "6 неделя",
    task: "Дизайн всего сайта на zero-блоках",
    start: 4,
    span: 2,
    color: "#111111",
  },
  {
    week: "7 неделя",
    task: "Вёрстка и адаптив",
    start: 5,
    span: 2,
    color: "#2e2e2e",
  },
  {
    week: "8 неделя",
    task: "Тестирование",
    start: 6,
    span: 1,
    color: "#FD4B32",
  },
];

type TimelineItem = (typeof timeline)[number];

function TimelineWeek({
  week,
  index,
  progress,
  reduceMotion,
}: {
  week: string;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = 0.1 + index * 0.025;
  const opacity = useTransform(
    progress,
    [start, start + 0.12],
    reduceMotion ? [1, 1] : [0, 1],
  );
  const y = useTransform(
    progress,
    [start, start + 0.12],
    reduceMotion ? [0, 0] : [10, 0],
  );

  return (
    <motion.div
      className="border-l border-black/10 px-3 text-sm text-black/35 last:border-r"
      style={{ opacity, y }}
    >
      {week}
    </motion.div>
  );
}

function TimelineBar({
  item,
  index,
  progress,
  reduceMotion,
}: {
  item: TimelineItem;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = 0.14 + index * 0.07;
  const end = 0.45 + index * 0.078;
  const opacity = useTransform(
    progress,
    [start, end],
    reduceMotion ? [1, 1] : [0, 1],
  );
  const x = useTransform(
    progress,
    [start, end],
    reduceMotion ? [0, 0] : [-12, 0],
  );
  const clipPath = useTransform(
    progress,
    [start, end],
    reduceMotion
      ? ["inset(0 0% 0 0)", "inset(0 0% 0 0)"]
      : ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );
  const barStyle: MotionStyle & { "--bar-glow": string } = {
    gridColumn: `${item.start} / span ${item.span}`,
    gridRow: index + 2,
    backgroundColor: item.color,
    "--bar-glow": `${item.color}40`,
    opacity,
    x,
    clipPath,
  };

  return (
    <motion.div
      className="z-10 mx-px flex h-9 items-center self-center rounded-none px-3 text-sm text-white shadow-[0_12px_28px_var(--bar-glow)] will-change-transform"
      style={barStyle}
    >
      <span className="truncate">{formatTypography(item.task)}</span>
    </motion.div>
  );
}

const stages = [
  {
    number: "01",
    status: "Этап 01 — Анализ",
    title: "Исследование, стратегия и техническое задание",
    text: "Оценим существующий сайт и проведём брифинг. Изучим конкурентов, целевую аудиторию и объём контента. Составим ТЗ, определим структуру и количество страниц.",
  },
  {
    number: "02",
    status: "Этап 02 — Проектирование",
    title: "Структура, прототип, тексты и дизайн-концепция",
    text: "Сформируем прототип, базовый макет и карту сайта. Подготовим первые блоки, соберём обратную связь и учтём правки до масштабирования концепции.",
  },
  {
    number: "03",
    status: "Этап 03 — Разработка",
    title: "Дизайн, разработка и запуск",
    text: "Завершим дизайн, добавим иллюстрации и анимации, адаптируем сайт под десктоп, планшеты и смартфоны. Подключим домен, аналитику, CRM и виджеты.",
  },
  {
    number: "04",
    status: "Этап 04 — Поддержка",
    title: "Аналитика, поддержка и продвижение",
    text: "Проведём технические настройки, запустим тестирование и анализ конверсии. Подключим SEO, контекстную рекламу, e-mail-маркетинг и продвижение в социальных сетях.",
  },
];

type BriefStep = {
  id: string;
  question: string;
  description: string;
  multiple?: boolean;
  options: readonly string[];
};

const briefSteps: readonly BriefStep[] = [
  {
    id: "type",
    question: "Какой формат сайта вам нужен?",
    description:
      "Выберите один вариант. Если пока не уверены — подскажем после обсуждения задачи.",
    options: [
      "Лендинг",
      "Многостраничный сайт",
      "Интернет-магазин",
      "Пока не знаю",
    ],
  },
  {
    id: "goal",
    question: "Какую задачу должен решить сайт?",
    description:
      "От цели зависит структура, состав команды и подход к разработке",
    options: [
      "Привлекать клиентов",
      "Продавать товары или услуги",
      "Рассказывать о компании",
      "Повышать узнаваемость бренда",
    ],
  },
  {
    id: "design",
    question: "Какой подход к дизайну вам ближе?",
    description:
      "Это поможет определить глубину визуальной проработки проекта",
    options: [
      "Нужен уникальный дизайн",
      "Главное — сделать стильно",
      "Можно использовать готовые решения",
      "Пока не решил(а)",
    ],
  },
  {
    id: "features",
    question: "Какие функции понадобятся?",
    description: "Можно выбрать несколько вариантов или пропустить этот шаг",
    multiple: true,
    options: [
      "Форма обратной связи",
      "Каталог товаров или услуг",
      "Онлайн-оплата",
      "Личный кабинет",
      "Блог или новости",
      "Поиск по сайту",
      "Интеграции с сервисами",
      "Мультиязычность",
    ],
  },
  {
    id: "deadline",
    question: "Когда планируете запустить сайт?",
    description: "Срок влияет на состав команды и порядок этапов",
    options: [
      "Срочно — 1–2 недели",
      "В течение месяца",
      "2–3 месяца",
      "Пока изучаю варианты",
    ],
  },
  {
    id: "contact",
    question: "Оставьте ваши контакты",
    description: "Мы свяжемся с вами в течение 15 минут, чтобы обсудить детали и подготовить предложение",
    options: [],
  },
];

const faqs = [
  [
    "От чего зависит стоимость сайта?",
    "Стоимость зависит от типа сайта, количества страниц, функциональности, интеграций, объёма контента и глубины проработки дизайна. После короткого брифинга мы предложим состав работ и прозрачную смету.",
  ],
  [
    "Сколько времени занимает разработка?",
    "Лендинг — от 3 до 5 недель. Корпоративный сайт, интернет-магазин или каталог — от 5 до 8 недель.",
  ],
  [
    "Сколько правок я могу внести?",
    "На каждом этапе заложено две бесплатные итерации правок. После полного согласования дополнительные изменения оцениваются отдельно.",
  ],
  [
    "Работаете ли вы с разными отраслями?",
    "Да. Каждый проект начинаем с погружения в продукт, аудиторию и конкурентную среду, чтобы спроектировать решение под конкретную бизнес-задачу.",
  ],
  [
    "Что делать, если нет готового видения?",
    "Готовая концепция не обязательна. Мы проведём брифинг, изучим рынок, соберём референсы и предложим обоснованное направление.",
  ],
  [
    "Как проходит согласование результата?",
    "Согласовываем проект поэтапно: стратегию, прототип, тексты, дизайн-концепцию и разработку. Так обратная связь учитывается до финального запуска.",
  ],
];

const scrollToContacts = () =>
  document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });

function LogoMarquee() {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300,
    mass: 0.5,
  });

  const marqueeX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((time, delta) => {
    // Normalise speed by frame duration (delta in ms)
    const baseSpeed = -1.2 * (delta / 16.6);
    const velocityFactor = 0.005 * (delta / 16.6);

    const currentVelocity = Math.abs(smoothVelocity.get());
    const speed = baseSpeed - (currentVelocity * velocityFactor);

    if (containerRef.current) {
      const halfWidth = containerRef.current.scrollWidth / 2;
      if (halfWidth > 0) {
        let newX = marqueeX.get() + speed;
        if (newX <= -halfWidth) {
          newX = newX % halfWidth;
        } else if (newX > 0) {
          newX = newX - halfWidth;
        }
        marqueeX.set(newX);
      }
    }
  });

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <motion.div
        ref={containerRef}
        className="flex gap-0 w-max py-1 items-center"
        style={{ x: marqueeX }}
      >
        {[3, 5, 6, 13, 17, 18, 23, 24, 32, 42, 44, 52, 3, 5, 6, 13, 17, 18, 23, 24, 32, 42, 44, 52].map((id, index) => (
          <div
            key={index}
            className="flex flex-shrink-0 items-center justify-center"
          >
            <img
              src={`/logo/clot-${id}.webp`}
              alt=""
              className="block h-[3.5rem] w-auto object-contain pointer-events-none lg:h-[5.7rem] xl:h-[6.2rem] 2xl:h-[7rem]"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function SiteDevelopmentClient() {
  const shouldReduceMotion = useReducedMotion();
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return preloadedCache["/site-development-hero.mp4"] || null;
    }
    return null;
  });
  const [isPreloadAttempted, setIsPreloadAttempted] = useState(() => {
    return sessionInitialLoadDone;
  });

  useEffect(() => {
    if (preloadedCache["/site-development-hero.mp4"]) {
      setVideoSrc(preloadedCache["/site-development-hero.mp4"]);
      setIsPreloadAttempted(true);
      return;
    }

    if (sessionInitialLoadDone) {
      setIsPreloadAttempted(true);
      return;
    }

    const handlePreloaded = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string; objectUrl: string }>;
      if (customEvent.detail.url === "/site-development-hero.mp4") {
        setVideoSrc(customEvent.detail.objectUrl);
        setIsPreloadAttempted(true);
      }
    };

    const handlePreloadFinished = () => {
      setIsPreloadAttempted(true);
    };

    window.addEventListener("peak-media-preloaded", handlePreloaded as EventListener);
    window.addEventListener("peak-preload-finished", handlePreloadFinished as EventListener);

    return () => {
      window.removeEventListener("peak-media-preloaded", handlePreloaded as EventListener);
      window.removeEventListener("peak-preload-finished", handlePreloadFinished as EventListener);
    };
  }, []);
  const timelineSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: timelineScrollProgress } = useScroll({
    target: timelineSectionRef,
    offset: ["start 90%", "center center"],
  });
  const smoothTimelineProgress = useSpring(timelineScrollProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.45,
  });
  const timelineTitleY = useTransform(
    smoothTimelineProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [48, -28],
  );
  const timelineChartY = useTransform(
    smoothTimelineProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [72, -20],
  );
  const timelineCaptionY = useTransform(
    smoothTimelineProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [44, -12],
  );
  const timelineTitleOpacity = useTransform(
    smoothTimelineProgress,
    [0.04, 0.22],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );
  const timelineGridOpacity = useTransform(
    smoothTimelineProgress,
    [0.08, 0.3],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );
  const timelineCaptionOpacity = useTransform(
    smoothTimelineProgress,
    [0.76, 1],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );
  const stagesSectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: stagesScrollProgress } = useScroll({
    target: stagesSectionRef,
    offset: ["start 35%", "end center"],
  });
  const smoothStagesProgress = useSpring(stagesScrollProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const stagesProgress = useTransform(smoothStagesProgress, [0.32, 0.78], [0, 1]);
  const progressWidth = useTransform(smoothStagesProgress, [0.05, 0.78], ["0%", "100%"]);

  const cardOpacities = [
    useTransform(smoothStagesProgress, [0.05, 0.32], [0.35, 1]),
    useTransform(smoothStagesProgress, [0.32, 0.48], [0.35, 1]),
    useTransform(smoothStagesProgress, [0.48, 0.63], [0.35, 1]),
    useTransform(smoothStagesProgress, [0.63, 0.78], [0.35, 1]),
  ];

  const tickColors = [
    useTransform(smoothStagesProgress, [0.05, 0.32], ["#111111", "#FD4B32"]),
    useTransform(smoothStagesProgress, [0.32, 0.48], ["#111111", "#FD4B32"]),
    useTransform(smoothStagesProgress, [0.48, 0.63], ["#111111", "#FD4B32"]),
    useTransform(smoothStagesProgress, [0.63, 0.78], ["#111111", "#FD4B32"]),
  ];

  const finalTickColor = useTransform(smoothStagesProgress, [0.74, 0.82], ["#111111", "#FD4B32"]);

  const [briefStep, setBriefStep] = useState(0);
  const [briefAnswers, setBriefAnswers] = useState<Record<string, string[]>>(
    {},
  );
  const [briefComplete, setBriefComplete] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [briefName, setBriefName] = useState("");
  const [briefPhone, setBriefPhone] = useState("");
  const [briefPrivacyConsent, setBriefPrivacyConsent] = useState(true);
  const [briefStatus, setBriefStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [briefContactMethod, setBriefContactMethod] = useState("WhatsApp");


  const handleBriefSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!briefName.trim() || !briefPhone.trim() || !briefPrivacyConsent) {
      setBriefStatus("error");
      return;
    }

    setBriefStatus("loading");

    try {
      const briefDataStr = briefSteps
        .filter((step) => step.id !== "contact")
        .map((step) => {
          const answer = briefAnswers[step.id] ?? [];
          return `${step.question}\nОтвет: ${answer.join(", ") || "Не указан"}`;
        })
        .join("\n\n");

      const commentText = `Бриф "Какой сайт вам нужен?":\n\n${briefDataStr}\n\n[Способ связи: ${briefContactMethod}]`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: briefName.trim(),
          phone: briefPhone.trim(),
          comment: commentText,
          source: "Короткий бриф (Разработка сайтов)",
        }),
      });

      if (response.ok) {
        setBriefStatus("success");
        setBriefComplete(true);
      } else {
        setBriefStatus("error");
      }
    } catch (err) {
      console.error(err);
      setBriefStatus("error");
    }
  };

  const currentBriefStep = briefSteps[briefStep];
  const currentBriefAnswers = briefAnswers[currentBriefStep.id] ?? [];

  useEffect(() => {
    const video = heroVideoRef.current;

    if (!video) return;

    const playVideo = () => {
      video.play().catch(() => setIsHeroVideoPlaying(false));
    };
    const handlePlaying = () => setIsHeroVideoPlaying(true);
    const handlePause = () => setIsHeroVideoPlaying(false);
    const handleVisibilityChange = () => {
      if (!document.hidden) playVideo();
    };

    playVideo();
    video.addEventListener("canplay", playVideo);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPreloadAttempted, videoSrc]);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (videoSrc && video) {
      video.load();
      video.play().catch(() => {});
    }
  }, [videoSrc]);

  const toggleBriefAnswer = (option: string) => {
    setBriefAnswers((current) => {
      const selected = current[currentBriefStep.id] ?? [];
      const next = currentBriefStep.multiple
        ? selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option]
        : [option];

      return { ...current, [currentBriefStep.id]: next };
    });

    if (!currentBriefStep.multiple) {
      if (briefStep === briefSteps.length - 1) {
        setBriefComplete(true);
      } else {
        setBriefStep((step) => step + 1);
      }
    }
  };

  const advanceBrief = () => {
    if (briefStep === briefSteps.length - 1) {
      setBriefComplete(true);
      return;
    }

    setBriefStep((step) => step + 1);
  };

  return (
    <>
      <Navigation />
      <main className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] bg-[#f6f6fa] text-[#111] [--hero-card-height:clamp(25.92rem,37.4vw,31.68rem)] lg:[--hero-card-height:20.16rem] xl:[--hero-card-height:21.6rem] 2xl:[--hero-card-height:clamp(25.92rem,37.4vw,31.68rem)] [&_h1]:!leading-[0.95] [&_h2]:!leading-[0.95] [&_h3]:!leading-[0.95]">
        <section className="relative isolate flex min-h-[100svh] flex-col justify-start gap-8 overflow-visible bg-[#FD4B32] pb-[clamp(2rem,7vw,4rem)] pt-28 text-white md:h-[100svh] md:min-h-0 md:justify-between md:gap-0 md:pb-0">
          {isPreloadAttempted && (
            <video
              ref={heroVideoRef}
              src={videoSrc || "/site-development-hero.mp4"}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              aria-hidden="true"
              tabIndex={-1}
              className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-300 ${isHeroVideoPlaying ? "opacity-100" : "opacity-0"}`}
            >
              Ваш браузер не поддерживает фоновое видео.
            </video>
          )}
          
          {/* Cover Heading (to the top of the cover) */}
          <div className="swiss-grid relative mt-4 mb-8 md:mb-12">
            <div className="col-span-12 lg:col-span-7">
              <h1 className="max-w-[12ch] font-headline text-[clamp(2.5rem,4.5vw,5.5rem)] font-semibold !leading-[0.95] tracking-[-0.03em]">
                {formatTypography("Сайт как часть работающего маркетинга")}
              </h1>
              <div className="relative z-10 mt-8 flex flex-wrap gap-6 md:mt-12">
                <Button01 onClick={scrollToContacts} text="Заказать сайт" />
                <Button01
                  onClick={scrollToContacts}
                  text="Обсудить проект"
                  variant="dark"
                />
              </div>
            </div>
          </div>

          {/* Cards overlap the following section by exactly half their height on tablet and wider screens. */}
          <div className="relative z-10 mt-auto w-full overflow-visible md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2">
            <div className="px-[var(--page-margin)]">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6 md:overflow-visible">
                {/* Card 1: 10+ лет */}
                <div className="flex h-auto min-h-[clamp(17rem,70vw,24rem)] flex-col bg-black p-[clamp(1.5rem,3vw,2.5rem)] text-white md:h-[var(--hero-card-height)] md:min-h-0 lg:p-5 xl:p-5 2xl:p-[clamp(1.5rem,3vw,2.5rem)]">
                  <div className="flex justify-between items-start">
                    <div className="font-headline text-[clamp(3.5rem,6vw,7rem)] lg:text-[2.8rem] xl:text-[3.2rem] 2xl:text-[clamp(3.5rem,6vw,7rem)] font-bold leading-[0.8] tracking-[-0.05em]">
                      10+
                      <br />
                      лет
                    </div>
                    <span className="font-mono text-xs text-white/40 pt-1.5">[ 01 ]</span>
                  </div>
                  <div className="mt-auto font-headline text-[clamp(1.5rem,2.2vw,2.4rem)] font-medium leading-[1.0] tracking-[-0.03em] lg:text-[1.2rem] xl:text-[1.3rem] 2xl:text-[clamp(1.5rem,2.2vw,2.4rem)]">
                    {formatTypography("развиваемся")}
                    <br />
                    {formatTypography("в\u00a0своём деле")}
                  </div>
                </div>

                {/* Card 2: Более 100 проектов */}
                <div className="flex h-auto min-h-[clamp(17rem,70vw,24rem)] flex-col justify-between border border-black/10 bg-white p-[clamp(1.5rem,3vw,2.5rem)] text-[#111] md:h-[var(--hero-card-height)] md:min-h-0 lg:p-5 xl:p-5 2xl:p-[clamp(1.5rem,3vw,2.5rem)]">
                  <div className="flex justify-between items-start">
                    <div className="font-headline text-[clamp(1.75rem,2.6vw,2.8rem)] lg:text-[1.6rem] xl:text-[1.8rem] 2xl:text-[clamp(2rem,3vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#111]">
                      {formatTypography("Более 100")}
                      <br />
                      {formatTypography("проектов")}
                    </div>
                    <span className="font-mono text-xs text-black/45 pt-1.5">[ 02 ]</span>
                  </div>
                  <div className="mt-6 flex flex-grow flex-col lg:mt-3 xl:mt-4 2xl:mt-6">
                    <p className="text-sm leading-relaxed text-black/55 font-medium max-w-[34ch]">
                      {formatTypography(
                        "точно понимаем специфику как\u00a0маленького бизнеса, так\u00a0и\u00a0больших структур\u00a0— и\u00a0знаем, как\u00a0решать задачи любого масштаба"
                      )}
                    </p>
                  </div>
                  <div className="mt-auto w-full overflow-hidden">
                    <LogoMarquee />
                  </div>
                </div>

                {/* Card 3: Клиенты нас рекомендуют */}
                <div className="flex h-auto min-h-[clamp(17rem,70vw,24rem)] flex-col justify-between border border-black/10 bg-white p-[clamp(1.5rem,3vw,2.5rem)] text-[#111] md:h-[var(--hero-card-height)] md:min-h-0 lg:p-5 xl:p-5 2xl:p-[clamp(1.5rem,3vw,2.5rem)]">
                  <div className="flex justify-between items-start">
                    <div className="font-headline text-[clamp(1.75rem,2.6vw,2.8rem)] lg:text-[1.6rem] xl:text-[1.8rem] 2xl:text-[clamp(2rem,3vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#111]">
                      {formatTypography("Клиенты нас")}
                      <br />
                      {formatTypography("рекомендуют")}
                    </div>
                    <span className="font-mono text-xs text-black/45 pt-1.5">[ 03 ]</span>
                  </div>
                  <div className="flex-grow mt-6 lg:mt-3 xl:mt-4 2xl:mt-6">
                    <p className="text-sm leading-relaxed text-black/55 font-medium max-w-[34ch]">
                      {formatTypography(
                        "к\u00a0нам идут по\u00a0советам тех, кто\u00a0уже к\u00a0нам обращался\u00a0— это\u00a0главный показатель того, что\u00a0нам доверяют"
                      )}
                    </p>
                  </div>
                  <div className="mt-8 lg:mt-4 xl:mt-5 2xl:mt-8 flex items-center justify-between">
                    <div className="flex -space-x-2.5 items-center">
                      {["clot-vlad", "clot-say", "clot-roman", "clot-nel", "clot-den"].map((name, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full border border-white bg-[#eee] overflow-hidden shrink-0"
                        >
                          <img
                            src={`/team/${name}.webp`}
                            alt=""
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="font-headline text-[clamp(1.1rem,1.5vw,1.4rem)] font-semibold text-black/45 pt-1">
                      +∞
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-[var(--page-margin)] pb-[clamp(4rem,9vw,9rem)] pt-[clamp(4rem,9vw,9rem)] md:pt-[calc(var(--hero-card-height)/2+clamp(4rem,9vw,9rem))]">
          <h2 className="mb-12 max-w-[22ch] font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1] tracking-[-0.04em]">
            {formatTypography("Маркетинг, дизайн и разработка в одной команде")}
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {principles.map((item) => (
              <article
                key={item.title}
                className="group relative isolate min-h-[clamp(20.28rem,84.5vw,28.392rem)] overflow-hidden bg-[#eee] md:min-h-[clamp(32.448rem,64.896vw,43.264rem)] lg:min-h-[clamp(35.152rem,36.504vw,59.488rem)]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                />
                <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col text-white mix-blend-difference md:inset-x-5 md:bottom-5">
                  <h3 className="font-headline text-[clamp(0.95rem,4vw,1.15rem)] font-semibold leading-[1] md:text-[clamp(1.2rem,1.78vw,1.6rem)]">
                    {formatTypography(item.title)}
                  </h3>
                  <p className="mt-3 hidden max-w-xl text-[clamp(0.9rem,1vw,1.05rem)] leading-relaxed text-white/80 md:block">
                    {formatTypography(item.text)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f6f6fa] text-[#434343] lg:h-[100svh] lg:overflow-hidden lg:py-[5svh]">
          <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[calc((100%+var(--page-margin)+0.5rem)/3)_minmax(0,1fr)]">
            <div className="flex border-b border-[#434343]/15 px-[var(--page-margin)] py-[clamp(4rem,9vw,9rem)] lg:border-b-0 lg:border-r">
              <h2 className="max-w-[12ch] self-start font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1] lg:sticky lg:top-28">
                {formatTypography("Разработка сайтов, которая")}
                <br />
                <span className="text-[#FD4B32]">
                  {formatTypography("решает задачи бизнеса")}
                </span>
              </h2>
            </div>

            <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:h-full lg:grid-rows-2 lg:[&>div]:min-h-0 pl-[var(--page-margin)] lg:pl-0 pr-[var(--page-margin)]">
              {siteTypes.map((item, index) => (
                <ServiceCard
                  key={item.title}
                  title={formatTypography(item.title)}
                  description={formatTypography(item.text)}
                  shape={item.shape}
                  meta={formatTypography(item.time)}
                  insetOutline
                  outlineGridIndex={index}
                  onClick={scrollToContacts}
                />
              ))}
            </div>
          </div>
        </section>

        <motion.section
          ref={timelineSectionRef}
          className="bg-[#f6f6fa] px-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)]"
        >
          <motion.h2
            className="mb-[clamp(4rem,9vw,8rem)] font-headline text-[clamp(2rem,3.3vw,3.5rem)] font-semibold leading-[1] will-change-transform"
            style={{ y: timelineTitleY, opacity: timelineTitleOpacity }}
          >
            {["Задача будет", formatTypography("выполнена в срок")].map(
              (line) => (
                <span
                  key={line}
                  className="block overflow-hidden pb-[0.08em] -mb-[0.08em]"
                >
                  <span className="block">{line}</span>
                </span>
              ),
            )}
          </motion.h2>
          <motion.div
            className="-mx-[var(--page-margin)] overflow-x-auto px-[var(--page-margin)] pb-4 [scrollbar-width:thin] will-change-transform"
            style={{ y: timelineChartY }}
          >
            <div className="relative grid h-[23rem] min-w-[70rem] grid-cols-6 grid-rows-[2.5rem_repeat(7,2.5rem)]">
              {weeks.map((week, index) => (
                <TimelineWeek
                  key={week}
                  week={week}
                  index={index}
                  progress={smoothTimelineProgress}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
              ))}
              {timeline.map((item, index) => (
                <TimelineBar
                  key={item.task}
                  item={item}
                  index={index}
                  progress={smoothTimelineProgress}
                  reduceMotion={Boolean(shouldReduceMotion)}
                />
              ))}
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-10 bottom-0 grid grid-cols-6"
                aria-hidden="true"
                style={{ opacity: timelineGridOpacity }}
              >
                {weeks.map((week) => (
                  <span
                    key={week}
                    className="border-l border-black/10 last:border-r"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
          <motion.p
            className="mt-6 max-w-[34rem] text-[clamp(1rem,1.35vw,1.35rem)] leading-[1.35] text-black/60 will-change-transform"
            style={{ y: timelineCaptionY, opacity: timelineCaptionOpacity }}
          >
            {formatTypography(
              "Презентуем каждый этап лично, чтобы собрать обратную связь, учесть всю информацию и решить все вопросы",
            )}
          </motion.p>
        </motion.section>

        <section
          ref={stagesSectionRef}
          className="bg-[#f6f6fa] px-[var(--page-margin)] py-[clamp(4rem,9vw,9rem)] text-black overflow-hidden"
        >
          <h2 className="no-invert mb-16 max-w-[20ch] font-headline text-[clamp(2rem,4vw,4.5rem)] font-semibold leading-[1] text-[#111]">
            {formatTypography("Как The Peak разрабатывает сайты")}
          </h2>
          <div className="-mx-[var(--page-margin)] overflow-x-auto sm:overflow-x-hidden px-[var(--page-margin)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              className="flex flex-col w-[calc((100vw-2*var(--page-margin))*4)] sm:w-[calc((100vw-2*var(--page-margin))*2)] lg:w-[calc((100vw-2*var(--page-margin))*4/3)] [--stages-translate-x:0%] sm:[--stages-translate-x:calc(var(--stages-progress)*-50%)] lg:[--stages-translate-x:calc(var(--stages-progress)*-25%)]"
              style={{
                "--stages-progress": stagesProgress,
                transform: "translateX(var(--stages-translate-x))",
              } as MotionStyle}
            >
              {/* Unified Ruler */}
              <div className="relative h-16 w-full mb-8" aria-hidden="true">
                {/* Horizontal line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-black/15" />
                
                {/* Orange Progress Line (scroll-linked) */}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-[#FD4B32] origin-left"
                  style={{ width: progressWidth }}
                />
                
                {stages.map((stage, index) => {
                  const basePct = (index * 100) / stages.length;
                  return (
                    <Fragment key={stage.number}>
                      {/* Tall tick */}
                      <motion.div
                        className="absolute bottom-0 w-px h-6"
                        style={{
                          left: `${basePct}%`,
                          backgroundColor: tickColors[index],
                        }}
                      />
                      
                      {/* Small ticks */}
                      {Array.from({ length: 6 }).map((_, i) => {
                        const leftPct = basePct + ((i + 1) * (100 / stages.length)) / 7;
                        return (
                          <div
                            key={i}
                            className="absolute bottom-0 w-px h-3 bg-black/25"
                            style={{ left: `${leftPct}%` }}
                          />
                        );
                      })}
                    </Fragment>
                  );
                })}
                
                {/* Bounding tall tick at 100% */}
                <motion.div
                  className="absolute bottom-0 right-0 w-px h-6"
                  style={{
                    left: "100%",
                    backgroundColor: finalTickColor,
                  }}
                />
              </div>

              {/* Cards Row */}
              <div className="flex flex-row">
                {stages.map((stage, index) => (
                  <motion.article
                    key={stage.number}
                    className="group w-[calc(100vw-2*var(--page-margin))] sm:w-[calc((100vw-2*var(--page-margin))/2)] lg:w-[calc((100vw-2*var(--page-margin))/3)] shrink-0 snap-start flex flex-col pr-8 lg:pr-12 relative cursor-default"
                    style={{ opacity: cardOpacities[index] }}
                  >
                    {/* Content */}
                    <div className="no-invert mt-2 flex items-center text-[10px] font-mono font-semibold tracking-wider text-black/50">
                      <span className="w-2 h-2 bg-[#FD4B32] mr-2 shrink-0 transition-transform duration-300 group-hover:scale-125" />
                      <span>{formatTypography(stage.status || "")}</span>
                    </div>
                    
                    <h3 className="no-invert mt-4 font-headline text-[clamp(1.35rem,1.8vw,1.65rem)] font-semibold leading-[1.15] text-[#111] group-hover:text-[#FD4B32] transition-colors duration-350 min-h-[3.6rem] lg:min-h-[4.5rem] flex items-start">
                      {formatTypography(stage.title)}
                    </h3>
                    
                    <p className="no-invert mt-6 font-mono text-[clamp(0.72rem,0.85vw,0.8rem)] tracking-wide leading-relaxed text-black/55">
                      {formatTypography(stage.text)}
                    </p>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section
          className="bg-[#0B0B0C] text-[#F2F2F2] pb-[11.67vh] select-none relative overflow-visible"
          id="cases"
        >
          {/* Header section (Aligned to default swiss-grid) */}
          <div className="swiss-grid pt-[16.6vh] max-lg:pt-[11.7vh] max-sm:pt-[6.86vh] pb-[6vh] flex items-end justify-between">
            <div className="col-span-6 overflow-hidden text-left">
              <motion.h2
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.83, 0, 0.17, 1] }}
                className="font-headline text-[clamp(2.5rem,4.5vw,4.8rem)] font-semibold leading-[1.05] text-[#F2F2F2] text-left"
              >
                {formatTypography("Выполненные кейсы")}
              </motion.h2>
            </div>

            <div className="col-span-6 flex justify-end">
              <Link href="/cases" className="group flex flex-col items-end">
                <div className="projects-sections-see-all-link font-sans text-[clamp(0.8rem,1vw,1.1rem)] font-bold uppercase tracking-wider text-[#F2F2F2] flex items-center gap-[0.4vw] mb-[0.5vh] transition-colors duration-200 hover:text-white">
                  <span>{formatTypography("все кейсы")}</span>
                </div>
                <div className="bg-[#F2F2F2] h-px w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            </div>
          </div>

          <div className="w-full">
            <CasesProduxGrid
              cases={(() => {
                const filtered = allCasesData.filter(
                  (item) =>
                    item.services.includes("Многостраничный сайт") ||
                    item.services.includes("Лендинг")
                );
                const orderMap: Record<string, number> = {
                  "Shanding Logistics": 0,
                  "Bebble": 1,
                  "Compass": 2,
                  "Kenfsad": 3,
                  "Boya": 4,
                  "Рыкунов и Кудряшов": 5,
                  "Игорь Кочергин": 6,
                };
                return [...filtered].sort((a, b) => {
                  const orderA = orderMap[a.name] ?? 99;
                  const orderB = orderMap[b.name] ?? 99;
                  return orderA - orderB;
                });
              })()}
            />
          </div>
        </section>




        {/*
        <section
          className="px-[var(--page-margin)] py-[clamp(4rem,9vw,9rem)]"
          aria-labelledby="brief-title"
        >
          <div className="swiss-grid gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-black/45">
                Короткий бриф
              </p>
              <h2
                id="brief-title"
                className="max-w-[9ch] font-headline text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[1]"
              >
                Какой сайт вам нужен?
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-black/50">
                {formatTypography(
                  "Ответьте на шесть вопросов — это займёт около минуты",
                )}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-7">
              {!briefComplete ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentBriefStep.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: -28 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex min-h-[31rem] flex-col border-t border-black/15 pt-5"
                  >
                    <div className="mb-[clamp(2.5rem,5vw,4.5rem)]">
                      <div className="mb-8 flex items-center gap-4">
                        <span className="font-mono text-xs text-black/45">
                          {String(briefStep + 1).padStart(2, "0")} /{" "}
                          {String(briefSteps.length).padStart(2, "0")}
                        </span>
                        <div className="h-px flex-1 bg-black/10">
                          <div
                            className="h-px bg-[#FD4B32] transition-[width] duration-300"
                            style={{
                              width: `${((briefStep + 1) / briefSteps.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="max-w-[19ch] font-headline text-[clamp(1.8rem,3vw,3.2rem)] font-semibold leading-[1]">
                        {formatTypography(currentBriefStep.question)}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/50">
                        {formatTypography(currentBriefStep.description)}
                      </p>
                    </div>

                    {currentBriefStep.id === "contact" ? (
                      <div className="space-y-6 max-w-md w-full">
                        <div className="space-y-1.5">
                          <label className="font-sans text-xs font-extrabold text-black/50 uppercase tracking-widest block">
                            {formatTypography("Ваше имя")}
                          </label>
                          <input
                            type="text"
                            required
                            disabled={briefStatus === "loading"}
                            value={briefName}
                            onChange={(e) => setBriefName(e.target.value)}
                            className="w-full font-sans text-sm text-black bg-transparent border-b border-black/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 placeholder-black/30 rounded-none"
                            placeholder="Иван"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-sans text-xs font-extrabold text-black/50 uppercase tracking-widest block">
                            {formatTypography("Телефон")}
                          </label>
                          <PhoneInput
                            value={briefPhone}
                            onChange={(val) => setBriefPhone(val)}
                            theme="light"
                            required
                            disabled={briefStatus === "loading"}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-sans text-xs font-extrabold text-black/50 uppercase tracking-widest block">
                            {formatTypography("Удобный способ связи")}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {["WhatsApp", "Telegram", "Звонок"].map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setBriefContactMethod(method)}
                                className={`py-1.5 px-3 font-sans text-xs uppercase tracking-wider font-bold transition-colors border cursor-pointer ${
                                  briefContactMethod === method
                                    ? "bg-black text-white border-black"
                                    : "bg-transparent text-black/60 border-black/20 hover:border-black/40"
                                }`}
                              >
                                {method}
                              </button>
                            ))}
                          </div>
                        </div>

                        <PrivacyConsentCheckbox
                          checked={briefPrivacyConsent}
                          onCheckedChange={(checked) => setBriefPrivacyConsent(checked)}
                          variant="light"
                        />

                        {briefStatus === "error" && (
                          <p className="text-[#FD4B32] font-sans text-sm">
                            {formatTypography("Произошла ошибка при отправке")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                        role="group"
                        aria-label={currentBriefStep.question}
                      >
                        {currentBriefStep.options.map((option, index) => {
                          const isSelected = currentBriefAnswers.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => toggleBriefAnswer(option)}
                              className={`group flex min-h-16 items-center gap-4 border px-4 py-3 text-left text-sm transition-colors ${isSelected ? "border-[#FD4B32] bg-[#FD4B32] text-white" : "border-black/15 hover:border-black/60"}`}
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[10px] ${isSelected ? "border-black bg-black text-white" : "border-black/20 text-black/40 group-hover:border-black/50"}`}
                              >
                                {isSelected
                                  ? "✓"
                                  : String(index + 1).padStart(2, "0")}
                              </span>
                              <span>{formatTypography(option)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/10 pt-8">
                      <button
                        type="button"
                        disabled={briefStep === 0 || briefStatus === "loading"}
                        onClick={() => setBriefStep((step) => step - 1)}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 transition-colors hover:text-black disabled:pointer-events-none disabled:opacity-0"
                      >
                        ← Назад
                      </button>
                      <Button01
                        onClick={currentBriefStep.id === "contact" ? handleBriefSubmit : advanceBrief}
                        disabled={
                          currentBriefStep.id === "contact"
                            ? !briefName.trim() || !briefPhone.trim() || !briefPrivacyConsent || briefStatus === "loading"
                            : !currentBriefStep.multiple && currentBriefAnswers.length === 0
                        }
                        text={
                          currentBriefStep.id === "contact"
                            ? briefStatus === "loading"
                                ? "Отправка"
                                : "Отправить бриф"
                            : "Следующий вопрос"
                        }
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex min-h-[31rem] flex-col border-t border-black/15 pt-5">
                  <p className="mb-8 font-mono text-xs text-black/45">
                    Бриф заполнен
                  </p>
                  <h3 className="max-w-[17ch] font-headline text-[clamp(2rem,3.4vw,3.8rem)] font-semibold leading-[1]">
                    {formatTypography(
                      "Спасибо. Теперь мы лучше понимаем вашу задачу",
                    )}
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-black/55">
                    {formatTypography(
                      "Обсудим ответы, уточним детали и подготовим подходящий состав работ",
                    )}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-5 border-t border-black/10 pt-8">
                    <Button01
                      onClick={scrollToContacts}
                      text="Обсудить проект"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBriefComplete(false);
                        setBriefStep(0);
                        setBriefName("");
                        setBriefPhone("");
                        setBriefPrivacyConsent(true);
                        setBriefStatus("idle");
                        setBriefContactMethod("WhatsApp");
                      }}
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50 transition-colors hover:text-black"
                    >
                      Изменить ответы
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        */}

        <section className="bg-black text-white">
          <div className="swiss-grid items-stretch">
            <div className="col-span-12 flex flex-col border-b border-white/10 py-[clamp(3rem,6vw,5.4rem)] lg:col-span-5 lg:border-b-0 lg:border-r lg:pr-[clamp(1.5rem,3vw,3rem)]">
              <div className="flex flex-col gap-6">
                <h2 className="no-invert max-w-sm font-headline text-[clamp(2rem,3.5vw,3.2rem)] font-bold leading-[1] tracking-tight text-white">
                  {formatTypography("Часто задаваемые вопросы")}
                </h2>
                <p className="no-invert max-w-md font-sans text-[clamp(0.95rem,1.05vw,1.1rem)] font-medium leading-relaxed text-white/50">
                  {formatTypography(
                    "Ответили на основные вопросы о стоимости, сроках и процессе разработки сайта",
                  )}
                </p>
              </div>
              <Button01
                onClick={scrollToContacts}
                text="Обсудить проект"
                variant="dark"
                className="mt-[72px]"
              />
            </div>

            <div className="col-span-12 flex flex-col py-[clamp(3rem,6vw,5.4rem)] lg:col-span-7 lg:pl-[clamp(1.5rem,3vw,3rem)] lg:pb-[clamp(4.2rem,8.4vw,8.4rem)]">
              <div className="flex flex-col lg:border-t lg:border-white/10">
                {faqs.map(([question, answer], index) => {
                  const isOpen = openFaq === index;
                  const answerId = `faq-answer-${index}`;
                  return (
                    <motion.div
                      key={question}
                      layout={!shouldReduceMotion}
                      className="border-b border-white/10"
                      transition={{
                        layout: {
                          duration: shouldReduceMotion ? 0 : 0.38,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        className="group flex w-full cursor-pointer select-none items-center justify-between py-8 text-left focus:outline-none"
                      >
                        <div className="flex min-w-0 flex-grow items-center pr-4">
                          <span className="no-invert w-8 shrink-0 font-mono text-xs text-white/30 md:w-12 md:text-sm">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="no-invert font-headline text-[clamp(0.95rem,1.5vw,1.1rem)] font-semibold text-white transition-colors group-hover:text-white/80 leading-relaxed">
                            {formatTypography(question)}
                          </h3>
                        </div>
                        <motion.span
                          className={`no-invert flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none ${isOpen ? "border-white bg-white text-black" : "border-white/10 text-white/50 group-hover:border-white/30 group-hover:text-white"}`}
                          animate={{
                            rotate: isOpen ? 45 : 0,
                            scale: isOpen ? 1 : 0.96,
                          }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          +
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={answerId}
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: {
                                duration: shouldReduceMotion ? 0 : 0.46,
                                ease: [0.22, 1, 0.36, 1],
                              },
                              opacity: {
                                duration: shouldReduceMotion ? 0 : 0.28,
                                ease: "easeOut",
                              },
                            }}
                            className="overflow-hidden"
                          >
                            <motion.p
                              initial={{ y: shouldReduceMotion ? 0 : -8 }}
                              animate={{ y: 0 }}
                              exit={{ y: shouldReduceMotion ? 0 : -6 }}
                              transition={{
                                duration: shouldReduceMotion ? 0 : 0.4,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="no-invert max-w-xl pb-[2.235rem] pl-8 font-sans text-[clamp(0.95rem,1.05vw,1.1rem)] leading-relaxed text-white/50 md:pl-12"
                            >
                              {formatTypography(answer)}
                            </motion.p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <SiteDevelopmentContactSection />
      </main>
    </>
  );
}
