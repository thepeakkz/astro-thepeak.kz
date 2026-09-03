"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";

import Navigation from "@/components/Navigation";
import HeroWave from "@/components/ui/dynamic-wave-canvas-background";
import CasesBentoGrid from "@/components/CasesBentoGrid";
import { allCasesData } from "@/data/cases";
import { formatTypography } from "@/utils/typography";
import { PortfolioGallery } from "@/components/ui/portfolio-gallery";
import ContactSection from "@/components/ContactSection";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { MorphingText } from "@/components/ui/liquid-text";


const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "180px 180px",
};

// Filter cases that are websites
const webCases = allCasesData.filter(item => 
  item.services.includes("WEB") || 
  item.services.includes("Дизайн") || 
  item.services.includes("Многостраничный сайт") || 
  item.services.includes("Лендинг") || 
  item.href === "/cases/uaz" ||
  item.href === "/cases/tinga-logistics"
);

// Web services data matching the interactive shape structure
interface ServiceItem {
  title: string;
  description: string;
  price: string;
  shape: string;
}

const servicesData: ServiceItem[] = [
  {
    title: "Дизайн сайта",
    description: "Создаём уникальный дизайн, который выделит ваш бизнес среди конкурентов. Прорабатываем UX/UI, структуру страниц, визуальный стиль и анимацию.",
    price: "от 150 000 ₸",
    shape: "/shapes/shape-design.svg",
  },
  {
    title: "Сайт на Tilda",
    description: "Быстрый запуск для любого бизнеса. Разрабатываем сайты на Tilda с индивидуальным дизайном на Zero Block, подключаем аналитику, формы приема заявок и все платежные системы.",
    price: "от 200 000 ₸",
    shape: "/shapes/shape-web.svg",
  },
  {
    title: "Лендинг",
    description: "Одностраничный сайт с высокой конверсией. Проектируем воронку продаж, пишем сильные офферы, создаем яркий дизайн и верстаем с идеальной адаптацией.",
    price: "от 100 000 ₸",
    shape: "/shapes/shape-target.svg",
  },
  {
    title: "Интернет-магазин",
    description: "Полноценная онлайн-витрина для ваших товаров. Настраиваем каталог, фильтрацию, корзину покупок, личный кабинет, системы оплаты и интеграции с CRM.",
    price: "от 350 000 ₸",
    shape: "/shapes/shape-marketing.svg",
  },
  {
    title: "Поддержка сайта",
    description: "Регулярное ведение и обновление вашего сайта. Следим за работоспособностью, обновляем контент, дорабатываем блоки и следим за безопасностью.",
    price: "от 60 000 ₸ / мес",
    shape: "/shapes/shape-organization.svg",
  },
  {
    title: "Доработки и правки",
    description: "Быстро внесём изменения в текущий сайт, настроим новые интеграции, исправим ошибки верстки или доработаем мобильную версию.",
    price: "от 30 000 ₸",
    shape: "/shapes/shape-production.svg",
  },
];

// Liquid clip path definitions for card hover
const NO_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
const BOTTOM_RIGHT_CLIP = "polygon(0 0, 100% 0, 0 0, 0% 100%)";
const TOP_RIGHT_CLIP = "polygon(0 0, 0 100%, 100% 100%, 0% 100%)";
const BOTTOM_LEFT_CLIP = "polygon(100% 100%, 100% 0, 100% 100%, 0 100%)";
const TOP_LEFT_CLIP = "polygon(0 0, 100% 0, 100% 100%, 100% 0)";

const ENTRANCE_KEYFRAMES = {
  left: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  bottom: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  top: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  right: [TOP_LEFT_CLIP, NO_CLIP],
};

const EXIT_KEYFRAMES = {
  left: [NO_CLIP, TOP_RIGHT_CLIP],
  bottom: [NO_CLIP, TOP_RIGHT_CLIP],
  top: [NO_CLIP, TOP_RIGHT_CLIP],
  right: [NO_CLIP, BOTTOM_LEFT_CLIP],
};

interface ServiceCardProps {
  title: string;
  description: string;
  price?: string;
  shape?: string;
  isCTA?: boolean;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  price,
  shape,
  isCTA = false,
  onClick,
}) => {
  const [scope, animate] = useAnimate();

  const getNearestSide = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const proximityToLeft = { proximity: Math.abs(box.left - e.clientX), side: "left" as const };
    const proximityToRight = { proximity: Math.abs(box.right - e.clientX), side: "right" as const };
    const proximityToTop = { proximity: Math.abs(box.top - e.clientY), side: "top" as const };
    const proximityToBottom = { proximity: Math.abs(box.bottom - e.clientY), side: "bottom" as const };

    const sortedProximity = [
      proximityToLeft,
      proximityToRight,
      proximityToTop,
      proximityToBottom,
    ].sort((a, b) => a.proximity - b.proximity);

    return sortedProximity[0].side;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 768) {
      const side = getNearestSide(e);
      animate(scope.current, {
        clipPath: ENTRANCE_KEYFRAMES[side],
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 768) {
      const side = getNearestSide(e);
      animate(scope.current, {
        clipPath: EXIT_KEYFRAMES[side],
      });
    }
  };

  // Dark-themed card styling: bg-[#0a0a0a] with white text and border-white/10
  const cardClasses = isCTA
    ? "group relative flex flex-col justify-between p-[20px] bg-[#FD4B32] text-white border-r border-b border-white/10 min-h-[clamp(12rem,22vw,25rem)] cursor-pointer overflow-hidden"
    : "group relative flex flex-col justify-between p-[20px] bg-[#0a0a0a] text-white border-r border-b border-white/10 min-h-[clamp(12rem,22vw,25rem)] overflow-hidden cursor-pointer";

  const overlayBg = isCTA ? "bg-[#111] text-white" : "bg-[#FD4B32] text-white";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cardClasses}
    >
      {/* Default State Content */}
      <div className="flex flex-col mb-4 h-full z-0 justify-between">
        <div>
          {shape && (
            <div className="mb-6 md:mb-[clamp(1rem,1.8vw,2.2rem)] select-none">
              <img
                src={shape}
                alt=""
                className="w-[clamp(1.2rem,1.8vw,2rem)] h-[clamp(1.2rem,1.8vw,2rem)] object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          )}
          <h3 className="no-invert font-headline font-semibold text-[clamp(1.2rem,1.78vw,1.6rem)] mb-24 md:mb-6 tracking-wide leading-[0.9] text-white">
            {title}
          </h3>
        </div>

        {/* Description: Always visible on mobile, hidden on desktop (shown via hover overlay) */}
        <p className="no-invert font-sans font-medium text-[clamp(0.9rem,0.9vw,0.95rem)] leading-relaxed md:hidden text-white/70">
          {description}
        </p>

        {price && (
          <div className="mt-auto pt-4 md:block hidden">
            <span className="font-mono text-sm text-[#FD4B32] font-semibold">{price}</span>
          </div>
        )}
      </div>

      {/* Hover Reveal State Overlay - Hidden on mobile, active on desktop */}
      <div
        ref={scope}
        style={{
          clipPath: BOTTOM_RIGHT_CLIP,
        }}
        className={`absolute inset-0 hidden md:flex flex-col p-[20px] z-10 pointer-events-none ${overlayBg}`}
      >
        <div className="flex flex-col h-full w-full justify-between">
          <div>
            {shape && (
              <div className="mb-[clamp(1rem,1.8vw,2.2rem)] select-none">
                <img
                  src={shape}
                  alt=""
                  className="w-[clamp(1.2rem,1.8vw,2rem)] h-[clamp(1.2rem,1.8vw,2rem)] object-contain"
                  style={{ filter: isCTA ? "brightness(0) invert(1)" : "none" }}
                />
              </div>
            )}
            <h3 className="no-invert font-headline font-semibold text-white text-[clamp(1.2rem,1.78vw,1.6rem)] mb-4 tracking-wide leading-[0.9]">
              {title}
            </h3>
          </div>

          <p className="no-invert font-sans font-medium text-[clamp(0.75rem,0.9vw,0.95rem)] leading-relaxed text-white/90">
            {description}
          </p>

          {price && (
            <div className="pt-2">
              <span className={`font-mono text-sm font-semibold ${isCTA ? "text-[#FD4B32]" : "text-white"}`}>
                {price}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Principles list
const principlesList = [
  {
    num: "01",
    tag: "с нами комфортно",
    title: "Про чёткие договорённости",
    body: "Всегда знаем и называем реальные сроки — если сказали «будет готово 25 марта», значит 25 марта вы получите ссылку или файлы. Отвечаем быстро: в рабочее время в течение 15–40 минут, даже в выходные чаще всего онлайн по срочным вопросам.",
  },
  {
    num: "02",
    tag: "вы — в центре внимания",
    title: "Про процесс и фокус на вас",
    body: "Мы берём не более двух проектов в месяц, чтобы сделать с полным погружением и отдачей. Каждый проект ведём сами: от идеи и концепции до финальной правки. Проверяем, шлифуем, не сдаём «лишь бы сдать».",
  },
  {
    num: "03",
    tag: "дизайн с умом",
    title: "Не просто красиво",
    body: "Мы за простые, но сильные решения без визуального шума — сочетание эстетики и здравого смысла, креатива и строгости.",
  },
];

// FAQ list
const faqs = [
  {
    q: "Есть ли поддержка проекта после сдачи?",
    a: "Да, конечно! После завершения работы мы всегда остаёмся на связи и помогаем клиентам с поддержкой сайта или помощью с типографией при необходимости. Можно также договориться о месячном ведении проекта за фиксированную плату.",
  },
  {
    q: "Если проект нужен «вчера»?",
    a: "В случае когда проект «нужен был еще вчера…» — стоимость может увеличиться до 50%.",
  },
  {
    q: "Вы помогаете с контентом?",
    a: "Да, мы можем помочь с написанием текста, подбором изображений или других материалов. Также мы работаем с нейросетями, поэтому можем сгенерировать уникальный контент на любую тему.",
  },
  {
    q: "Делаете ли сайты на коде?",
    a: "Для создания сайтов без использования конструкторов мы привлекаем проверенных разработчиков.",
  },
  {
    q: "Что не входит в стоимость?",
    a: "Подписка на платформу Tilda, хостинг, покупка и продление домена, покупка подписок на любые другие сторонние сервисы, которые вы планируете подключать, покупка дополнительных платных шрифтов, иконок, иллюстраций, фотографий и другого контента, оплата работ сторонних специалистов.",
  },
];

const galleryImages = [
  { src: "/cases/compass/cover.webp", alt: "Compass site", title: "Compass", href: "/cases/compass" },
  { src: "/cases/bebble.webp", alt: "Bebble site", title: "Bebble", href: "/cases/bebble" },
  { src: "https://res.cloudinary.com/dxvynbrut/image/upload/v1783590405/cases/shanding-logistics/cover.webp", alt: "Shanding site", title: "Shanding Logistics", href: "/cases/shanding-logistics" },
  { src: "/cases/tinga-logistics.webp", alt: "Tinga site", title: "Tinga Logistics", href: "/cases/tinga-logistics" },
  { src: "/cases/uaz.webp", alt: "UAZ site", title: "UAZ Kazakhstan", href: "/cases/uaz" },
];

export default function WebDirectionClient() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Services Modal popup form state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    contact: "",
    contactMethod: "WhatsApp",
    message: "",
    privacyConsent: true,
  });
  const [modalStatus, setModalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleScrollToContacts = () => {
    const contactsSection = document.getElementById("contacts");
    if (contactsSection) {
      contactsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !modalForm.name.trim() || !modalForm.contact.trim() || !modalForm.privacyConsent) {
      setModalStatus("error");
      return;
    }

    setModalStatus("loading");

    try {
      const commentText = modalForm.message.trim()
        ? `Услуга: ${selectedService.title}\n\n${modalForm.message.trim()}\n\n[Способ связи: ${modalForm.contactMethod}]`
        : `Заявка на услугу: ${selectedService.title}\n\n[Способ связи: ${modalForm.contactMethod}]`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modalForm.name.trim(),
          phone: modalForm.contact.trim(),
          comment: commentText,
          source: `Попап услуги веб-направления: ${selectedService.title}`,
        }),
      });

      if (response.ok) {
        setModalStatus("success");
        setModalForm({
          name: "",
          contact: "",
          contactMethod: "WhatsApp",
          message: "",
          privacyConsent: true,
        });
        setTimeout(() => {
          setSelectedService(null);
          setModalStatus("idle");
        }, 2200);
      } else {
        setModalStatus("error");
      }
    } catch (err) {
      console.error("Failed to submit modal form:", err);
      setModalStatus("error");
    }
  };


  return (
    <>
      <Navigation />

      <div
        className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] relative overflow-hidden"
        style={{ backgroundColor: "#060606", color: "#ffffff" }}
      >
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] z-50" style={GRAIN_STYLE} />
        <HeroWave />

        {/* ── 1. HERO COVER (PortfolioGallery) ── */}
        <PortfolioGallery
          title="Создаём сайты, которые построят прочную взаимосвязь между бизнесом и клиентом"
          archiveButton={{ text: "Смотреть кейсы", href: "/cases" }}
          images={galleryImages}
          className="border-b border-white/10"
        />

        {/* ── 2. STATS BLOCK ── */}
        <section className="relative py-16 border-b border-white/10 z-10 px-[var(--page-margin)] bg-black/10 select-none">
          <div className="swiss-grid w-full items-stretch gap-y-12">
            {/* Stat 1 */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-start gap-3 border-b md:border-b-0 pb-8 md:pb-0">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[#FD4B32] font-headline font-bold text-xl tracking-wider mb-1">
                  {formatTypography("Клиенты рекомендуют")}
                </span>
                <p className="text-white/60 font-sans text-sm leading-relaxed">
                  {formatTypography(
                    "к нам идут по советам тех, кто уже к нам обращался — это главный показатель того, что нам доверяют"
                  )}
                </p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-start gap-3 border-b md:border-b-0 pb-8 md:pb-0 md:border-l md:border-r border-white/10 md:px-6">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[#FD4B32] font-headline font-bold text-xl tracking-wider mb-1">
                  {formatTypography("8+ лет")}
                </span>
                <p className="text-white/60 font-sans text-sm leading-relaxed">
                  {formatTypography("развиваемся в своём деле, внедряя передовые веб-технологии")}
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="col-span-12 md:col-span-4 flex flex-col items-start gap-3">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[#FD4B32] font-headline font-bold text-xl tracking-wider mb-1">
                  {formatTypography("Более 100 проектов")}
                </span>
                <p className="text-white/60 font-sans text-sm leading-relaxed">
                  {formatTypography(
                    "точно понимаем специфику как маленького бизнеса, так и больших структур — и знаем, как решать задачи любого масштаба"
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. CASES BENTO GRID ── */}
        <section className="relative px-[var(--page-margin)] py-20 border-b border-white/10 z-10 bg-black/5">
          <div className="w-full mb-12">
            <h2 className="font-headline font-bold text-white text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.0] tracking-tight mb-4">
              {formatTypography("Наши кейсы")}
            </h2>
            <p className="text-white/50 font-sans text-sm tracking-wider">
              {formatTypography("От идеи до готового бренда: подборка наших кейсов")}
            </p>
          </div>
          <CasesBentoGrid cases={webCases} />
        </section>

        {/* ── 4. DYNAMIC SERVICES GRID (ServicesAnimate style) ── */}
        <section className="relative px-[var(--page-margin)] py-20 border-b border-white/10 z-10" id="services">
          <div className="swiss-grid mb-[clamp(2.5rem,5vw,4.5rem)]">
            <h2 className="col-span-12 md:col-span-10 lg:col-span-8 font-headline font-semibold text-white text-[clamp(1.6rem,2.91vw,2.5rem)] leading-[0.9] select-none">
              <span>Услуги, которые приносят </span>
              <MorphingText
                texts={["результат", "гордость", "узнаваемость", "клиентов", "прибыль"]}
                className="text-[#FD4B32] font-headline font-semibold text-[clamp(1.6rem,2.91vw,2.5rem)] leading-[0.9]"
              />
            </h2>
          </div>

          <div className="swiss-grid w-full">
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10 rounded-none w-full">
              {servicesData.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={formatTypography(service.title)}
                  description={formatTypography(service.description)}
                  price={formatTypography(service.price)}
                  shape={service.shape}
                  onClick={() => {
                    setSelectedService(service);
                    setModalForm({
                      name: "",
                      contact: "",
                      contactMethod: "WhatsApp",
                      message: "",
                      privacyConsent: true,
                    });
                    setModalStatus("idle");
                  }}
                />
              ))}

              {/* CTA Card */}
              <ServiceCard
                title={formatTypography("Есть индивидуальный запрос?")}
                description={formatTypography("Расскажите нам о ваших бизнес-целях. Мы подготовим индивидуальную концепцию сайта и сделаем точный расчет стоимости под ваши требования.")}
                isCTA={true}
                onClick={handleScrollToContacts}
              />
            </div>
          </div>
        </section>

        {/* ── 5. HEAD OF WEB DIRECTION ── */}
        <section className="relative px-[var(--page-margin)] py-20 border-b border-white/10 z-10 bg-black/10">
          <div className="max-w-4xl mx-auto border border-white/10 bg-[#0c0c0c] p-8 md:p-12 relative flex flex-col md:flex-row gap-8 items-center rounded-none">
            <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -bottom-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -right-3 -bottom-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />

            <div className="w-32 h-32 md:w-40 md:h-40 rounded-none overflow-hidden shrink-0 border border-white/15 relative">
              <img
                src="/me.webp"
                alt="Яков Пилипюк"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="space-y-4 text-center md:text-left flex-grow">
              <div>
                <h3 className="font-headline font-semibold text-2xl text-white">
                  {formatTypography("Яков Пилипюк")}
                </h3>
                <span className="text-white/40 font-sans text-xs tracking-wider block mt-1">
                  {formatTypography("Глава WEB направления / Дизайнер")}
                </span>
              </div>
              <blockquote className="text-white/80 font-sans text-base leading-relaxed italic border-l-2 border-[#FD4B32] pl-4 text-left">
                {formatTypography(
                  "«Мы запускаем проект только тогда, когда уверены в результате на 100%. Работаем так, чтобы вы рекомендовали нас коллегам. Сарафанное радио — наш главный маркер качества»."
                )}
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── 6. PRINCIPLES ── */}
        <section className="relative px-[var(--page-margin)] py-20 border-b border-white/10 z-10">
          <div className="w-full mb-12">
            <h2 className="font-headline font-bold text-white text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.0] tracking-tight mb-4">
              {formatTypography("Принципы в работе")}
            </h2>
            <p className="text-white/50 font-sans text-sm leading-relaxed max-w-2xl">
              {formatTypography(
                "Дорожим каждым клиентом — за годы работы мы отточили для себя простые, но важные моменты и вот почему нас советуют и хотят возвращаться вновь:"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-l border-white/10 w-full">
            {principlesList.map((p) => (
              <div
                key={p.num}
                className="group relative flex flex-col justify-between p-8 bg-[#0a0a0a] border-r border-b border-white/10 min-h-[300px] hover:bg-[#FD4B32]/10 transition-colors duration-300"
              >
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-white/30 mb-8 block">{p.num}</span>
                  <span className="text-[#FD4B32] font-sans text-xs font-bold tracking-wider block mb-2">
                    [{formatTypography(p.tag)}]
                  </span>
                  <h3 className="font-headline font-semibold text-xl text-white leading-tight mb-4">
                    {formatTypography(p.title)}
                  </h3>
                  <p className="text-white/60 font-sans text-sm leading-relaxed">
                    {formatTypography(p.body)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. FAQ ACCORDION ── */}
        <section className="relative px-[var(--page-margin)] py-20 border-b border-white/10 z-10 bg-black/10">
          <div className="swiss-grid items-stretch w-full">
            {/* Left */}
            <div className="col-span-12 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8 flex flex-col justify-center">
              <h2 className="font-headline font-bold text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.0] tracking-tight text-white mb-6">
                {formatTypography("Что важно знать?")}
              </h2>
              <p className="text-white/50 font-sans text-base leading-relaxed max-w-sm">
                {formatTypography(
                  "Отвечаем на популярные вопросы о процессе, поддержке, стоимости и непредвиденных расходах."
                )}
              </p>
            </div>

            {/* Right */}
            <div className="col-span-12 lg:col-span-7 lg:pl-8 flex flex-col">
              <div className="flex flex-col border-t border-white/10">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="border-b border-white/10">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full text-left py-6 flex items-center justify-between group cursor-pointer focus:outline-none select-none"
                      >
                        <div className="flex items-center gap-4 flex-grow min-w-0 pr-4">
                          <HelpCircle className="w-5 h-5 text-white/30 group-hover:text-[#FD4B32] transition-colors shrink-0" />
                          <h3 className="font-headline font-semibold text-sm text-white group-hover:text-white/80 transition-colors leading-relaxed">
                            {formatTypography(faq.q)}
                          </h3>
                        </div>

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
                            <p className="pb-6 pl-9 text-white/50 font-sans text-sm leading-relaxed max-w-xl">
                              {formatTypography(faq.a)}
                            </p>
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

        {/* ── 8. CONTACT FORM (ContactSection) ── */}
        <ContactSection />
      </div>

      {/* Pop-up Modal Form for Services */}
      {selectedService && (
        <div
          onClick={() => {
            setSelectedService(null);
            setModalStatus("idle");
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#060606] border border-white/10 w-full max-w-lg p-6 md:p-10 relative rounded-none animate-in fade-in zoom-in-95 duration-400 cursor-default"
          >
            <div className="absolute -top-2.5 -left-2.5 text-[#FD4B32] select-none text-xl font-light pointer-events-none">+</div>
            <div className="absolute -top-2.5 -right-2.5 text-[#FD4B32] select-none text-xl font-light pointer-events-none">+</div>
            <div className="absolute -bottom-2.5 -left-2.5 text-[#FD4B32] select-none text-xl font-light pointer-events-none">+</div>
            <div className="absolute -right-2.5 -bottom-2.5 text-[#FD4B32] select-none text-xl font-light pointer-events-none">+</div>

            <button
              onClick={() => {
                setSelectedService(null);
                setModalStatus("idle");
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors duration-400 cursor-pointer p-2 border border-white/10 hover:border-white/30 rounded-none flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="font-headline font-bold text-white text-xl md:text-2xl tracking-wide leading-tight">
                  {selectedService.title}
                </h3>
                <p className="font-sans text-xs text-white/60 mt-2 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {modalStatus === "success" ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-white text-black flex items-center justify-center mx-auto rounded-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-headline font-semibold text-white text-base leading-tight">
                    Заявка отправлена
                  </h4>
                  <p className="font-sans text-xs text-neutral-400">
                    Мы свяжемся с вами в ближайшее время.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 tracking-widest block">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modalStatus === "loading"}
                      placeholder="Иван Иванов"
                      value={modalForm.name}
                      onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                      className="w-full font-sans text-sm text-white bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 outline-none transition-colors duration-400 rounded-none placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 tracking-widest block">
                      Телефон
                    </label>
                    <PhoneInput
                      value={modalForm.contact}
                      onChange={(val) => setModalForm({ ...modalForm, contact: val })}
                      theme="dark"
                      variant="box"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 tracking-widest block">
                      Где с вами связаться?
                    </label>
                    <div className="flex flex-wrap gap-2 w-fit">
                      {["WhatsApp", "Telegram", "Звонок"].map((method) => {
                        const isActive = modalForm.contactMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            disabled={modalStatus === "loading"}
                            onClick={() => setModalForm({ ...modalForm, contactMethod: method })}
                            className={`py-1.5 px-3 text-center font-sans text-[9px] tracking-wider font-bold transition-all duration-400 border cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${isActive
                              ? "bg-white text-black border-white"
                              : "bg-transparent text-neutral-400 border-white/10 hover:bg-white/5 hover:text-white"
                              }`}
                          >
                            {formatTypography(method)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 tracking-widest block">
                      О проекте / Комментарий
                    </label>
                    <textarea
                      rows={2}
                      disabled={modalStatus === "loading"}
                      placeholder="Что вас интересует в этой услуге?"
                      value={modalForm.message}
                      onChange={(e) => setModalForm({ ...modalForm, message: e.target.value })}
                      className="w-full font-sans text-sm text-white bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 outline-none transition-colors duration-400 resize-none rounded-none placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <PrivacyConsentCheckbox
                    checked={modalForm.privacyConsent}
                    onCheckedChange={(checked) => setModalForm({ ...modalForm, privacyConsent: checked })}
                    disabled={modalStatus === "loading"}
                    variant="dark"
                  />

                  {modalStatus === "error" && (
                    <p className="text-red-500 font-sans text-xs font-semibold">
                      Произошла ошибка. Пожалуйста, попробуйте еще раз.
                    </p>
                  )}

                  <Button01
                    type="submit"
                    disabled={modalStatus === "loading"}
                    text={modalStatus === "loading" ? "Отправка..." : "Отправить заявку"}
                    variant="dark"
                    className="w-full cursor-pointer"
                  />
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
