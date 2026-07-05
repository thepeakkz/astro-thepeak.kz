"use client";

import React, { useState } from 'react';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";

const STEPS = [
    {
        id: "format",
        question: "Какой формат сайта решит вашу задачу?",
        multi: false,
        options: ["Лендинг", "Многостраничный сайт", "Интернет-магазин", "Свой вариант"]
    },
    {
        id: "goal",
        question: "Какую основную цель должен решать сайт?",
        multi: false,
        options: [
            "Привлечение клиентов через заявки",
            "Продажа товаров или услуг",
            "Информационная поддержка и контент",
            "Повышение узнаваемости бренда",
            "Монетизация через рекламу или подписки",
            "Свой вариант"
        ]
    },
    {
        id: "design",
        question: "Есть ли у вас требования к дизайну?",
        multi: false,
        options: [
            "Да, нужен уникальный дизайн",
            "Достаточно сделать просто стильно",
            "Можно использовать готовые шаблоны",
            "Еще не решил(а)",
            "Свой вариант"
        ]
    },
    {
        id: "modules",
        question: "Какие модули и функции вам нужны? (можно выбрать несколько)",
        multi: true,
        options: [
            "Форма обратной связи", "Онлайн-чат или консультации", "Каталог товаров или услуг",
            "Личный кабинет пользователя", "Блог или новости", "Система онлайн-оплаты",
            "Отзывы и рейтинги", "Поиск по сайту", "Интеграция с социальными сетями",
            "Календарь или расписание", "Мультиязычность", "Подписка на рассылку",
            "Геолокация или карты", "Встроенные видео", "Свой вариант"
        ]
    },
    {
        id: "deadline",
        question: "В какие сроки нужно запустить проект?",
        multi: false,
        options: [
            "Срочно (1-2 недели)",
            "В течение месяца",
            "2-3 месяца",
            "Пока просто изучаю варианты",
            "Свой вариант"
        ]
    }
];

export function QuizSection() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [formData, setFormData] = useState({ name: "", phone: "", method: "WhatsApp", privacyConsent: true });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleOptionSelect = (option: string) => {
        const step = STEPS[currentStep];
        
        if (step.multi) {
            const currentAnswers = (answers[step.id] as string[]) || [];
            if (currentAnswers.includes(option)) {
                setAnswers({ ...answers, [step.id]: currentAnswers.filter(a => a !== option) });
            } else {
                setAnswers({ ...answers, [step.id]: [...currentAnswers, option] });
            }
        } else {
            setAnswers({ ...answers, [step.id]: option });
            setTimeout(() => {
                if (currentStep < STEPS.length) {
                    setCurrentStep(currentStep + 1);
                }
            }, 300);
        }
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim() || !formData.privacyConsent) {
            setStatus("error");
            return;
        }

        setStatus("loading");

        try {
            const quizDataStr = Object.entries(answers).map(([key, value]) => {
                const step = STEPS.find(s => s.id === key);
                const q = step ? step.question : key;
                const a = Array.isArray(value) ? value.join(", ") : value;
                return `${q}\nОтвет: ${a}`;
            }).join("\n\n");

            const commentText = `Квиз "Рассчитать стоимость":\n\n${quizDataStr}\n\n[Способ связи: ${formData.method}]`;

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    comment: commentText,
                    source: "Квиз (Разработка сайтов)",
                }),
            });

            if (response.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    return (
        <section id="quiz" className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-brand-gray/10 bg-brand-light-gray/20">
            <div className="swiss-grid">
                <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3 bg-white border border-brand-gray/15 p-[clamp(1.5rem,4vw,4rem)] shadow-sm">
                    {status === "success" ? (
                        <div className="text-center py-16">
                            <h2 className="no-invert font-headline font-semibold text-brand-gray text-3xl mb-4">Спасибо за заявку!</h2>
                            <p className="no-invert font-sans text-brand-gray/70 text-lg">Мы свяжемся с вами в ближайшее время с расчетом стоимости.</p>
                            <Button01 
                                onClick={() => {
                                    setCurrentStep(0);
                                    setAnswers({});
                                    setStatus("idle");
                                }} 
                                text="Пройти заново" 
                                variant="dark" 
                                className="mt-8 mx-auto"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-brand-gray/10">
                                <h3 className="no-invert font-sans font-bold text-brand-gray uppercase tracking-wider text-sm">
                                    {currentStep < STEPS.length ? `Шаг ${currentStep + 1} из ${STEPS.length}` : 'Последний шаг: Контакты'}
                                </h3>
                                <div className="flex gap-1">
                                    {Array.from({ length: STEPS.length + 1 }).map((_, idx) => (
                                        <div key={idx} className={`h-1.5 w-6 transition-colors duration-300 ${idx <= currentStep ? 'bg-[#FD4B32]' : 'bg-brand-gray/10'}`} />
                                    ))}
                                </div>
                            </div>

                            {currentStep < STEPS.length ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(1.5rem,2.5vw,2.5rem)] leading-tight mb-8">
                                        {formatTypography(STEPS[currentStep].question)}
                                    </h2>
                                    
                                    <div className="flex flex-col gap-3">
                                        {STEPS[currentStep].options.map((option, idx) => {
                                            const isSelected = STEPS[currentStep].multi 
                                                ? ((answers[STEPS[currentStep].id] as string[]) || []).includes(option)
                                                : answers[STEPS[currentStep].id] === option;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleOptionSelect(option)}
                                                    className={`no-invert text-left p-4 border transition-all duration-200 font-sans text-base cursor-pointer flex items-center gap-4 ${isSelected ? 'border-[#FD4B32] bg-[#FD4B32]/5 text-brand-gray font-bold' : 'border-brand-gray/15 hover:border-brand-gray/40 text-brand-gray/80'}`}
                                                >
                                                    <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-colors ${STEPS[currentStep].multi ? 'rounded-sm' : 'rounded-full'} ${isSelected ? 'border-[#FD4B32] bg-[#FD4B32]' : 'border-brand-gray/30'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    {formatTypography(option)}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex justify-between mt-10 pt-6 border-t border-brand-gray/10">
                                        <button 
                                            onClick={handlePrev} 
                                            disabled={currentStep === 0}
                                            className="no-invert font-sans font-bold text-sm text-brand-gray/60 hover:text-brand-gray uppercase tracking-wider disabled:opacity-30 transition-colors cursor-pointer"
                                        >
                                            Назад
                                        </button>
                                        
                                        {STEPS[currentStep].multi && (
                                            <Button01 onClick={handleNext} text="Далее" variant="dark" className="cursor-pointer" />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(1.5rem,2.5vw,2.5rem)] leading-tight mb-4">
                                        {formatTypography("Оставьте свои контакты")}
                                    </h2>
                                    <p className="no-invert font-sans text-brand-gray/70 text-base mb-8">
                                        {formatTypography("Мы свяжемся в течение 15 минут и предложим несколько вариантов по стоимости")}
                                    </p>

                                    <div className="space-y-6 max-w-md">
                                        <div className="space-y-1.5">
                                            <label className="no-invert font-sans text-xs font-extrabold text-brand-gray/50 uppercase tracking-widest block">Ваше имя</label>
                                            <input
                                                type="text"
                                                required
                                                disabled={status === "loading"}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="no-invert w-full font-sans text-sm text-brand-gray bg-transparent border-b border-brand-gray/20 focus:border-[#FD4B32] py-2.5 outline-none transition-colors duration-200 placeholder-brand-gray/30 rounded-none"
                                                placeholder="Иван Иванов"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="no-invert font-sans text-xs font-extrabold text-brand-gray/50 uppercase tracking-widest block">Телефон</label>
                                            <PhoneInput
                                                value={formData.phone}
                                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                                theme="light"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="no-invert font-sans text-xs font-extrabold text-brand-gray/50 uppercase tracking-widest block">Удобный способ связи</label>
                                            <div className="flex flex-wrap gap-2">
                                                {["WhatsApp", "Telegram", "Звонок"].map((method) => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, method })}
                                                        className={`no-invert py-1.5 px-3 font-sans text-xs uppercase tracking-wider font-bold transition-colors border cursor-pointer ${formData.method === method ? 'bg-brand-gray text-white border-brand-gray' : 'bg-transparent text-brand-gray/60 border-brand-gray/20 hover:border-brand-gray/40'}`}
                                                    >
                                                        {method}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <PrivacyConsentCheckbox
                                            checked={formData.privacyConsent}
                                            onCheckedChange={(checked) => setFormData({ ...formData, privacyConsent: checked })}
                                            variant="light"
                                        />

                                        {status === "error" && (
                                            <p className="text-red-500 font-sans text-sm">Произошла ошибка при отправке.</p>
                                        )}

                                        <div className="flex gap-4 pt-6 border-t border-brand-gray/10 mt-8">
                                            <button 
                                                type="button"
                                                onClick={handlePrev} 
                                                className="no-invert font-sans font-bold text-sm text-brand-gray/60 hover:text-brand-gray uppercase tracking-wider transition-colors cursor-pointer"
                                            >
                                                Назад
                                            </button>
                                            <Button01 
                                                type="submit" 
                                                disabled={status === "loading"} 
                                                text={status === "loading" ? "Отправка..." : "Получить расчет"} 
                                                variant="dark" 
                                                className="flex-1 cursor-pointer" 
                                            />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
