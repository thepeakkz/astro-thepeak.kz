"use client";

import React from "react";
import { formatTypography } from "@/utils/typography";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  city: string;
  image: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Софья Коломеец",
    role: "Основатель, маркетолог, креативный лидер",
    description: "Находит точки роста там, где другие их не видят",
    city: "Алматы",
    image: "/team/sofa.webp",
  },
  {
    name: "Сергей Белодедов",
    role: "Сооснователь, арт-директор",
    description: "Делает так, чтобы бренд выглядел дороже своих конкурентов",
    city: "Алматы",
    image: "/team/sergey.webp",
  },
  {
    name: "Софина Хакимова",
    role: "Performance-специалист",
    description:
      "Находит рабочие связки, тестирует гипотезы и превращает рекламу в заявки",
    city: "Алматы",
    image: "/team/sofina.webp",
  },
  {
    name: "Яков Пилипюк",
    role: "Сооснователь, дизайнер",
    description: "Создаёт визуал, который выделяет бренды среди конкурентов",
    city: "Алматы",
    image: "/team/yakov.webp",
  },
  {
    name: "Сергей Гаренко",
    role: "Маркетолог",
    description: "",
    city: "Астана",
    image: "/team/sergey-garenko.webp",
  },
];

export default function Team() {
  return (
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] border-b border-brand-gray/10 bg-brand-light-gray/20 scroll-mt-[clamp(2rem,2.8vw,3.5rem)]"
      id="team"
    >
      {/* Swiss Grid Vertical Stack Layout */}
      <div className="swiss-grid items-stretch rounded-none w-full">
        {/* Top Header Block: Heading + Description */}
        <div className="col-span-12 pt-[3rem] md:pt-[var(--page-margin)] pb-8 border-b border-brand-gray/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.05] max-w-2xl select-none">
            {formatTypography("Каждое направление ThePeak возглавляет специалист с практическим опытом в своей области")}
          </h2>
          <p className="no-invert description-text text-brand-gray/80 max-w-xl">
            {formatTypography(
              "Вы работаете не просто с безликими подрядчиками, а с людьми, которые принимают ключевые решения, глубоко погружаются в ваш бизнес и несут личную ответственность за конечный результат."
            )}
          </p>
        </div>

        {/* Bottom Cards Block: Grid of 5 Team Members */}
        <div className="col-span-12 py-[clamp(2rem,4vw,3.5rem)] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="relative isolate w-full aspect-[5/8] sm:aspect-[1/1.68] bg-white border border-brand-gray/15 overflow-hidden rounded-none group"
              >
                {/* Profile Image */}
                <div className="absolute inset-0 w-full h-full z-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* A single blend layer is more reliable than nested blend modes in Safari. */}
                <div className="team-card-difference no-invert pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3.5 sm:p-4 text-white">
                  <div className="no-invert flex items-start justify-between gap-2 w-full">
                    <span className="no-invert font-sans text-[clamp(0.72rem,0.68vw,0.8rem)] font-bold uppercase tracking-wider leading-tight">
                      {formatTypography(member.role)}
                    </span>
                    <span className="no-invert font-sans text-[clamp(0.72rem,0.68vw,0.8rem)] font-bold uppercase tracking-wider leading-tight text-white shrink-0 text-right">
                      {formatTypography(member.city)}
                    </span>
                  </div>

                  <div className="no-invert flex w-full flex-col items-start gap-2">
                    <h3 className="no-invert font-headline font-semibold text-[clamp(1.15rem,1.5vw,1.45rem)] tracking-wide leading-[1.1] w-full">
                      {formatTypography(member.name)}
                    </h3>
                    {member.description ? (
                      <p className="no-invert font-sans !text-[0.875rem] md:!text-[clamp(0.9rem,0.92vw,1rem)] leading-[1.25] font-medium text-white w-full">
                        {formatTypography(member.description)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
