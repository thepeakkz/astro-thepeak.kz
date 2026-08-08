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
    name: "Иван Плужник",
    role: "Арт-директор",
    description: "",
    city: "Астана",
    image: "https://res.cloudinary.com/dxvynbrut/image/upload/v1785915162/team/ivan-pluzhnik.webp",
  },
];

export default function Team({
  heading = "Каждое направление\nThePeak возглавляет специалист с практическим опытом в своей области",
  description = "Вы работаете не просто с безликими подрядчиками, а с людьми, которые принимают ключевые решения, глубоко погружаются в ваш бизнес и несут личную ответственность за конечный результат.",
}: {
  heading?: string;
  description?: string;
}) {
  return (
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] border-b border-brand-gray/10 bg-brand-light-gray/20 scroll-mt-[clamp(2rem,2.8vw,3.5rem)]"
      id="team"
    >
      {/* Two-column Swiss grid: intro on the left, team cards on the right. */}
      <div className="swiss-grid items-stretch rounded-none w-full">
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 self-stretch border-b border-brand-gray/25 pb-[clamp(2.5rem,5vw,4.5rem)] pt-0 text-left lg:border-b-0 lg:border-r lg:pb-[clamp(3.5rem,7vw,7rem)] lg:pr-[var(--grid-gap)]">
          <div className="flex h-full max-w-[95%] flex-col justify-between gap-8 pt-[3rem] md:pt-[var(--page-margin)]">
            <h2 className="no-invert select-none font-headline text-[clamp(1.4rem,2.56vw,1.6rem)] font-semibold leading-[1] text-brand-gray">
              {heading.split("\n").map((line) => (
                <span key={line} className="block">{formatTypography(line)}</span>
              ))}
            </h2>
            <p className="no-invert description-text text-brand-gray/80">
              {formatTypography(description)}
            </p>
          </div>
        </div>

        <div className="col-span-12 w-full pb-[clamp(2.5rem,5vw,4.5rem)] pt-0 lg:col-span-8 lg:pb-[clamp(3.5rem,7vw,7rem)] lg:pl-[clamp(1.5rem,3vw,3rem)] xl:col-span-9">
          <div className="grid w-full grid-cols-2 gap-3 pt-[3rem] md:pt-[var(--page-margin)] lg:grid-cols-4">
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
