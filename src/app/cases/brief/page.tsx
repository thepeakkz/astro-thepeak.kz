"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Link2,
  Calendar,
  Layers,
  FileImage,
  FolderOpen
} from "lucide-react";

export default function CaseBriefPage() {
  // Tabs / Steps for multi-step form
  const [activeTab, setActiveTab] = useState<"card" | "details" | "metrics_blocks" | "files">("card");

  // Form State - Card details
  const [cardName, setCardName] = useState("");
  const [cardType, setCardType] = useState("");
  const [cardText, setCardText] = useState("");
  const [cardSize, setCardSize] = useState<"small" | "middle" | "large">("small");
  const [services, setServices] = useState<string[]>([]);
  const [industry, setIndustry] = useState("");
  const [newServiceTag, setNewServiceTag] = useState("");

  // Form State - Case Page details
  const [pageTitle, setPageTitle] = useState("");
  const [pageYear, setPageYear] = useState(new Date().getFullYear().toString());
  const [pageService, setPageService] = useState("");
  const [pageIndustry, setPageIndustry] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [brandbookUrl, setBrandbookUrl] = useState("");
  const [showreelUrl, setShowreelUrl] = useState("");

  // Form State - Metrics
  const [metrics, setMetrics] = useState<Array<{ value: string; label: string }>>([
    { value: "", label: "" }
  ]);

  // Form State - Content Blocks
  const [contentBlocks, setContentBlocks] = useState<Array<{ chapter: string; text: string; items: string[] }>>([
    { chapter: "01 / Задача", text: "", items: [] },
    { chapter: "02 / Работа", text: "", items: [] },
    { chapter: "03 / Результат", text: "", items: [] }
  ]);

  // Files State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPosterFile, setCoverPosterFile] = useState<File | null>(null);
  const [mockupFiles, setMockupFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Submission / Loading / Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<React.ReactNode>("");

  // Pre-defined tag suggestions
  const presetServices = [
    "Лендинг",
    "Многостраничный сайт",
    "Интернет магазин",
    "SEO",
    "Брендинг",
    "Логотип",
    "SMM",
    "Таргет",
    "Контекст",
    "Маркетинг",
    "Продакшн"
  ];

  // Auto-sync page details from card details to speed up editing
  useEffect(() => {
    if (cardName) {
      if (!pageTitle) setPageTitle(cardName);
      if (!pageIndustry) setPageIndustry(industry);
      if (!pageService) setPageService(services.join(", "));
    }
  }, [cardName, services, industry, pageTitle, pageIndustry, pageService]);

  // Sync services array to cardType string (comma-separated list)
  useEffect(() => {
    if (services.length > 0) {
      setCardType(services.map(s => s.toLowerCase()).join(", "));
    }
  }, [services]);

  // Handle Metrics adjustments
  const addMetric = () => setMetrics([...metrics, { value: "", label: "" }]);
  const removeMetric = (index: number) => setMetrics(metrics.filter((_, i) => i !== index));
  const updateMetric = (index: number, field: "value" | "label", val: string) => {
    const updated = [...metrics];
    updated[index][field] = val;
    setMetrics(updated);
  };

  // Handle Content Blocks adjustments
  const addContentBlock = () => {
    const nextIndex = contentBlocks.length + 1;
    setContentBlocks([
      ...contentBlocks,
      { chapter: `${String(nextIndex).padStart(2, "0")} / Раздел`, text: "", items: [] }
    ]);
  };
  const removeContentBlock = (index: number) => setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  const updateBlockField = (index: number, field: "chapter" | "text", val: string) => {
    const updated = [...contentBlocks];
    updated[index][field] = val;
    setContentBlocks(updated);
  };
  const addBlockBullet = (blockIndex: number) => {
    const updated = [...contentBlocks];
    updated[blockIndex].items.push("");
    setContentBlocks(updated);
  };
  const removeBlockBullet = (blockIndex: number, bulletIndex: number) => {
    const updated = [...contentBlocks];
    updated[blockIndex].items = updated[blockIndex].items.filter((_, i) => i !== bulletIndex);
    setContentBlocks(updated);
  };
  const updateBlockBullet = (blockIndex: number, bulletIndex: number, val: string) => {
    const updated = [...contentBlocks];
    updated[blockIndex].items[bulletIndex] = val;
    setContentBlocks(updated);
  };

  // Transliteration helper for slug preview
  const transliterate = (text: string): string => {
    const ru: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
      'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'ZH',
      'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
      'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'TS',
      'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SCH', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU',
      'Я': 'YA'
    };
    return text.split('').map(char => ru[char] !== undefined ? ru[char] : char).join('');
  };

  const getSlugPreview = () => {
    return transliterate(cardName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleAddServiceTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newServiceTag.trim()) {
      e.preventDefault();
      if (!services.includes(newServiceTag.trim())) {
        setServices([...services, newServiceTag.trim()]);
      }
      setNewServiceTag("");
    }
  };

  const togglePresetService = (tag: string) => {
    if (services.includes(tag)) {
      setServices(services.filter(s => s !== tag));
    } else {
      setServices([...services, tag]);
    }
  };

  const removeServiceTag = (tag: string) => {
    setServices(services.filter(s => s !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const missing: { label: string; stepId: "card" | "details" | "files" }[] = [];
    if (!cardName.trim()) missing.push({ label: "Название карточки / Бренда", stepId: "card" });
    if (!industry.trim()) missing.push({ label: "Индустрия / Отрасль", stepId: "card" });
    if (services.length === 0) missing.push({ label: "Услуги / Направления", stepId: "card" });
    if (!cardText.trim()) missing.push({ label: "Краткое описание на карточке", stepId: "card" });
    
    if (!pageTitle.trim()) missing.push({ label: "Заголовок на странице кейса", stepId: "details" });
    if (!pageYear.trim()) missing.push({ label: "Год реализации", stepId: "details" });
    if (!pageService.trim()) missing.push({ label: "Основная услуга для шапки", stepId: "details" });
    if (!pageIndustry.trim()) missing.push({ label: "Отрасль проекта для шапки", stepId: "details" });
    if (!heroDesc.trim()) missing.push({ label: "Описание на первом экране кейса", stepId: "details" });
    
    if (!coverFile) missing.push({ label: "Обложка карточки", stepId: "files" });

    if (missing.length > 0) {
      setErrorMsg(
        <div className="space-y-2">
          <p className="font-bold text-red-400">Пожалуйста, заполните следующие обязательные поля:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            {missing.map((item, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => setActiveTab(item.stepId)}
                  className="underline text-red-200 hover:text-white cursor-pointer transition-colors text-left"
                >
                  {item.label} (перейти к разделу)
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
      setActiveTab(missing[0].stepId);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", cardName);
      data.append("cardType", cardType);
      data.append("cardText", cardText);
      data.append("cardSize", cardSize);
      data.append("industry", industry);
      data.append("services", JSON.stringify(services));

      data.append("title", pageTitle);
      data.append("year", pageYear);
      data.append("service", pageService);
      data.append("pageIndustry", pageIndustry);
      data.append("heroDesc", heroDesc);
      data.append("instaUrl", instaUrl);
      data.append("brandbookUrl", brandbookUrl);
      data.append("showreelUrl", showreelUrl);

      const activeMetrics = metrics.filter(m => m.value.trim() && m.label.trim());
      data.append("metrics", JSON.stringify(activeMetrics));

      const activeBlocks = contentBlocks.filter(b => b.chapter.trim() && b.text.trim());
      data.append("contentBlocks", JSON.stringify(activeBlocks));

      data.append("coverFile", coverFile!);
      if (coverPosterFile) {
        data.append("coverPosterFile", coverPosterFile);
      }

      mockupFiles.forEach(file => {
        data.append("mockupFiles", file);
      });

      galleryFiles.forEach(file => {
        data.append("galleryFiles", file);
      });

      const response = await fetch("/api/brief", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Произошла неизвестная ошибка при сохранении.");
      } else {
        setSuccessSlug(result.slug);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Сбой отправки данных на сервер.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: "card", label: "Карточка каталога", desc: "Анонс и плитка", icon: Layers },
    { id: "details", label: "Описание страницы", desc: "Hero-блок и мета", icon: Sparkles },
    { id: "metrics_blocks", label: "Метрики и Разделы", desc: "Контентное описание", icon: Calendar },
    { id: "files", label: "Медиафайлы", desc: "Загрузка фото и видео", icon: FileImage },
  ] as const;

  return (
    <div className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] min-h-screen bg-[#060606] text-white relative flex flex-col selection:bg-[#FD4B32]/30 selection:text-white">
      <Navigation />

      <div className="flex-1 w-full px-[var(--page-margin)] pt-20 md:pt-24 pb-24">
        {/* Navigation & Header */}
        <div className="flex items-center justify-end mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest">Локальный редактор</span>
          </div>
        </div>

        {successSlug ? (
          <div className="max-w-xl mx-auto bg-white/[0.01] border border-white/10 p-8 md:p-12 text-center rounded-none relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FD4B32] to-amber-500" />
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 stroke-[1.2]" />
            </div>
            <h2 className="font-sans text-2xl md:text-3xl font-semibold mb-4">
              Кейс сохранен!
            </h2>
            <p className="font-sans text-white/55 text-sm md:text-base max-w-md mx-auto mb-8">
              Все материалы записаны локально в структуру проекта и отправлены на Cloudinary. Изменения применятся мгновенно.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/cases/${successSlug}`}
                className="no-invert font-sans font-bold text-xs uppercase tracking-widest text-[#060606] bg-white px-8 py-4 hover:bg-[#FD4B32] hover:text-white transition-all duration-300"
              >
                Открыть страницу кейса
              </Link>
              <button
                onClick={() => {
                  setSuccessSlug(null);
                  setCardName("");
                  setCardType("");
                  setCardText("");
                  setPageTitle("");
                  setHeroDesc("");
                  setCoverFile(null);
                  setCoverPosterFile(null);
                  setMockupFiles([]);
                  setGalleryFiles([]);
                }}
                className="no-invert font-sans font-bold text-xs uppercase tracking-widest text-white border border-white/20 px-8 py-4 hover:bg-white/5 transition-all duration-300"
              >
                Создать новый
              </button>
            </div>
          </div>
        ) : (
          /* GLOBAL 2-COLUMN COMPOSITION */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* SIDEBAR NAVIGATION (1 col) */}
            <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white/[0.02] border border-white/10 p-5 rounded-none space-y-4">
                <div className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-[#FD4B32]">
                  Шаги заполнения
                </div>
                <div className="space-y-1">
                  {steps.map((step) => {
                    const StepIcon = step.icon;
                    const isActive = activeTab === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveTab(step.id)}
                        className={`w-full flex items-center gap-3.5 p-3.5 rounded-none text-left transition-all duration-300 border-l-2 ${
                          isActive
                            ? "bg-white/[0.04] border-[#FD4B32] text-white"
                            : "bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/[0.01]"
                        }`}
                      >
                        <StepIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#FD4B32]" : "text-white/30"}`} />
                        <div>
                          <p className="font-sans font-bold text-xs uppercase tracking-wider">{step.label}</p>
                          <p className="font-sans text-[10px] text-white/35 mt-0.5">{step.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions and summary info */}
              <div className="bg-white/[0.01] border border-white/5 p-5 text-xs text-white/40 font-sans space-y-2">
                <p className="font-bold uppercase tracking-wider text-white/50 mb-1">💡 Подсказка</p>
                <p>Все медиафайлы сохранятся локально в <code className="text-[#FD4B32]">public/cases/[slug]</code> и будут параллельно загружены в ваше облако Cloudinary.</p>
              </div>
            </div>

            {/* MAIN FORM CONTAINER (3 cols) */}
            <div className="lg:col-span-3 bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-none relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form header showing active step info */}
                <div className="pb-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="font-sans font-extrabold text-sm uppercase tracking-wider text-white">
                    {steps.find(s => s.id === activeTab)?.label}
                  </h2>
                  <span className="font-sans text-[10px] text-white/30 uppercase tracking-widest">
                    Шаг {steps.findIndex(s => s.id === activeTab) + 1} из 4
                  </span>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 rounded-none font-sans text-sm text-red-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* TAB 1: CARD */}
                {activeTab === "card" && (
                  <div className="space-y-6">
                    {/* Row 1: Name & Industry */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                      <div className="sm:col-span-7">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Название карточки / Бренда *
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCardName(val);
                            if (!pageTitle || pageTitle === cardName) {
                              setPageTitle(val);
                            }
                          }}
                          placeholder="Например: Lukoil Lubricants"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Индустрия / Отрасль *
                        </label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => {
                            const val = e.target.value;
                            setIndustry(val);
                            if (!pageIndustry || pageIndustry === industry) {
                              setPageIndustry(val);
                            }
                          }}
                          placeholder="Производство"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Row 2: Tag Selector & Grid Size Segmented Control */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                      <div className="sm:col-span-7 space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-1 font-sans font-medium">
                          Размер карточки в сетке (Grid Size) *
                        </label>
                        
                        {/* Custom visual segmented control */}
                        <div className="grid grid-cols-3 gap-2">
                          {(["small", "middle", "large"] as const).map((sz) => {
                            const isSel = cardSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setCardSize(sz)}
                                className={`flex flex-col items-center justify-center p-3 border transition-all duration-300 ${
                                  isSel
                                    ? "bg-white text-[#060606] border-white"
                                    : "bg-white/[0.02] text-white/50 border-white/10 hover:border-white/20"
                                }`}
                              >
                                {/* Grid visual layout representation */}
                                <div className="flex gap-0.5 h-3.5 w-10 mb-1.5 pointer-events-none items-center justify-center">
                                  {sz === "small" && (
                                    <>
                                      <div className="h-full w-2.5 bg-current opacity-100" />
                                      <div className="h-full w-2.5 border border-current opacity-20" />
                                      <div className="h-full w-2.5 border border-current opacity-20" />
                                    </>
                                  )}
                                  {sz === "middle" && (
                                    <>
                                      <div className="h-full w-5 bg-current opacity-100" />
                                      <div className="h-full w-2.5 border border-current opacity-20" />
                                    </>
                                  )}
                                  {sz === "large" && (
                                    <div className="h-full w-full bg-current opacity-100" />
                                  )}
                                </div>
                                <span className="font-sans text-[9px] font-bold uppercase tracking-wider">
                                  {sz === "small" ? "Узкая" : sz === "middle" ? "Средняя" : "Большая"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Слаг страницы (URL)
                        </label>
                        <div className="w-full bg-white/[0.01] border border-white/5 px-4 py-3.5 text-xs font-sans text-white/40 select-all truncate">
                          {cardName ? getSlugPreview() : "[автогенерация]"}
                        </div>
                      </div>
                    </div>

                    {/* Interactive tags with presets */}
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-wider text-white/45 font-sans font-medium">
                        Услуги / Направления (выберите из списка или введите свои) *
                      </label>
                      
                      {/* Presets clicking */}
                      <div className="flex flex-wrap gap-1.5">
                        {presetServices.map((tag) => {
                          const hasTag = services.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => togglePresetService(tag)}
                              className={`text-[10px] font-sans px-2.5 py-1 transition-all duration-200 border ${
                                hasTag
                                  ? "bg-[#FD4B32] text-white border-[#FD4B32]"
                                  : "bg-white/[0.03] text-white/50 border-white/5 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {/* Manual adding input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={newServiceTag}
                          onChange={(e) => setNewServiceTag(e.target.value)}
                          onKeyDown={handleAddServiceTag}
                          placeholder="Свой тег... (нажмите Enter для ввода)"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-xs font-sans transition-colors duration-200"
                        />
                        {newServiceTag.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!services.includes(newServiceTag.trim())) {
                                setServices([...services, newServiceTag.trim()]);
                              }
                              setNewServiceTag("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-[#FD4B32] p-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Display added manual tags */}
                      {services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {services.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/10 text-white font-sans text-xs px-2.5 py-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeServiceTag(tag)}
                                className="text-white/40 hover:text-red-500 transition-colors p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Row 3: Card Description Text */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                        Краткое описание на карточке (в каталоге) *
                      </label>
                      <textarea
                        rows={4}
                        value={cardText}
                        onChange={(e) => setCardText(e.target.value)}
                        placeholder="Краткое описание проекта для плитки..."
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans resize-none transition-colors duration-200"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-[#060606] bg-white px-7 py-3.5 hover:bg-[#FD4B32] hover:text-white transition-all duration-300"
                      >
                        Далее: Описание
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: DETAILS */}
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                      <div className="sm:col-span-8">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Заголовок на странице кейса *
                        </label>
                        <input
                          type="text"
                          value={pageTitle}
                          onChange={(e) => setPageTitle(e.target.value)}
                          placeholder="Название кейса на странице"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Год реализации *
                        </label>
                        <input
                          type="text"
                          value={pageYear}
                          onChange={(e) => setPageYear(e.target.value)}
                          placeholder="2026"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                      <div className="sm:col-span-7">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Основная услуга (для шапки страницы) *
                        </label>
                        <input
                          type="text"
                          value={pageService}
                          onChange={(e) => setPageService(e.target.value)}
                          placeholder="Например: Таргетированная реклама"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                          Отрасль проекта (для шапки) *
                        </label>
                        <input
                          type="text"
                          value={pageIndustry}
                          onChange={(e) => setPageIndustry(e.target.value)}
                          placeholder="Строительство"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/45 mb-2 font-sans font-medium">
                        Описание на первом экране кейса (Hero Description) *
                      </label>
                      <textarea
                        rows={3}
                        value={heroDesc}
                        onChange={(e) => setHeroDesc(e.target.value)}
                        placeholder="Короткое описание на первом экране кейса..."
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-3 text-sm font-sans resize-none transition-colors duration-200"
                      />
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    <div className="font-sans font-bold text-xs uppercase tracking-wider text-[#FD4B32]">
                      Ссылки и доп. материалы
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-white/30 shrink-0" />
                        <input
                          type="url"
                          value={instaUrl}
                          onChange={(e) => setInstaUrl(e.target.value)}
                          placeholder="Ссылка на Instagram проекта (или сайт)"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-2.5 text-xs font-sans transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-white/30 shrink-0" />
                        <input
                          type="url"
                          value={brandbookUrl}
                          onChange={(e) => setBrandbookUrl(e.target.value)}
                          placeholder="Ссылка на брендбук / презентацию (PDF)"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-2.5 text-xs font-sans transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <FileImage className="w-4 h-4 text-white/30 shrink-0" />
                        <input
                          type="url"
                          value={showreelUrl}
                          onChange={(e) => setShowreelUrl(e.target.value)}
                          placeholder="Ссылка на видео-шоурил (Cloudinary / Direct MP4)"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-4 py-2.5 text-xs font-sans transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("card")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-white/50 border border-white/10 px-6 py-3 hover:border-white/35 transition-all duration-300"
                      >
                        Назад
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("metrics_blocks")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-[#060606] bg-white px-7 py-3.5 hover:bg-[#FD4B32] hover:text-white transition-all duration-300"
                      >
                        Далее: Метрики
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: METRICS & BLOCKS */}
                {activeTab === "metrics_blocks" && (
                  <div className="space-y-6">
                    {/* METRICS */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-[#FD4B32]">
                          Метрики результатов
                        </h3>
                        <button
                          type="button"
                          onClick={addMetric}
                          className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-wider px-3 py-1.5 flex items-center gap-1 font-sans transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Добавить
                        </button>
                      </div>
                      <div className="space-y-3">
                        {metrics.map((metric, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="grid grid-cols-12 gap-3 flex-1">
                              <input
                                type="text"
                                value={metric.value}
                                onChange={(e) => updateMetric(idx, "value", e.target.value)}
                                placeholder="Значение (напр. 250+)"
                                className="col-span-5 bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-3.5 py-2.5 text-xs font-sans transition-colors"
                              />
                              <input
                                type="text"
                                value={metric.label}
                                onChange={(e) => updateMetric(idx, "label", e.target.value)}
                                placeholder="Описание (напр. заявок в месяц)"
                                className="col-span-7 bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-3.5 py-2.5 text-xs font-sans transition-colors"
                              />
                            </div>
                            {metrics.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMetric(idx)}
                                className="text-white/30 hover:text-red-500 p-2 border border-white/5 hover:border-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* CONTENT BLOCKS */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-[#FD4B32]">
                          Разделы описания кейса
                        </h3>
                        <button
                          type="button"
                          onClick={addContentBlock}
                          className="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-wider px-3 py-1.5 flex items-center gap-1 font-sans transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Добавить раздел
                        </button>
                      </div>
                      
                      <div className="space-y-5">
                        {contentBlocks.map((block, bIdx) => (
                          <div key={bIdx} className="bg-white/[0.01] border border-white/5 p-4 space-y-3.5">
                            <div className="flex gap-3 items-center">
                              <input
                                type="text"
                                value={block.chapter}
                                onChange={(e) => updateBlockField(bIdx, "chapter", e.target.value)}
                                placeholder="Название раздела (напр. 01 / Задача)"
                                className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-3 py-2 text-xs font-sans font-semibold transition-colors"
                              />
                              {contentBlocks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeContentBlock(bIdx)}
                                  className="text-white/30 hover:text-red-500 p-2 border border-white/5 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <textarea
                              rows={3}
                              value={block.text}
                              onChange={(e) => updateBlockField(bIdx, "text", e.target.value)}
                              placeholder="Напишите текст для этого раздела..."
                              className="w-full bg-white/[0.04] border border-white/10 focus:border-[#FD4B32] outline-none px-3 py-2 text-xs font-sans resize-none transition-colors"
                            />

                            {/* Bullets */}
                            <div className="pl-4 border-l border-white/10 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] uppercase tracking-wider text-white/30 font-sans">Списки результатов</span>
                                <button
                                  type="button"
                                  onClick={() => addBlockBullet(bIdx)}
                                  className="text-white/40 hover:text-white text-[9px] uppercase tracking-wide flex items-center gap-1 font-sans transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" /> Добавить пункт
                                </button>
                              </div>
                              
                              {block.items.map((bullet, bulletIdx) => (
                                <div key={bulletIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => updateBlockBullet(bIdx, bulletIdx, e.target.value)}
                                    placeholder="Пункт списка..."
                                    className="bg-white/[0.02] border border-white/10 focus:border-[#FD4B32] outline-none px-3 py-1.5 text-[11px] font-sans transition-colors flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeBlockBullet(bIdx, bulletIdx)}
                                    className="text-white/30 hover:text-red-500 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-white/50 border border-white/10 px-6 py-3 hover:border-white/35 transition-all duration-300"
                      >
                        Назад
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("files")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-[#060606] bg-white px-7 py-3.5 hover:bg-[#FD4B32] hover:text-white transition-all duration-300"
                      >
                        Далее: Медиа
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: FILES */}
                {activeTab === "files" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cover Media */}
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 font-sans font-medium">
                          Обложка карточки *
                        </label>
                        <div className="relative group border border-dashed border-white/10 hover:border-[#FD4B32]/30 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-5 text-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {coverFile ? (
                            <div className="font-sans text-[11px] text-white/80 truncate">
                              <span className="text-[#FD4B32] font-semibold">{coverFile.name}</span>
                              <p className="text-white/30 text-[9px] mt-0.5">({(coverFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                            </div>
                          ) : (
                            <div className="font-sans py-2 text-white/40">
                              <p className="text-xs">Выбрать фото/видео</p>
                              <p className="text-[9px] text-white/20 mt-1">WebP, MP4, WebM</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Poster */}
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-wider text-white/45 font-sans font-medium">
                          Заглушка обложки (Постер)
                        </label>
                        <div className="relative group border border-dashed border-white/10 hover:border-[#FD4B32]/30 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-5 text-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverPosterFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {coverPosterFile ? (
                            <div className="font-sans text-[11px] text-white/80 truncate">
                              <span className="text-[#FD4B32] font-semibold">{coverPosterFile.name}</span>
                              <p className="text-white/30 text-[9px] mt-0.5">({(coverPosterFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                            </div>
                          ) : (
                            <div className="font-sans py-2 text-white/40">
                              <p className="text-xs">Загрузить JPG/WEBP</p>
                              <p className="text-[9px] text-white/20 mt-1">Обязательно для видео</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mockups */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-wider text-white/45 font-sans font-medium">
                        Мокапы на странице кейса (слайдер внизу)
                      </label>
                      <div className="relative group border border-dashed border-white/10 hover:border-[#FD4B32]/30 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-5 text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setMockupFiles([...mockupFiles, ...files]);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="font-sans py-1 text-white/40">
                          <p className="text-xs">Выбрать изображения мокапов</p>
                          <p className="text-[9px] text-white/20 mt-1">Загрузите несколько файлов</p>
                        </div>
                      </div>
                      {mockupFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {mockupFiles.map((file, idx) => (
                            <div key={idx} className="bg-white/[0.03] border border-white/5 p-2 flex items-center justify-between text-[11px] font-sans">
                              <span className="truncate max-w-[120px] text-white/60">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setMockupFiles(mockupFiles.filter((_, i) => i !== idx))}
                                className="text-white/30 hover:text-red-500 ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Case Gallery Media */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-wider text-white/45 font-sans font-medium">
                        Видеогалерея / Колонки медиа кейса
                      </label>
                      <div className="relative group border border-dashed border-white/10 hover:border-[#FD4B32]/30 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-5 text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setGalleryFiles([...galleryFiles, ...files]);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="font-sans py-1 text-white/40">
                          <p className="text-xs">Выбрать контентные медиа (фото/видео)</p>
                          <p className="text-[9px] text-white/20 mt-1">Автоматически выстроятся в колонки на странице</p>
                        </div>
                      </div>
                      {galleryFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {galleryFiles.map((file, idx) => (
                            <div key={idx} className="bg-white/[0.03] border border-white/5 p-2 flex items-center justify-between text-[11px] font-sans">
                              <span className="truncate max-w-[120px] text-white/60">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => setGalleryFiles(galleryFiles.filter((_, i) => i !== idx))}
                                className="text-white/30 hover:text-red-500 ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-6 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setActiveTab("metrics_blocks")}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-white/50 border border-white/10 px-6 py-3 hover:border-white/35 transition-all duration-300"
                      >
                        Назад
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="no-invert font-sans font-bold text-[10px] uppercase tracking-widest text-white bg-[#FD4B32] px-8 py-3.5 hover:bg-white hover:text-[#060606] transition-all duration-300 disabled:bg-white/10 disabled:text-white/20 flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          "Создать кейс"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>



          </div>
        )}
      </div>
    </div>
  );
}
