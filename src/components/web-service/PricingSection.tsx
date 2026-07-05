import React from 'react';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { IconAppWindow, IconBuildingSkyscraper, IconShoppingCart } from "@tabler/icons-react";

const PACKAGES = [
    {
        title: "Лендинг",
        desc: "Для быстрой продажи одной услуги/товара или сбора заявок. Одностраничный сайт с высокой конверсией.",
        icon: IconAppWindow,
        features: ["Анализ аудитории", "Уникальный дизайн", "Настройка форм", "Базовая SEO-оптимизация", "Мобильная адаптация"]
    },
    {
        title: "Многостраничный сайт",
        desc: "Для корпоративного представления компании. Детальная структура, услуги, блог.",
        icon: IconBuildingSkyscraper,
        features: ["Многоуровневая навигация", "Раздел блога/новостей", "Каталог услуг", "Интеграция с CRM", "Продвинутое SEO"]
    },
    {
        title: "Интернет-магазин",
        desc: "Для онлайн-продаж. Каталог товаров, корзина, оплата.",
        icon: IconShoppingCart,
        features: ["Каталог товаров с фильтрами", "Корзина и чекаут", "Интеграция онлайн-оплаты", "Личный кабинет", "Синхронизация с 1С/CRM"]
    }
];

export function PricingSection() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-white/10 bg-[#060606]">
            <div className="swiss-grid">
                <div className="col-span-12 mb-12">
                    <h2 className="no-invert font-headline font-semibold text-white text-[clamp(2rem,3vw,3.5rem)] leading-[0.95] tracking-tight">
                        {formatTypography("Разработка сайтов на Тильде")}
                    </h2>
                </div>
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PACKAGES.map((pkg, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-8 flex flex-col justify-between hover:border-[#FD4B32] transition-colors duration-300 rounded-none">
                            <div>
                                <pkg.icon className="w-10 h-10 text-[#FD4B32] mb-6 no-invert" stroke={1.2} />
                                <h3 className="no-invert font-headline font-semibold text-2xl text-white mb-4">
                                    {formatTypography(pkg.title)}
                                </h3>
                                <p className="no-invert font-sans text-white/60 text-sm leading-relaxed mb-6">
                                    {formatTypography(pkg.desc)}
                                </p>
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#FD4B32] mt-1.5 flex-shrink-0" />
                                            <span className="no-invert font-sans text-sm text-white/80">{formatTypography(feat)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button01 
                                onClick={() => {
                                    document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                text={formatTypography("Заказать")} 
                                variant="dark" 
                                className="w-full justify-center !bg-transparent border border-white/20 hover:!bg-white hover:!text-black cursor-pointer" 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
