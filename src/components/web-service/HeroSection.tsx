import React from 'react';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import * as motion from "framer-motion/client";

export function HeroSection() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] pt-[100px] md:pt-[clamp(7rem,12vw,10rem)] pb-[clamp(4rem,8vw,6rem)] border-b border-white/10 bg-[#060606] text-white">
            <div className="swiss-grid relative w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="col-span-12 lg:col-span-10 xl:col-span-9"
                >
                    <div className="flex gap-4 mb-6">
                        <span className="font-sans text-xs uppercase tracking-widest text-[#FD4B32] border border-[#FD4B32]/30 px-3 py-1.5 rounded-none font-bold">
                            Рейтинг Рунета, 2025
                        </span>
                    </div>
                    <h1 className="no-invert font-headline font-semibold text-white text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.95] tracking-[-0.03em] mb-8">
                        {formatTypography("Заказать сайт на Тильде под ключ")}
                    </h1>
                    <p className="no-invert description-text text-white/70 max-w-2xl text-[clamp(1.1rem,1.4vw,1.25rem)] mb-10">
                        {formatTypography("Полный цикл разработки: от прототипа до готового к запуску продукта с уникальным дизайном.")}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
                        <Button01
                            onClick={() => {
                                document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            text={formatTypography("Рассчитать стоимость")}
                            variant="dark"
                            className="w-full sm:w-auto scale-100 origin-left cursor-pointer !bg-white !text-black hover:!bg-[#FD4B32] hover:!text-white hover:!border-[#FD4B32]"
                        />
                        <Button01
                            onClick={() => {
                                document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            text={formatTypography("Заказать сайт")}
                            variant="dark"
                            className="w-full sm:w-auto scale-100 origin-left cursor-pointer"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
