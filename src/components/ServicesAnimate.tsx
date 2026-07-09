"use client";

import React, { useState } from "react";
import { useAnimate } from "framer-motion";
import { MorphingText } from "@/components/ui/liquid-text";
import { formatTypography } from "@/utils/typography";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { Button01 } from "@/components/ui/nextjsshop-button";

interface ServiceItem {
  title: string;
  description: string;
  shape: string;
}

const servicesData: ServiceItem[] = [
  {
    title: "Smm & Digital",
    description:
      "Превращаем социальные сети в инструмент привлечения клиентов. Разрабатываем контент-стратегию, создаем контент, организуем инфлюенс-маркетинг и выстраиваем регулярную коммуникацию с аудиторией. Работаем на рост узнаваемости бренда, вовлеченности и количества обращений.",
    shape: "/shapes/shape-smm.svg",
  },
  {
    title: "Маркетинг и стратегия",
    description:
      "Начинаем с аудита бизнеса и маркетинга, чтобы увидеть реальные точки роста. Формируем стратегию на 6–12 месяцев, выстраиваем путь клиента и определяем инструменты, которые помогут привлекать больше клиентов и масштабировать продажи.",
    shape: "/shapes/shape-marketing.svg",
  },
  {
    title: "Таргет и реклама",
    description:
      "Запускаем рекламу, которая работает в связке с маркетинговой стратегией. Анализируем аудиторию, создаём рекламные связки, тестируем гипотезы и оптимизируем кампании на основе данных. Наша задача не просто привести трафик, а превратить его в заявки и продажи.",
    shape: "/shapes/shape-target.svg",
  },
  {
    title: "Дизайн и брендинг",
    description:
      "Создаём визуальную систему, которая помогает бизнесу выглядеть профессионально и запоминаться. Разрабатываем фирменный стиль, рекламные материалы, презентации и носители бренда, сохраняя единый образ на всех площадках.",
    shape: "/shapes/shape-design.svg",
  },
  {
    title: "Продакшн",
    description:
      "Берём на себя полный цикл создания контента: от идеи, сценария и подбора команды до съёмки, монтажа, графики и адаптации под рекламные площадки. Управляем всеми этапами производства, чтобы каждый материал работал на маркетинговые цели бизнеса и усиливал бренд.",
    shape: "/shapes/shape-production.svg",
  },
  {
    title: "Разработка и web",
    description:
      "Быстрые конверсионные сайты с продуманным UX/UI. Экспресс-лендинги для теста ниши, и корпоративные сайты.",
    shape: "/shapes/shape-web.svg",
  },
  {
    title: "Организация и сопровождение",
    description:
      "Технический надзор, аудит digital-процессов и контроль подрядчиков. Долгосрочная поддержка сайта и консалтинг по оптимизации маркетинга.",
    shape: "/shapes/shape-organization.svg",
  },
];

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
  shape?: string;
  meta?: string;
  isCTA?: boolean;
  insetOutline?: boolean;
  outlineGridIndex?: number;
  onClick?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  shape,
  meta,
  isCTA = false,
  insetOutline = false,
  outlineGridIndex = 0,
  onClick,
}) => {
  const [scope, animate] = useAnimate();

  const getNearestSide = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();

    const proximityToLeft = {
      proximity: Math.abs(box.left - e.clientX),
      side: "left" as const,
    };
    const proximityToRight = {
      proximity: Math.abs(box.right - e.clientX),
      side: "right" as const,
    };
    const proximityToTop = {
      proximity: Math.abs(box.top - e.clientY),
      side: "top" as const,
    };
    const proximityToBottom = {
      proximity: Math.abs(box.bottom - e.clientY),
      side: "bottom" as const,
    };

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

  const insetTopClasses =
    outlineGridIndex === 0
      ? "before:border-t"
      : outlineGridIndex === 1
        ? "sm:before:border-t"
        : "";
  const insetLeftClasses =
    outlineGridIndex % 2 === 0
      ? "before:border-l lg:before:border-l-0"
      : "before:border-l sm:before:border-l-0";
  const borderClasses = insetOutline
    ? `before:pointer-events-none before:absolute before:inset-0 before:z-20 before:border-r before:border-b before:border-brand-gray/15 ${insetTopClasses} ${insetLeftClasses}`
    : "border-r border-b border-brand-gray/15";
  const cardClasses = isCTA
    ? `group relative flex flex-col justify-between pt-[clamp(1.25rem,2.5vw,3rem)] pr-[clamp(1.25rem,2.5vw,3rem)] pb-[clamp(1.25rem,2.5vw,3rem)] pl-[clamp(0.5rem,0.83vw,1rem)] bg-brand-red text-white min-h-[clamp(12rem,22vw,25rem)] cursor-pointer overflow-hidden ${borderClasses}`
    : `group relative flex flex-col justify-between pt-[clamp(1.25rem,2.5vw,3rem)] pr-[clamp(1.25rem,2.5vw,3rem)] pb-[clamp(1.25rem,2.5vw,3rem)] pl-[clamp(0.5rem,0.83vw,1rem)] bg-white text-brand-gray min-h-[clamp(12rem,22vw,25rem)] overflow-hidden cursor-pointer ${borderClasses}`;

  const overlayBg = isCTA ? "bg-brand-gray text-white" : "bg-brand-red text-white";

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cardClasses}
    >
      {/* Default State Content */}
      <div className="flex flex-col mb-4 h-full z-0">
        <div className="relative">
          {meta && (
            <span className="absolute right-0 top-0 font-mono text-[10px] text-brand-red">
              {meta}
            </span>
          )}
          {shape && (
            <div className="mb-6 md:mb-[clamp(1rem,1.8vw,2.2rem)] select-none">
              <img
                src={shape}
                alt=""
                className="w-[clamp(1.2rem,1.8vw,2rem)] h-[clamp(1.2rem,1.8vw,2rem)] object-contain"
              />
            </div>
          )}
          <h3 className={`no-invert font-headline font-semibold text-[clamp(1.2rem,1.78vw,1.6rem)] mb-6 md:mb-[clamp(0.75rem,1.5vw,1.5rem)] tracking-wide ${isCTA ? "text-white" : "text-brand-gray"} leading-[0.9]`}>
            {title}
          </h3>
        </div>

        {/* Description: Always visible on mobile, hidden on desktop (shown via hover overlay) */}
        <p className={`no-invert font-sans font-medium text-[clamp(0.9rem,0.9vw,0.95rem)] leading-relaxed md:hidden ${isCTA ? "text-white/85" : "text-brand-gray/75"}`}>
          {description}
        </p>
      </div>

      {/* Hover Reveal State Overlay - Hidden on mobile, active on desktop */}
      <div
        ref={scope}
        style={{
          clipPath: BOTTOM_RIGHT_CLIP,
        }}
        className={`absolute inset-0 hidden md:flex flex-col pt-[clamp(1.5rem,2.5vw,3rem)] pr-[clamp(1.5rem,2.5vw,3rem)] pb-[clamp(1.5rem,2.5vw,3rem)] pl-[clamp(0.5rem,0.83vw,1rem)] z-10 pointer-events-none ${overlayBg}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="relative">
            {meta && (
              <span className="absolute right-0 top-0 font-mono text-[10px] text-white/80">
                {meta}
              </span>
            )}
            {shape && (
              <div className="mb-[clamp(1rem,1.8vw,2.2rem)] select-none">
                <img
                  src={shape}
                  alt=""
                  className="w-[clamp(1.2rem,1.8vw,2rem)] h-[clamp(1.2rem,1.8vw,2rem)] object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            )}
            <h3 className="no-invert font-headline font-semibold text-white text-[clamp(1.2rem,1.78vw,1.6rem)] mb-[clamp(0.75rem,1.5vw,1.5rem)] tracking-wide leading-[0.9]">
              {title}
            </h3>
          </div>

          {/* Description perfectly aligned to the bottom grid alignment */}
          <p className="no-invert font-sans font-medium text-[clamp(0.75rem,0.9vw,0.95rem)] leading-relaxed text-white/90 mt-auto">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ServicesAnimate() {
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
          source: `Попап услуги: ${selectedService.title}`,
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
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] pt-[3rem] md:pt-[var(--page-margin)] pb-[clamp(3.5rem,7vw,7rem)] bg-white scroll-mt-[clamp(2rem,2.8vw,3.5rem)]"
      id="services"
    >
      {/* Section Header aligning with Swiss Grid columns */}
      <div className="swiss-grid mb-[clamp(2.5rem,5vw,4.5rem)]">
        <h2 className="col-span-12 md:col-start-7 md:col-span-6 lg:col-start-5 lg:col-span-8 xl:col-start-4 xl:col-span-9 font-headline font-semibold text-brand-gray text-[clamp(1.6rem,2.91vw,2.5rem)] leading-[0.9] select-none no-invert">
          <span className="inverttext">{formatTypography("Услуги, которые")}</span> <br />
          <span className="inverttext">{formatTypography("приносят ")}</span>
          <MorphingText
            texts={[
              "результат",
              "гордость",
              "узнаваемость",
              "клиентов",
              "прибыль",
            ]}
            className="text-brand-red font-headline font-semibold text-[clamp(1.6rem,2.91vw,2.5rem)] leading-[0.9]"
          />
        </h2>
      </div>

      {/* Grid Container */}
      <div className="swiss-grid w-full">
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-brand-gray/15 rounded-none w-full">
          {servicesData.map((service, index) => (
            <ServiceCard
              key={index}
              title={formatTypography(service.title)}
              description={formatTypography(service.description)}
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

          {/* Last slot: Elegant CTA card with same hover animation */}
          <ServiceCard
            title={formatTypography("Есть индивидуальный запрос?")}
            description={formatTypography("Расскажите нам о ваших бизнес-целях. Мы подготовим индивидуальную стратегию продвижения и сделаем расчет стоимости под ваши требования.")}
            isCTA={true}
            onClick={handleScrollToContacts}
          />
        </div>
      </div>

      {/* Swiss Pop-up Modal Form */}
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
                <span className="font-sans text-[10px] uppercase tracking-widest font-extrabold text-[#FD4B32]">Услуга</span>
                <h3 className="font-headline font-bold text-white text-xl md:text-2xl mt-1 tracking-wide leading-tight">
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
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
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
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
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
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
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
                            className={`py-1.5 px-3 text-center font-sans text-[9px] uppercase tracking-wider font-bold transition-all duration-400 border cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${isActive
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
                    <label className="font-sans text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
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
    </section>
  );
}
