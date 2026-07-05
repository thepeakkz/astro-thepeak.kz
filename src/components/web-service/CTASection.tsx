import React from 'react';
import { formatTypography } from "@/utils/typography";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { IconPlus } from "@tabler/icons-react";

export function CTASection() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-brand-gray/10 bg-white">
            <div className="swiss-grid">
                <div className="col-span-12 border border-brand-gray/15 p-[clamp(2rem,4vw,4rem)] flex flex-col lg:flex-row gap-8 justify-between items-center bg-brand-light-gray/10 rounded-none relative">
                    <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
                    <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
                    <IconPlus className="absolute -bottom-3 -left-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
                    <IconPlus className="absolute -right-3 -bottom-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />

                    <div className="w-full lg:w-8/12">
                        <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(1.8rem,3vw,3rem)] leading-[0.9] tracking-tight">
                            {formatTypography("Каждое большое дело начинается с малого")}
                        </h2>
                    </div>
                    
                    <div className="w-full lg:w-4/12 flex justify-start lg:justify-end">
                        <Button01 
                            onClick={() => {
                                document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            text={formatTypography("Начать проект")} 
                            variant="dark"
                            className="cursor-pointer !bg-black !text-white hover:!bg-[#FD4B32] hover:!border-[#FD4B32]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
