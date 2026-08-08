"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { formatTypography } from "@/utils/typography";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { Button01 } from "@/components/ui/nextjsshop-button";

type ContactInfoProps = React.ComponentProps<"div"> & {
  icon: React.ComponentType<{ className?: string }>;
  label?: string;
  value: string;
};

type ContactCardProps = React.ComponentProps<"div"> & {
  title?: string;
  description?: string;
  contactInfo?: ContactInfoProps[];
  formSectionClassName?: string;
};

export function ContactCard({
  title = "Связаться с нами",
  description = "Если у вас есть вопросы по нашим услугам или вы хотите обсудить проект, пожалуйста, заполните форму. Мы ответим вам в течение 1 рабочего дня.",
  contactInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-brand-gray/15 relative flex flex-col md:grid h-full w-full md:grid-cols-2 lg:grid-cols-3 rounded-none",
        className
      )}
      {...props}
    >
      <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
      <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
      <IconPlus className="absolute -bottom-3 -left-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
      <IconPlus className="absolute -right-3 -bottom-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
      
      <div className="flex flex-col justify-between lg:col-span-2 h-full">
        <div className="relative h-full flex flex-col justify-between px-5 py-8 md:p-12 gap-8">
          <div className="space-y-6">
            <h2 className="font-headline font-semibold text-brand-gray tracking-tight text-[clamp(2rem,3vw,3.25rem)] !leading-[1]">
              {formatTypography(title)}
            </h2>
            <p className="description-text max-w-2xl text-brand-gray/80 !text-[clamp(1.125rem,1.45vw,1.375rem)] !leading-[1.25]">
              {formatTypography(description)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-x-8 gap-y-4 pt-6 border-t border-brand-gray/10 mt-auto">
            {contactInfo?.map((info, index) => (
              <ContactInfo key={index} {...info} />
            ))}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "bg-brand-light-gray/40 flex h-full w-full items-start border-t border-brand-gray/15 p-6 md:py-12 md:px-8 md:col-span-1 md:border-t-0 md:border-l rounded-none",
          formSectionClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  value,
  className,
  ...props
}: ContactInfoProps) {
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
          className="bg-brand-light-gray p-3 rounded-none flex items-center justify-center flex-shrink-0 text-brand-red hover:text-white hover:bg-brand-red transition-colors duration-200 border border-brand-gray/10 cursor-pointer no-invert"
        >
          <Icon className="h-5 w-5" />
        </a>
        <div className="relative flex items-center h-12 w-48 overflow-hidden">
          {/* Display Phone Number */}
          <span
            className={cn(
              "font-sans font-bold text-sm text-brand-gray uppercase tracking-wider transition-all duration-300 absolute left-0 whitespace-nowrap",
              isHovered ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            {value}
          </span>

          {/* Hover Icons Container (Telegram & WhatsApp only) */}
          <div 
            className={cn(
              "flex items-center gap-3 transition-all duration-300 absolute left-0",
              isHovered 
                ? "opacity-100 scale-100 pointer-events-auto" 
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            {/* Telegram Link */}
            <a
              href={CONTACTS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="no-invert p-3 bg-brand-light-gray hover:bg-brand-red text-brand-gray hover:text-white transition-colors duration-200 border border-brand-gray/10 rounded-none flex items-center justify-center cursor-pointer"
            >
              <IconBrandTelegram className="w-5 h-5" stroke={1.2} />
            </a>

            {/* WhatsApp Link */}
            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="no-invert p-3 bg-brand-light-gray hover:bg-brand-red text-brand-gray hover:text-white transition-colors duration-200 border border-brand-gray/10 rounded-none flex items-center justify-center cursor-pointer"
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
      <div className="bg-brand-light-gray p-3 rounded-none flex items-center justify-center flex-shrink-0 text-brand-red border border-brand-gray/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-sans font-bold text-sm text-brand-gray uppercase tracking-wider">{value}</p>
      </div>
    </div>
  );
}

export default function ContactSection({
  title = "Связаться с нами",
  description = "Если у вас есть вопросы по нашим услугам или вы хотите обсудить проект, пожалуйста, заполните форму. Мы ответим вам в течение 1 рабочего дня.",
}: {
  title?: string;
  description?: string;
}) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    contactMethod: "WhatsApp",
    message: "",
          privacyConsent: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [phoneError, setPhoneError] = useState(false);

  const isPhoneValid = () => {
    if (!formData.contact) return false;
    const phone = formData.contact;
    const digits = phone.replace(/\D/g, "");
    if (phone.startsWith("+7") || phone.startsWith("+1") || phone.startsWith("+33")) return digits.length === 11;
    if (phone.startsWith("+375") || phone.startsWith("+380") || phone.startsWith("+996") || phone.startsWith("+998") || phone.startsWith("+49") || phone.startsWith("+44")) return digits.length === 12;
    return digits.length > 5;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(false);

    if (!isPhoneValid()) {
      setPhoneError(true);
      return;
    }

    if (!formData.name.trim() || !formData.contact.trim() || !formData.privacyConsent) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const commentText = formData.message.trim()
        ? `${formData.message.trim()}\n\n[Способ связи: ${formData.contactMethod}]`
        : `[Способ связи: ${formData.contactMethod}]`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.contact.trim(),
          comment: commentText,
          source: "Главная страница (Связаться с нами)",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: "",
          contact: "",
          contactMethod: "WhatsApp",
          message: "",
          privacyConsent: true,
        });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to submit form:", err);
      setStatus("error");
    }
  };

  const contactData: ContactInfoProps[] = [
    {
      icon: IconPhone,
      value: CONTACTS.phone.display,
    },
    {
      icon: IconMail,
      value: CONTACTS.email,
    },
    {
      icon: IconMapPin,
      value: CONTACTS.address,
    },
  ];

  return (
    <section 
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] pt-[var(--page-margin)] pb-[clamp(3.5rem,7vw,7rem)] border-b border-brand-gray/10 bg-brand-light-gray/10 px-[var(--page-margin)] scroll-mt-[clamp(2rem,2.8vw,3.5rem)]" 
      id="contacts"
    >
      <ContactCard 
        title={title}
        description={description}
        contactInfo={contactData}
        formSectionClassName="bg-[#060606] border-t md:border-t-0 md:border-l border-white/10"
      >
        {status === "success" ? (
          <div className="w-full text-center py-10 space-y-4">
            <div className="w-12 h-12 bg-white text-black flex items-center justify-center mx-auto rounded-none">
              <IconSend className="w-5 h-5" stroke={1.5} />
            </div>
            <h3 className="font-headline font-semibold text-white text-base leading-[1.2]">
              {formatTypography("Заявка отправлена")}
            </h3>
            <p className="font-sans font-medium text-neutral-400 text-sm">
              {formatTypography("Мы свяжемся с вами в ближайшее время.")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="space-y-1.5">
              <label className="font-sans text-xs sm:text-xs font-extrabold text-neutral-400 uppercase tracking-widest block">
                Ваше имя
              </label>
              <input
                type="text"
                required
                disabled={status === "loading"}
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/\d/g, "") })}
                className="w-full font-sans text-sm text-white bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 outline-none transition-colors duration-200 rounded-none placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-extrabold text-neutral-400 uppercase tracking-widest block">
                Контакты (Телефон)
              </label>
              <PhoneInput
                value={formData.contact}
                onChange={(val) => {
                  setFormData({ ...formData, contact: val });
                  setPhoneError(false);
                }}
                theme="dark"
                variant="box"
                required
              />
              {phoneError && (
                <p className="text-red-500 font-sans text-xs mt-1">Пожалуйста, введите полный номер телефона</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-extrabold text-neutral-400 uppercase tracking-widest block">
                Где с вами связаться?
              </label>
              <div className="flex flex-wrap gap-2 w-fit">
                {["WhatsApp", "Telegram", "Звонок"].map((method) => {
                  const isActive = formData.contactMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      disabled={status === "loading"}
                      onClick={() => setFormData({ ...formData, contactMethod: method })}
                      className={`no-invert py-1.5 px-3 text-center font-sans text-[10px] uppercase tracking-wider font-bold transition-all duration-200 border cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        isActive
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
              <label className="font-sans text-xs font-extrabold text-neutral-400 uppercase tracking-widest block">
                О вашем проекте
              </label>
              <textarea
                rows={3}
                disabled={status === "loading"}
                placeholder="Расскажите о задачах и целях проекта..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full font-sans text-sm text-white bg-white/5 border border-white/10 focus:border-white/30 px-4 py-3 outline-none transition-colors duration-200 resize-none rounded-none placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <PrivacyConsentCheckbox
              checked={formData.privacyConsent}
              onCheckedChange={(checked) => setFormData({ ...formData, privacyConsent: checked })}
              disabled={status === "loading"}
              variant="dark"
            />

            {status === "error" && (
              <p className="text-red-500 font-sans text-xs font-semibold">
                Произошла ошибка при отправке заявки. Пожалуйста, свяжитесь с нами напрямую или попробуйте ещё раз.
              </p>
            )}

            <Button01
              type="submit"
              disabled={status === "loading"}
              text={status === "loading" ? "Отправка..." : "Отправить заявку"}
              variant="dark"
              className="w-full cursor-pointer"
            />
          </form>
        )}
      </ContactCard>

      {/* Footer bar */}
      <div className="mt-8 pt-6 border-t border-brand-gray/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="font-sans text-xs text-brand-gray/40">
          © {new Date().getFullYear()} ThePeak. Все права защищены.
        </p>
        <Link
          href="/privacy"
          className="font-sans text-xs text-brand-gray/40 hover:text-brand-red transition-colors duration-200 underline underline-offset-4 decoration-brand-gray/20 hover:decoration-brand-red"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </section>
  );
}
