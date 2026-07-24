"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { preloadedCache } from "@/hooks/usePagePreloader";
import HeroWave from "@/components/ui/dynamic-wave-canvas-background";
import CaseVideoGallery from "@/components/CaseVideoGallery";
import { formatTypography } from "@/utils/typography";

import { cn } from "@/lib/utils";
import { CONTACTS } from "@/config/contacts";
import {
  IconPlus,
  IconPhone,
  IconMail,
  IconMapPin,
  IconSend,
  IconBrandTelegram,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { Button01 } from "@/components/ui/nextjsshop-button";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";


// ─── Metrics Data (Hidden by default in layout) ──────────────────────────────
const metrics = [
  {
    value: "2025",
    label: "Регулярный выпуск вовлекающего видеоконтента",
    index: "01",
  },
  {
    value: "100%",
    label: "Передача динамики и экспертности бренда",
    index: "02",
  },
  {
    value: "Reels",
    label: "Органический охват целевой аудитории автовладельцев",
    index: "03",
  },
  {
    value: "Статус",
    label: "Формирование доверия к бренду",
    index: "04",
  },
];

// ─── Grain SVG as data URL ─────────────────────────────────────────────────────
const GRAIN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "180px 180px",
};

// ─── Contact Info Dark Component ─────────────────────────────────────────────
interface ContactInfoDarkProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  className?: string;
}

function ContactInfoDark({
  icon: Icon,
  value,
  className,
  ...props
}: ContactInfoDarkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPhone = value === CONTACTS.phone.display;

  if (isPhone) {
    return (
      <div
        className={cn("flex items-center gap-4 py-3 rounded-none select-none", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <a
          href={CONTACTS.phone.tel}
          aria-label={CONTACTS.phone.ariaLabel}
          className="bg-white/5 p-3 rounded-none flex items-center justify-center flex-shrink-0 text-[#FD4B32] hover:text-white hover:bg-[#FD4B32] transition-colors duration-200 border border-white/10 cursor-pointer no-invert"
        >
          <Icon className="h-5 w-5" />
        </a>
        <div className="relative flex items-center h-12 w-48 overflow-hidden">
          <span
            className={cn(
              "font-sans font-bold text-sm text-white uppercase tracking-wider transition-all duration-300 absolute left-0 whitespace-nowrap no-invert",
              isHovered ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            {value}
          </span>

          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300 absolute left-0",
              isHovered
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            <a
              href={CONTACTS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="no-invert p-3 bg-white/5 hover:bg-[#FD4B32] text-white hover:text-white transition-colors duration-200 border border-white/10 rounded-none flex items-center justify-center cursor-pointer"
            >
              <IconBrandTelegram className="w-5 h-5" stroke={1.2} />
            </a>

            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="no-invert p-3 bg-white/5 hover:bg-[#FD4B32] text-white hover:text-white transition-colors duration-200 border border-white/10 rounded-none flex items-center justify-center cursor-pointer"
            >
              <IconBrandWhatsapp className="w-5 h-5" stroke={1.2} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 py-3 rounded-none", className)} {...props}>
      <div className="bg-white/5 p-3 rounded-none flex items-center justify-center flex-shrink-0 text-[#FD4B32] border border-white/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-sans font-bold text-sm text-white uppercase tracking-wider no-invert">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function RisCasePage() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "+7",
    contactMethod: "WhatsApp",
    message: "",
          privacyConsent: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name.trim() || !formData.contact.trim() || !formData.privacyConsent) {
      setSubmitError("Заполните имя, контактный телефон и согласие с политикой конфиденциальности.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const commentText = formData.message.trim()
        ? `${formData.message.trim()}\n\n[Способ связи: ${formData.contactMethod}]`
        : `[Способ связи: ${formData.contactMethod}]`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.contact.trim(),
          comment: commentText,
          source: `Страница кейса: ${document.title}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit case form:", error);
      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />

      <div
        className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] relative overflow-hidden"
        style={{ backgroundColor: "#060606", color: "#ffffff" }}
      >
        <HeroWave />
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-end overflow-hidden border-b border-white/10">
          <video
            src={preloadedCache["/cases/ris.mp4"] || "/cases/ris.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-[#060606]/85" />

          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ ...GRAIN_STYLE, opacity: 0.13 }}
          />

          
          <div className="relative z-10 px-[var(--page-margin)] pt-40 pb-20 md:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-end">
              <div className="lg:col-span-8 space-y-6">
                <h1
                  className="no-invert font-sans font-semibold text-white leading-[0.9] tracking-tight uppercase"
                  style={{ fontSize: "clamp(3rem, 7.5vw, 7.5rem)" }}
                >
                  Рис
                </h1>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="grid grid-cols-3 gap-px border border-white/10">
                  {[
                    { label: "Старт", value: "2025" },
                    { label: "Услуга", value: "SMM" },
                    { label: "Направление", value: "Ресторан" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-4 border border-white/10"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <p className="no-invert case-meta-label font-sans text-white/30 uppercase mb-1">
                        {label}
                      </p>
                      <p className="no-invert font-sans text-white text-sm font-semibold">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <Button01
                  href="https://www.instagram.com/ris.nazarbaeva/reels/"
                  target="_blank"
                  rel="noopener noreferrer"
                  text="Смотреть профиль"
                  variant="dark"
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-16 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="no-invert text-[10px] font-sans text-white/20 uppercase tracking-[0.3em]">
                {formatTypography("2025")}
              </span>
            </div>
          </div>
        </section>

        {/* ── METRICS GRID (Hidden as per reference layout) ── */}
        <section className="relative border-b border-white/10 hidden">
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ ...GRAIN_STYLE, opacity: 0.08 }}
          />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ value, label, index }) => (
              <div
                key={index}
                className="relative p-8 md:p-10 border-r border-b border-white/10 last:border-r-0 sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r lg:[&:nth-child(4)]:border-r-0 flex flex-col justify-between gap-10 group overflow-hidden"
                style={{ minHeight: "240px", transition: "background 0.4s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span className="no-invert font-sans text-[10px] text-white/20 uppercase tracking-[0.3em]">
                  {index}
                </span>
                <div>
                  <div
                    className="no-invert font-sans font-semibold text-white leading-none tracking-tight"
                    style={{ fontSize: "clamp(2.8rem, 5vw, 5.5rem)" }}
                  >
                    {value}
                  </div>
                  <p
                    className="no-invert font-sans text-white/40 mt-4 leading-snug"
                    style={{ fontSize: "clamp(0.75rem, 1vw, 0.9rem)" }}
                  >
                    {formatTypography(label)}
                  </p>
                </div>
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: "#FD4B32" }}
                />
              </div>
            ))}
          </div>
        </section>

                {/* ── REELS GRID GALLERY ────────────────────────────── */}
                <CaseVideoGallery slug="ris" />

                {/* ── CONTACT FORM SECTION ─────────────────────────── */}
        <section className="relative border-b border-white/10 px-[var(--page-margin)] py-20 md:py-28" id="contacts">
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{ ...GRAIN_STYLE, opacity: 0.08 }}
          />
          <div className="bg-[#0c0c0c] border border-white/10 relative flex flex-col md:grid h-full w-full md:grid-cols-2 lg:grid-cols-3 rounded-none z-10">
            <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -bottom-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
            <IconPlus className="absolute -right-3 -bottom-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />

            <div className="flex flex-col justify-between lg:col-span-2 h-full">
              <div className="relative h-full flex flex-col justify-between px-5 py-8 md:p-12 gap-8">
                <div className="space-y-6">
                  <h2 className="no-invert font-headline font-semibold text-white tracking-wide text-[clamp(1.4rem,2.2vw,2.5rem)] leading-[1.0] max-w-xl">
                    {formatTypography("Хотите такие\u00a0же результаты\u00a0и контент?")}
                  </h2>
                  <p className="no-invert description-text text-white/60 max-w-xl leading-relaxed text-sm sm:text-base">
                    {formatTypography("Если вы\u00a0хотите обсудить проект или\u00a0у\u00a0вас есть вопросы по\u00a0нашим услугам, пожалуйста, заполните форму. Мы\u00a0ответим вам в\u00a0течение 1\u00a0рабочего дня.")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-x-8 gap-y-4 pt-6 border-t border-white/10 mt-auto">
                  <ContactInfoDark icon={IconPhone} value={CONTACTS.phone.display} />
                  <ContactInfoDark icon={IconMail} value={CONTACTS.email} />
                  <ContactInfoDark icon={IconMapPin} value={CONTACTS.address} />
                </div>
              </div>
            </div>
            <div className="bg-white/[0.02] flex h-full w-full items-start border-t border-white/10 p-6 md:py-12 md:px-8 md:col-span-1 md:border-t-0 md:border-l md:border-white/10 rounded-none">
              {submitted ? (
                <div className="w-full text-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-[#FD4B32] text-white flex items-center justify-center mx-auto rounded-none no-invert">
                    <IconSend className="w-5 h-5" stroke={1.2} />
                  </div>
                  <h3 className="no-invert font-headline font-semibold text-white text-base leading-[0.9]">
                    {formatTypography("Спасибо за заявку!")}
                  </h3>
                  <p className="no-invert font-sans font-medium text-white/60 text-sm">
                    {formatTypography("Мы свяжемся с вами в течение ближайшего времени.")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full space-y-8">
                  <div className="space-y-1.5">
                    <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 rounded-none placeholder-white/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">
                      Контакты (Телефон)
                    </label>
                    <PhoneInput
                      value={formData.contact}
                      onChange={(val) => setFormData({ ...formData, contact: val })}
                      theme="dark"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">
                      Где с вами связаться?
                    </label>
                    <div className="flex flex-wrap gap-2 w-fit">
                      {["WhatsApp", "Telegram", "Звонок"].map((method) => {
                        const isActive = formData.contactMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setFormData({ ...formData, contactMethod: method })}
                            className={`no-invert py-1.5 px-3 text-center font-sans text-[10px] uppercase tracking-wider font-bold transition-colors duration-200 border cursor-pointer rounded-none ${isActive
                              ? "bg-white text-black border-white"
                              : "bg-transparent text-white/50 border-white/20 hover:bg-white/5"
                              }`}
                          >
                            {formatTypography(method)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">
                      О вашем проекте
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Расскажите о задачах и целях проекта..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 resize-none rounded-none placeholder-white/20"
                    />
                  </div>

                  <PrivacyConsentCheckbox
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, privacyConsent: checked })}
                    disabled={isSubmitting}
                    variant="dark"
                  />

                  {submitError && (

                    <p className="no-invert text-[#FD4B32] font-sans text-xs font-semibold leading-relaxed">

                      {formatTypography(submitError)}

                    </p>

                  )}

                                      <Button01
                    type="submit"
                    disabled={isSubmitting}
                    text={isSubmitting ? "Отправка..." : "Отправить заявку"}
                    variant="dark"
                    className="w-full justify-between"
                  />
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
