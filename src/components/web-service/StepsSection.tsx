import React from 'react';
import { formatTypography } from "@/utils/typography";
import { IconPlus } from "@tabler/icons-react";

const STEPS = [
    {
        num: "1 этап",
        title: "Брифинг, техническое задание и мудборд",
        items: [
            "Оценим существующий сайт и проведем брифинг, чтобы точнее понять видение создания сайта в целом и обсудить проект подробнее",
            "Составим ТЗ, определим структуру сайта, количество страниц и расскажем, что влияет на стоимость",
            "Зафиксируем цели относительно дизайна и верстки и соберем мудборд с референсами"
        ]
    },
    {
        num: "2 этап",
        title: "Прототип, контент и дизайн-концепция будущего сайта",
        items: [
            "Проведем анализ конкурентов, Вашей целевой аудитории, объема наполнения сайта контентом и количества блоков на странице",
            "Сформируем прототип сайта и базовый макет структуры лендинга под каждую страницу, а также карту сайта, чтобы он получился удобным",
            "Далее наши специалисты готовят верстку первых трёх блоков, чтобы получить обратную связь и учесть правки и дополнительные пожелания"
        ]
    },
    {
        num: "3 этап",
        title: "Дизайн сайта и пусконаладочные работы",
        items: [
            "Согласовываем драфт верстки и завершаем оставшуюся часть дизайна сайта в стиле согласованной концепции. Добавляем иллюстрации и анимации, чтобы отстроиться от конкурентов",
            "Адаптируем верстку сайта под все виды устройств: десктоп, планшеты и смартфоны. Разработка сайта под ключ готова.",
            "Проводим базовую SEO оптимизацию сайта, подключаем домен и сервисы: аналитика, CRM, виджеты и т. д."
        ]
    },
    {
        num: "4 этап",
        title: "Повышение конверсии и продвижение сайта",
        items: [
            "Проводим завершающие технические настройки сайта, запускаем А/Б-тестирование, анализ лидов и конверсии",
            "SEO продвижение, контекстная реклама, e mail маркетинг, реклама в социальных сетях — мы применяем подходящие для Тильды решения, чтобы привлечь Вашу целевую аудиторию и получать заявки"
        ]
    }
];

export function StepsSection() {
    return (
        <section className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] py-[clamp(4rem,7vw,7rem)] border-b border-brand-gray/10 bg-white">
            <div className="swiss-grid">
                <div className="col-span-12 mb-16">
                    <h2 className="no-invert font-headline font-semibold text-brand-gray text-[clamp(2rem,3.5vw,3.2rem)] leading-[0.95] tracking-tight">
                        {formatTypography("Этапы разработки сайта на Тильде")}
                    </h2>
                </div>
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative border-t border-l border-brand-gray/15">
                    <IconPlus className="absolute -top-3 -left-3 h-6 w-6 text-brand-red select-none" stroke={1.2} />
                    <IconPlus className="absolute -top-3 -right-3 h-6 w-6 text-brand-red select-none md:block hidden" stroke={1.2} />
                    
                    {STEPS.map((step, idx) => (
                        <div key={idx} className="p-[clamp(1.5rem,3vw,3rem)] border-r border-b border-brand-gray/15 flex flex-col justify-between min-h-[300px]">
                            <div>
                                <span className="text-[#FD4B32] font-sans text-xs font-extrabold uppercase tracking-widest block mb-4">
                                    {step.num}
                                </span>
                                <h3 className="no-invert font-headline font-semibold text-xl md:text-2xl text-brand-gray mb-6 leading-snug">
                                    {formatTypography(step.title)}
                                </h3>
                                <ul className="space-y-4">
                                    {step.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-1 h-1 rounded-full bg-[#FD4B32] mt-2 flex-shrink-0" />
                                            <span className="no-invert font-sans text-sm text-brand-gray/70 leading-relaxed">
                                                {formatTypography(item)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
