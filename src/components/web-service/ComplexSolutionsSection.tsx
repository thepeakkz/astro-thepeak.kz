import React from 'react';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { IconPlus } from "@tabler/icons-react";

const SERVICES = [
    { name: "Техподдержка", duration: "1 час" },
    { name: "SEO-продвижение", duration: "от 30 дней" },
    { name: "Нейминг", duration: "20 дней" },
    { name: "Логотип", duration: "от 3 дней" },
    { name: "Фирменный стиль", duration: "от 20 дней" },
    { name: "Гайдбук", duration: "3 дня" },
    { name: "Презентация", duration: "от 5 дней" },
    { name: "Перенос с/на Тильда", duration: "от 3 дней" },
    { name: "Настройка контекстной рекламы", duration: "от 7 дней" }
];

export function ComplexSolutionsSection() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-white/10 bg-[#060606] text-white">
            <div className="swiss-grid">
                <div className="col-span-12 mb-12">
                    <span className="text-[#FD4B32] font-sans text-xs font-extrabold uppercase tracking-widest block mb-3">
                        {formatTypography("Предложим комплексное решение")}
                    </span>
                    <h2 className="no-invert font-headline font-semibold text-white text-[clamp(2rem,3vw,3.5rem)] leading-[0.95] tracking-tight">
                        {formatTypography("Услышим Ваши пожелания")}
                    </h2>
                </div>
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10 relative rounded-none">
                    <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-[#FD4B32] select-none no-invert" stroke={1.2} />
                    <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-[#FD4B32] select-none no-invert sm:block hidden" stroke={1.2} />
                    
                    {SERVICES.map((service, idx) => (
                        <div key={idx} className="p-8 border-r border-b border-white/10 flex flex-col justify-between group hover:bg-white/5 transition-all duration-300">
                            <div>
                                <h3 className="no-invert font-headline font-semibold text-xl text-white mb-4">
                                    {formatTypography(service.name)}
                                </h3>
                                <span className="font-mono text-xs text-[#FD4B32] font-bold block mb-6">
                                    Срок: {service.duration}
                                </span>
                            </div>
                            <Button01 
                                onClick={() => {
                                    document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                text={formatTypography("Заказать")} 
                                variant="dark" 
                                className="w-full justify-center !bg-transparent border border-white/20 hover:!bg-[#FD4B32] hover:!border-[#FD4B32] hover:!text-white cursor-pointer" 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
