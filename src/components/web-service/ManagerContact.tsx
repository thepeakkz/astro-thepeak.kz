import React from 'react';
import Image from 'next/image';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { CONTACTS } from "@/config/contacts";

export function ManagerContact() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-brand-gray/10 bg-white">
            <div className="swiss-grid">
                <div className="col-span-12 flex flex-col md:flex-row gap-8 lg:gap-16 items-center p-[clamp(2rem,4vw,4rem)] border border-brand-gray/15 bg-brand-light-gray/10 rounded-none relative">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-500">
                            <Image 
                                src="/images/web-service/2025-02-14_120223.jpg" 
                                alt="Даниил Максимов" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <h4 className="no-invert font-headline font-semibold text-xl text-brand-gray mb-1 text-center">
                            {formatTypography("Даниил Максимов")}
                        </h4>
                        <p className="no-invert font-sans text-brand-gray/60 text-sm text-center">
                            {formatTypography("Руководитель отдела продаж")}
                        </p>
                    </div>
                    
                    <div className="w-full md:w-2/3 flex flex-col gap-6">
                        <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(1.8rem,3vw,3.5rem)] leading-[0.95] tracking-tight">
                            {formatTypography("Рассчитайте стоимость разработки сайта на Tilda")}
                        </h2>
                        <p className="no-invert font-sans text-brand-gray/70 text-base leading-relaxed max-w-xl">
                            {formatTypography("Отправьте заявку и мы свяжемся в течение 15 минут, чтобы предложить несколько вариантов по стоимости, исходя из вашей задачи.")}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <Button01
                                onClick={() => window.open(CONTACTS.telegramUrl, '_blank')}
                                text="Написать в Telegram"
                                variant="dark"
                                className="cursor-pointer"
                            />
                            <Button01
                                onClick={() => window.open(CONTACTS.whatsappUrl, '_blank')}
                                text="Написать в WhatsApp"
                                variant="dark"
                                className="cursor-pointer !bg-white !text-black border border-brand-gray/20 hover:!bg-brand-gray hover:!text-white hover:!border-brand-gray"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
