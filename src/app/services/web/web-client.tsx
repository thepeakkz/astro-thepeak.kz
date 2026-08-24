"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CONTACTS } from "@/config/contacts";
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { IconPlus, IconPhone, IconMail, IconMapPin, IconSend, IconBrandTelegram, IconBrandWhatsapp } from "@tabler/icons-react";

import { HeroSection } from "@/components/web-service/HeroSection";
import { ClientLogos } from "@/components/web-service/ClientLogos";
import { PricingSection } from "@/components/web-service/PricingSection";
import { QuizSection } from "@/components/web-service/QuizSection";
import { ComplexSolutionsSection } from "@/components/web-service/ComplexSolutionsSection";
import { StepsSection } from "@/components/web-service/StepsSection";
import { FAQSection } from "@/components/web-service/FAQSection";
import { ManagerContact } from "@/components/web-service/ManagerContact";
import { CTASection } from "@/components/web-service/CTASection";

// ─── Grain SVG Background ──────────────────────────────────────────────
const GRAIN_STYLE: React.CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "180px 180px",
};

interface ContactInfoDarkProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    className?: string;
}

function ContactInfoDark({ icon: Icon, value, className, ...props }: ContactInfoDarkProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isPhone = value === CONTACTS.phone.display;

    if (isPhone) {
        return (
            <div className={cn("flex items-center gap-4 py-3 rounded-none select-none", className)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} {...props}>
                <a href={CONTACTS.phone.tel} aria-label={CONTACTS.phone.ariaLabel} className="bg-white/5 p-3 rounded-none flex items-center justify-center flex-shrink-0 text-[#FD4B32] hover:text-white hover:bg-[#FD4B32] transition-colors duration-200 border border-white/10 cursor-pointer no-invert">
                    <Icon className="h-5 w-5" />
                </a>
                <div className="relative flex items-center h-12 w-48 overflow-hidden">
                    <span className={cn("font-sans font-bold text-sm text-white uppercase tracking-wider transition-all duration-300 absolute left-0 whitespace-nowrap no-invert", isHovered ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100")}>{value}</span>
                    <div className={cn("flex items-center gap-3 transition-all duration-300 absolute left-0", isHovered ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none")}>
                        <a href={CONTACTS.telegramUrl} target="_blank" rel="noopener noreferrer" className="no-invert p-3 bg-white/5 hover:bg-[#FD4B32] text-white transition-colors duration-200 border border-white/10 rounded-none cursor-pointer"><IconBrandTelegram className="w-5 h-5" stroke={1.2} /></a>
                        <a href={CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="no-invert p-3 bg-white/5 hover:bg-[#FD4B32] text-white transition-colors duration-200 border border-white/10 rounded-none cursor-pointer"><IconBrandWhatsapp className="w-5 h-5" stroke={1.2} /></a>
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

export default function WebClient() {
    const [formData, setFormData] = useState({ name: "", contact: "", contactMethod: "WhatsApp", message: "", privacyConsent: true });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.contact.trim() || !formData.privacyConsent) {
            setStatus("error");
            return;
        }
        setStatus("loading");
        try {
            const commentText = formData.message.trim() ? `${formData.message.trim()}\n\n[Способ связи: ${formData.contactMethod}]` : `[Способ связи: ${formData.contactMethod}]`;
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name.trim(), phone: formData.contact.trim(), comment: commentText, source: "Страница разработки сайтов (Подвал)" }),
            });
            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", contact: "", contactMethod: "WhatsApp", message: "", privacyConsent: true });
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("Failed to submit form:", err);
            setStatus("error");
        }
    };

    return (
        <>
            <HeroSection />
            <ClientLogos />
            <QuizSection />
            <PricingSection />
            <ComplexSolutionsSection />
            <StepsSection />
            <FAQSection />
            <ManagerContact />
            <CTASection />
            
            {/* ПОДВАЛ / ТЕМНАЯ ЗЕРНИСТАЯ ФОРМА */}
            <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] relative border-b border-white/10 py-20 md:py-28 bg-[#060606]" id="contacts">
                <div className="pointer-events-none absolute inset-0 z-0" style={{ ...GRAIN_STYLE, opacity: 0.08 }} />
                <div className="swiss-grid relative z-10">
                    <div className="col-span-12 bg-[#0c0c0c] border border-white/10 relative flex flex-col md:grid h-full w-full md:grid-cols-2 lg:grid-cols-3 rounded-none">
                        <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
                        <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
                        <IconPlus className="absolute -bottom-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
                        <IconPlus className="absolute -right-3 -bottom-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />

                        <div className="flex flex-col justify-between lg:col-span-2 h-full">
                            <div className="relative h-full flex flex-col justify-between px-5 py-8 md:p-12 gap-8">
                                <div className="space-y-6">
                                    <h2 className="no-invert font-headline font-semibold text-white tracking-wide text-[clamp(1.4rem,2.2vw,2.5rem)] leading-[1.0] max-w-xl">
                                        {formatTypography("Оставьте заявку и\u00a0узнайте стоимость и\u00a0сроки")}
                                    </h2>
                                    <p className="no-invert description-text text-white/60 max-w-xl leading-relaxed text-sm sm:text-base">
                                        {formatTypography("Расскажите о\u00a0своей цели, и\u00a0мы\u00a0предложим оптимальный формат сайта с\u00a0аргументацией каждого решения. Ответим в\u00a0течение 1\u00a0рабочего дня.")}
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
                            {status === "success" ? (
                                <div className="w-full text-center py-10 space-y-4">
                                    <div className="w-12 h-12 bg-[#FD4B32] text-white flex items-center justify-center mx-auto rounded-none no-invert">
                                        <IconSend className="w-5 h-5" stroke={1.2} />
                                    </div>
                                    <h3 className="no-invert font-headline font-semibold text-white text-base leading-[0.9]">
                                        {formatTypography("Заявка отправлена")}
                                    </h3>
                                    <p className="no-invert font-sans font-medium text-white/60 text-sm">
                                        {formatTypography("Мы свяжемся с вами в ближайшее время.")}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="w-full space-y-8">
                                    <div className="space-y-1.5">
                                        <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">Ваше имя</label>
                                        <input
                                            type="text" required disabled={status === "loading"}
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 rounded-none placeholder-white/20 disabled:opacity-50"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">Контакты (Телефон)</label>
                                        <PhoneInput
                                            value={formData.contact} onChange={(val) => setFormData({ ...formData, contact: val })}
                                            theme="dark" required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">Где с вами связаться?</label>
                                        <div className="flex flex-wrap gap-2 w-fit">
                                            {["WhatsApp", "Telegram", "Звонок"].map((method) => {
                                                const isActive = formData.contactMethod === method;
                                                return (
                                                    <button
                                                        key={method} type="button" disabled={status === "loading"}
                                                        onClick={() => setFormData({ ...formData, contactMethod: method })}
                                                        className={`no-invert py-1.5 px-3 text-center font-sans text-[10px] uppercase tracking-wider font-bold transition-colors duration-200 border cursor-pointer rounded-none disabled:opacity-50 ${isActive ? "bg-white text-black border-white" : "bg-transparent text-white/50 border-white/20 hover:bg-white/5"}`}
                                                    >
                                                        {formatTypography(method)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="no-invert font-sans text-xs font-extrabold text-white/50 uppercase tracking-widest block">О вашем проекте</label>
                                        <textarea
                                            rows={3} disabled={status === "loading"}
                                            value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 resize-none rounded-none placeholder-white/20 disabled:opacity-50"
                                            placeholder="Расскажите о задачах и целях проекта..."
                                        />
                                    </div>

                                    <PrivacyConsentCheckbox checked={formData.privacyConsent} onCheckedChange={(checked) => setFormData({ ...formData, privacyConsent: checked })} disabled={status === "loading"} variant="dark" />

                                    {status === "error" && <p className="text-red-500 font-sans text-xs font-semibold">Произошла ошибка при отправке.</p>}

                                    <Button01 type="submit" disabled={status === "loading"} text={status === "loading" ? "Отправка..." : "Отправить заявку"} variant="dark" className="w-full justify-between cursor-pointer" />
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Логотип / Копирайт под формой */}
                    <div className="col-span-12 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="font-sans text-xs text-white/40 no-invert">© {new Date().getFullYear()} ThePeak. Все права защищены.</p>
                        <Link href="/privacy" className="font-sans text-xs text-white/40 hover:text-[#FD4B32] transition-colors duration-200 underline underline-offset-4 decoration-white/20 hover:decoration-[#FD4B32] no-invert">Политика конфиденциальности</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
