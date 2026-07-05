import React from 'react';
import Image from 'next/image';

const LOGOS = [
    { src: '/images/web-service/Yandex_logo_2021_Rus.svg', alt: 'Yandex' },
    { src: '/images/web-service/perekrestok_logo_mon.svg', alt: 'Perekrestok' },
    { src: '/images/web-service/title_retail.svg', alt: 'Retail' },
    { src: '/images/web-service/46ce1882-e50c-48bd-a.svg', alt: 'Logo 4' },
    { src: '/images/web-service/Group_237763.svg', alt: 'Logo 5' }
];

export function ClientLogos() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-12 border-b border-white/10 bg-[#060606]">
            <div className="swiss-grid">
                <div className="col-span-12 flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {LOGOS.map((logo, idx) => (
                        <div key={idx} className="relative h-8 w-32 md:h-12 md:w-40">
                            <Image src={logo.src} alt={logo.alt} fill className="object-contain no-invert" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
