"use client";

import React, { useState } from 'react';
import { formatTypography } from "@/utils/typography";
import { HelpCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
    {
        q: "Сколько стоит разработка сайта?",
        a: "Стоимость сайта зависит от сложности проекта, его функционала и дизайна. Простой одностраничный сайт может стоить от 150 000, в то время как более сложный сайт, такой как интернет-магазин или корпоративный сайт, может варьироваться от 300 000 до 600 000 рублей и выше. Все зависит от объема работы и индивидуальных требований."
    },
    {
        q: "Сколько занимает создание сайта под ключ?",
        a: "Лендинг — от 3 до 5 недель. Экспресс-лендинг — 9 рабочих дней. Корпоративный сайт или сайт-визитка — от 5 до 8 недель. Интернет-магазин или сайт-каталог — от 5 до 8 недель."
    },
    {
        q: "Сколько правок я могу внести в проект?",
        a: "На каждом этапе у нас заложено 2 бесплатные итерации правок. После завершения этапов и полного согласования проекта можете заказать дополнительные правки, которые оплачиваются отдельно."
    },
    {
        q: "У вас есть опыт в моем направлении?",
        a: "Мы уже создали более 1000 сайтов для клиентов из различных отраслей, включая корпоративные сайты, интернет-магазины, а также сайты для стартапов и крупных компаний. Мы понимаем специфику разных ниш и всегда стараемся предложить оптимальные решения."
    },
    {
        q: "Если нет понимания, чего хочу — как быть?",
        a: "Если у вас нет четкого представления о дизайне, не переживайте — это обычная ситуация, и мы можем помочь вам разобраться и найти оптимальное решение."
    },
    {
        q: "А что если мне не понравится готовый сайт?",
        a: "Если готовый сайт вам не понравится, мы обязательно учтем ваши замечания и внесем необходимые изменения. В процессе разработки мы всегда проводим несколько итераций для того, чтобы учесть ваши пожелания и скорректировать проект, чтобы он соответствовал вашим ожиданиям."
    }
];

export function FAQSection() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-white/10 bg-[#060606] text-white">
            <div className="swiss-grid items-stretch w-full">
                <div className="col-span-12 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8 flex flex-col justify-center">
                    <h2 className="no-invert font-headline font-bold text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.0] tracking-tight text-white mb-6">
                        {formatTypography("FAQ")}
                    </h2>
                    <p className="no-invert text-white/50 font-sans text-base leading-relaxed max-w-sm">
                        {formatTypography("Отвечаем на популярные вопросы о стоимости, сроках и процессе разработки.")}
                    </p>
                </div>

                <div className="col-span-12 lg:col-span-7 lg:pl-8 flex flex-col">
                    <div className="flex flex-col border-t border-white/10">
                        {FAQS.map((faq, idx) => {
                            const isOpen = activeFaq === idx;
                            return (
                                <div key={idx} className="border-b border-white/10">
                                    <button
                                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                                        className="w-full text-left py-6 flex items-center justify-between group cursor-pointer focus:outline-none select-none"
                                    >
                                        <div className="flex items-center gap-4 flex-grow min-w-0 pr-4">
                                            <HelpCircle className="w-5 h-5 text-white/30 group-hover:text-[#FD4B32] transition-colors shrink-0" />
                                            <h3 className="no-invert font-headline font-semibold text-base md:text-lg text-white group-hover:text-white/80 transition-colors">
                                                {formatTypography(faq.q)}
                                            </h3>
                                        </div>

                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${isOpen ? "border-white bg-white text-black" : "border-white/10 text-white/50 group-hover:border-white/30 group-hover:text-white"}`}>
                                            <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
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
                                                <p className="no-invert pb-6 pl-9 text-white/50 font-sans text-sm leading-relaxed max-w-xl">
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
    );
}
