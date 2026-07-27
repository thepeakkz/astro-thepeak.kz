"use client";

import React, { useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import CaseVideoGallery from "@/components/CaseVideoGallery";
import { formatTypography } from "@/utils/typography";
import { Volume2, VolumeX } from "lucide-react";
import LazyPdfReader from "@/components/LazyPdfReader";
import { cn } from "@/lib/utils";
import { optimizeCloudinaryVideoUrl } from "@/utils/media";
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
import HeroWave from "@/components/ui/dynamic-wave-canvas-background";
import CaseDescriptionColumns from "@/components/CaseDescriptionColumns";

const GRAIN_STYLE: React.CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "180px 180px",
};

const CASE_HERO_MEDIA: Record<string, { src: string; type: "image" | "video" }> = {
    ark: { src: "/cases/ark.mp4", type: "video" },
    avtopilot: { src: "/cases/avtopilot.mp4", type: "video" },
    bazisa: { src: "/cases/bazis a.mp4", type: "video" },
    blink: { src: "/cases/blink.webp", type: "image" },
    bossxo: { src: "/cases/bossxo.webp", type: "image" },
    cadillac: { src: "/cases/cadillac.webp", type: "image" },
    diskokras: { src: "/cases/diskokras/DNQp7cUI2Fs.mp4", type: "video" },
    "double-coffee": { src: "/cases/bossxo.webp", type: "image" },
    gippo: { src: "/cases/gippo.webp", type: "image" },
    // Invictus hero placeholder: set src when the final cover image is ready.
    // "invictus-academy": { src: "/cases/invictus-academy/hero.webp", type: "image" },
    lukoil: { src: "/cases/lukoil.mp4", type: "video" },
    mindofbody: { src: "/cases/mob.webp", type: "image" },
    onmacabim: { src: "/cases/onmacabim.webp", type: "image" },
    puma: { src: "/cases/puma.webp", type: "image" },
    qazsip: { src: "/cases/qazsip.webp", type: "image" },
    racoon: { src: "/cases/raccoon.mp4", type: "video" },
    ris: { src: "/cases/ris.mp4", type: "video" },
    sensata: { src: "/cases/sensata.webp", type: "image" },
    uaz: { src: "/cases/uaz.webp", type: "image" },
    kenfsad: { src: "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641222/kf1_h9sr9l.mp4", type: "video" },
    mg: { src: "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641221/mg2_ttzsip.mp4", type: "video" },
    "mg-kazakhstan": { src: "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641221/mg2_ttzsip.mp4", type: "video" },
    omo: { src: "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782641223/OMO_%D1%85_Almaty_marathon_1_oqdkmb.mp4", type: "video" },
    velmar: { src: "/cases/Velmar.webp", type: "image" },
    compass: { src: "/cases/compass/cover.webp", type: "image" },
    "shanding-logistics": { src: "https://res.cloudinary.com/dxvynbrut/image/upload/v1783590405/cases/shanding-logistics/cover.webp", type: "image" },
    bebble: { src: "https://res.cloudinary.com/f75p1yiv/image/upload/v1782998842/yapil/case/bebble.webp", type: "image" },
    boya: { src: "https://res.cloudinary.com/f75p1yiv/image/upload/v1782998699/yapil/case/Boya.webp", type: "image" },
    rv: { src: "https://res.cloudinary.com/f75p1yiv/image/upload/v1782998834/yapil/case/RV/1.webp", type: "image" },
    igorkochergin: { src: "https://res.cloudinary.com/f75p1yiv/image/upload/v1782998845/yapil/case/%D0%98%D0%B3%D0%BE%D1%80%D1%8C%20%D0%9A%D0%BE%D1%87%D0%B5%D1%80%D0%B3%D0%B8%D0%BD.webp", type: "image" },
    "faw-kazakhstan": { src: "/cases/faw-kazakhstan/cover.webp", type: "image" },
    "uniflex-fitness": { src: "/cases/uniflex-fitness/cover.webp", type: "image" },
};

interface ContactInfoDarkProps {
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    className?: string;
}

interface CaseContentBlock {
    chapter?: string;
    items?: readonly string[];
    text: string;
}

interface CaseMetric {
    label: string;
    value: string;
}

interface CaseData {
    title?: string;
    name?: string;
    year?: string;
    service?: string;
    industry?: string;
    hero_desc?: string;
    insta_url?: string;
    contentBlocks?: readonly CaseContentBlock[];
    metrics?: readonly CaseMetric[];
    brandbookUrl?: string;
    showreelUrl?: string;
    mockupImages?: readonly string[];
    heroMedia?: { src: string; type: "image" | "video" };
}

function CaseMetricsSection({ metrics }: { metrics: readonly CaseMetric[] }) {
    return (
        <section className="relative border-b border-white/10 px-[var(--page-margin)] py-12 md:py-16">
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{ ...GRAIN_STYLE, opacity: 0.06 }}
            />
            <div className="relative z-10 grid grid-cols-1 gap-px overflow-hidden border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                    <div
                        key={`${metric.value}-${metric.label}`}
                        className="min-h-36 bg-white/[0.03] p-5 md:p-6"
                    >
                        <div className="no-invert font-sans text-[clamp(2rem,4vw,4.6rem)] font-semibold leading-none text-white">
                            {formatTypography(metric.value)}
                        </div>
                        <p className="no-invert mt-4 max-w-xs font-sans text-sm font-medium leading-snug text-white/55">
                            {formatTypography(metric.label)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
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

export default function CaseClient({ data, slug }: { data: CaseData; slug: string }) {
    const caseTitle = data.title || data.name || slug;
    const isWebsiteCase = data.service?.toLowerCase().includes("сайт") || data.service?.toLowerCase().includes("лендинг");
    const showMetrics = data.metrics && data.metrics.length > 0 && !isWebsiteCase;
    const rawHeroMedia = CASE_HERO_MEDIA[slug] || data.heroMedia;
    const heroMedia = rawHeroMedia
        ? { ...rawHeroMedia, src: optimizeCloudinaryVideoUrl(rawHeroMedia.src) }
        : null;
    const showreelVideoRef = useRef<HTMLVideoElement | null>(null);
    const [isShowreelMuted, setIsShowreelMuted] = useState(true);
    const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

    const [showreelVisible, setShowreelVisible] = useState(false);
    const showreelContainerRef = useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const node = showreelContainerRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowreelVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [data.showreelUrl]);

    const toggleShowreelSound = (e: React.MouseEvent) => {
        e.preventDefault();
        if (showreelVideoRef.current) {
            const nextMuted = !showreelVideoRef.current.muted;
            showreelVideoRef.current.muted = nextMuted;
            setIsShowreelMuted(nextMuted);
        }
    };

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
                    source: `Страница кейса: ${caseTitle}`,
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

                    {heroMedia?.type === "video" ? (
                        <video
                            src={heroMedia.src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
                        />
                    ) : (
                        <div
                            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-35"
                            style={{ backgroundImage: heroMedia ? `url('${heroMedia.src}')` : undefined }}
                        />
                    )}

                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#060606] via-[#060606]/40 to-[#060606]/85" />

                    <div
                        className="pointer-events-none absolute inset-0 z-0"
                        style={{ ...GRAIN_STYLE, opacity: 0.13 }}
                    />

                    <div className="relative z-10 px-[var(--page-margin)] pt-40 pb-20 md:pb-28">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 items-end">
                            <div className="lg:col-span-8 space-y-6">
                                <h1
                                    className="no-invert font-sans font-semibold text-white leading-[0.9] tracking-tight"
                                    style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
                                >
                                    {caseTitle}
                                </h1>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                {data.hero_desc && (
                                    <p
                                        className="no-invert font-sans text-white/60 leading-relaxed"
                                        style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)" }}
                                    >
                                        {formatTypography(data.hero_desc)}
                                    </p>
                                )}

                                <div className="grid grid-cols-3 gap-px border border-white/10">
                                    <div className="p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <p className="no-invert case-meta-label font-sans text-white/30 uppercase mb-1">Старт</p>
                                        <p className="no-invert font-sans text-white text-sm font-semibold">{data.year}</p>
                                    </div>
                                    <div className="p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <p className="no-invert case-meta-label font-sans text-white/30 uppercase mb-1">Услуга</p>
                                        <p className="no-invert font-sans text-white text-sm font-semibold">{data.service}</p>
                                    </div>
                                    <div className="p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                                        <p className="no-invert case-meta-label font-sans text-white/30 uppercase mb-1">Направление</p>
                                        <p className="no-invert font-sans text-white text-sm font-semibold">{data.industry}</p>
                                    </div>
                                </div>

                                {data.insta_url && (
                                    <Button01
                                          href={data.insta_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          text={data.insta_url.includes("instagram.com") ? "Смотреть профиль" : "Смотреть сайт"}
                                          variant="dark"
                                          className="w-full cursor-pointer"
                                      />
                                )}
                            </div>
                        </div>

                        <div className="mt-16 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="no-invert text-[10px] font-sans text-white/20 uppercase tracking-[0.3em]">
                                {formatTypography(data.year || "")}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ── MAIN CONTENT Blocks ───────────────────────────── */}
                {showMetrics && data.metrics && <CaseMetricsSection metrics={data.metrics} />}

                {data.contentBlocks && data.contentBlocks.length > 0 && (
                    <CaseDescriptionColumns paragraphs={data.contentBlocks.map(block => block.text)} />
                )}

                {/* ── Showreel Video Section ── */}
                {data.showreelUrl && (
                    <section className="relative border-b border-white/10 px-[var(--page-margin)] py-16 md:py-24">
                        <div
                            className="pointer-events-none absolute inset-0 z-0"
                            style={{ ...GRAIN_STYLE, opacity: 0.05 }}
                        />
                        <div className="relative z-10">
                            
                            <div 
                                ref={showreelContainerRef}
                                onClick={toggleShowreelSound}
                                className="relative w-full aspect-video border border-white/10 overflow-hidden bg-black group/showreel cursor-pointer rounded-[4px] shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                            >
                                <video
                                    ref={showreelVideoRef}
                                    src={showreelVisible ? optimizeCloudinaryVideoUrl(data.showreelUrl) : undefined}
                                    autoPlay
                                    muted={isShowreelMuted}
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div
                                    className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                                >
                                    {isShowreelMuted ? (
                                        <VolumeX size={16} />
                                    ) : (
                                        <Volume2 size={16} className="text-[#4ade80]" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Brandbook PDF Section ── */}
                {data.brandbookUrl && (
                    <section className="relative border-b border-white/10 px-[var(--page-margin)] py-16 md:py-24">
                        <div
                            className="pointer-events-none absolute inset-0 z-0"
                            style={{ ...GRAIN_STYLE, opacity: 0.05 }}
                        />
                        <div className="relative z-10">
                            <LazyPdfReader url={data.brandbookUrl} />
                        </div>
                    </section>
                )}

                {/* ── Mockup Images Gallery Section ── */}
                {data.mockupImages && data.mockupImages.length > 0 && (
                    <section className="relative border-b border-white/10 px-[var(--page-margin)] py-16 md:py-24">
                        <div
                            className="pointer-events-none absolute inset-0 z-0"
                            style={{ ...GRAIN_STYLE, opacity: 0.05 }}
                        />
                        <div className="relative z-10">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.mockupImages.map((src, index) => (
                                    <div 
                                        key={src} 
                                        onClick={() => setActiveLightboxImg(src)}
                                        className="w-full overflow-hidden border border-white/5 rounded-[2px] cursor-zoom-in group/mockup relative"
                                    >
                                        <img
                                            src={src}
                                            alt={`${caseTitle} — макет ${index + 1}`}
                                            className="w-full h-auto block transition-transform duration-700 ease-out group-hover/mockup:scale-[1.01]"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Lightbox Overlay ── */}
                {activeLightboxImg && (
                    <div
                        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 cursor-zoom-out p-4 md:p-8"
                        onClick={() => setActiveLightboxImg(null)}
                    >
                        <img
                            src={activeLightboxImg}
                            alt="Увеличенное изображение"
                            className="max-h-full max-w-full object-contain select-none transition-all duration-300"
                        />
                        <button
                            onClick={() => setActiveLightboxImg(null)}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                            aria-label="Закрыть"
                        >
                            <IconPlus className="w-8 h-8 rotate-45 text-white" />
                        </button>
                    </div>
                )}

                {/* ── REELS GRID GALLERY ────────────────────────────── */}
                {(!data.mockupImages || data.mockupImages.length === 0) && (
                    <CaseVideoGallery slug={slug} />
                )}

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
                                            disabled={isSubmitting}
                                            placeholder="Иван Иванов"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 rounded-none placeholder-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            disabled={isSubmitting}
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
                                                        disabled={isSubmitting}
                                                        onClick={() => setFormData({ ...formData, contactMethod: method })}
                                                        className={`no-invert py-1.5 px-3 text-center font-sans text-[10px] uppercase tracking-wider font-bold transition-colors duration-200 border cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed ${isActive
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
                                            disabled={isSubmitting}
                                            placeholder="Расскажите о задачах и целях проекта..."
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="no-invert w-full font-sans text-sm text-white bg-transparent border-b border-white/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 resize-none rounded-none placeholder-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
