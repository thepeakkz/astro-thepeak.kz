"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { formatTypography } from "@/utils/typography";

const RingChart = dynamic(() => import("./RingChart"), { ssr: false });
const SplineChart = dynamic(() => import("./SplineChart"), { ssr: false });
const SphereChart = dynamic(() => import("./SphereChart"), { ssr: false });

export default function StatsBlock() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Once loaded, keep it loaded
        }
      },
      {
        rootMargin: "50px", // Trigger loading when close to viewport
        threshold: 0.05,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="w-full relative overflow-hidden h-auto select-none py-4 md:py-0 md:h-[15vh] md:min-h-[128px] flex items-center"
      id="hero-stats"
    >
      <div className="swiss-grid w-full h-full items-stretch md:items-center">

        {/* Card 1: 83% Retention */}
        <div className="col-span-12 md:col-span-4 grid grid-cols-[5.5rem_minmax(0,1fr)] md:flex items-center gap-4 h-full py-5 md:py-2 border-b md:border-b-0">
          <div className="w-20 md:w-[clamp(3.5rem,5vw,6.5rem)] aspect-square flex-shrink-0 relative">
            {inView && <RingChart />}
          </div>
          <div className="flex min-w-0 flex-col text-left justify-center">
            <div className="no-invert font-headline font-semibold text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] text-brand-gray leading-[1.1]">
              <span className="text-brand-orange">{formatTypography("83% заказчиков")}</span>{" "}
              {formatTypography("остаются с нами на долгосрочное сотрудничество 3+ лет")}
            </div>
          </div>
        </div>

        {/* Card 2: 10+ Years Experience */}
        <div className="col-span-12 md:col-span-3 grid grid-cols-[5.5rem_minmax(0,1fr)] md:flex items-center gap-4 h-full py-5 md:py-2 border-b md:border-b-0 md:border-l md:border-r border-brand-gray/10 md:px-6">
          <div className="w-20 h-14 md:w-[clamp(5rem,7vw,9.5rem)] md:h-[clamp(3.5rem,5vw,6.5rem)] flex-shrink-0 relative">
            {inView && <SplineChart />}
          </div>
          <div className="flex min-w-0 flex-col text-left justify-center">
            <div className="no-invert font-headline font-semibold text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] text-brand-gray leading-[1.1]">
              <span className="text-brand-orange">{formatTypography("10+ лет")}</span>{" "}
              {formatTypography("опыта")}
            </div>
          </div>
        </div>

        {/* Card 3: 150+ Projects */}
        <div className="col-span-12 md:col-span-5 grid grid-cols-[5.5rem_minmax(0,1fr)] md:flex items-center gap-4 h-full py-5 md:py-2">
          <div className="w-20 md:w-[clamp(3.5rem,6vw,7.8rem)] aspect-square flex-shrink-0 relative">
            {inView && <SphereChart />}
          </div>
          <div className="flex min-w-0 flex-col text-left justify-center">
            <span className="no-invert font-headline font-semibold text-brand-orange text-[clamp(1.25rem,5vw,2rem)] md:text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.1] block mb-1.5">
              {formatTypography("150+ проектов")}
            </span>
            <div className="no-invert font-sans font-medium text-[clamp(1.15rem,4.5vw,1.75rem)] md:text-[clamp(0.85rem,0.85vw,0.9rem)] text-brand-gray/80 leading-[1.12] md:leading-snug">
              {formatTypography("Объединяем опыт большой команды специалистов, где каждый знает свою зону ответственности. Благодаря этому одинаково эффективно реализуем как локальные задачи малого бизнеса, так и масштабные проекты крупных компаний.")}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
