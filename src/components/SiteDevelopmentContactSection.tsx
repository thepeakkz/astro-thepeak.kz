"use client";

import { useState } from "react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { CONTACTS } from "@/config/contacts";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import PhoneInput from "@/components/ui/PhoneInput";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { formatTypography } from "@/utils/typography";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function SiteDevelopmentContactSection() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [contactMethod, setContactMethod] = useState("WhatsApp");
  const [privacyConsent, setPrivacyConsent] = useState(true);
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !name.trim() ||
      phone.replace(/\D/g, "").length < 6 ||
      !privacyConsent
    ) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const details = [
        company.trim() ? `Компания: ${company.trim()}` : "",
        project.trim() ? `Задача: ${project.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          comment: `${details || "Хочу обсудить разработку сайта"}\n\n[Способ связи: ${contactMethod}]`,
          source: "Форма проекта (Разработка сайтов)",
        }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setStatus("success");
      setName("");
      setCompany("");
      setPhone("");
      setProject("");
    } catch {
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const fieldClassName =
    "no-invert w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white outline-none transition-colors duration-200 placeholder:text-neutral-500 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <section
      id="contacts"
      aria-labelledby="site-contact-title"
      className="relative isolate min-h-[52rem] overflow-hidden bg-[#e9eeed] px-[var(--page-margin)] pb-0 pt-[clamp(2rem,4.2vw,4rem)] text-black scroll-mt-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,.9), transparent 34%), radial-gradient(circle at 78% 80%, rgba(255,255,255,.55), transparent 42%)",
      }}
    >
      <div className="relative z-10 grid gap-x-[clamp(2rem,5vw,6rem)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(31rem,0.88fr)]">
        <div className="flex min-h-[38rem] flex-col lg:min-h-[41rem]">
          <div className="flex items-start gap-[clamp(1rem,2.2vw,2rem)]">
            <h3
              id="site-contact-title"
              className="no-invert max-w-[7.5ch] font-headline text-[clamp(3.5rem,4.1vw,5rem)] font-medium tracking-[-0.055em] !leading-[0.94]"
            >
              {formatTypography("Давайте создадим сайт вместе")}
            </h3>
            <div className="mt-1 flex shrink-0 items-end gap-2">
              <div className="grid h-[clamp(5.2rem,8vw,8rem)] w-[clamp(5.2rem,8vw,8rem)] grid-cols-2 grid-rows-2 bg-[#dfe9e7] p-3">
                <span className="h-4 w-4 bg-[#FD4B32]" />
                <span className="h-4 w-4 self-end justify-self-end bg-black" />
                <span className="h-4 w-4 self-end bg-black" />
                <span className="h-4 w-4 justify-self-end bg-[#FD4B32]" />
              </div>
              <span className="mb-0.5 [writing-mode:vertical-rl] font-mono text-[10px] uppercase tracking-[0.14em]">
                The Peak
              </span>
            </div>
          </div>

          <div className="mt-[clamp(3rem,5vw,5.5rem)] max-w-[31rem]">
            <h3 className="no-invert max-w-[24ch] font-headline text-[clamp(1.25rem,1.7vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.025em]">
              {formatTypography("Обсудим задачу и предложим решение за 30 минут")}
            </h3>
            <p className="no-invert mt-7 max-w-[29rem] text-[clamp(1rem,1.2vw,1.25rem)] leading-[1.45] text-black/70">
              {formatTypography(
                "Расскажите о бизнесе и целях проекта. На первой встрече определим формат сайта, сроки и следующий шаг",
              )}
            </p>
            <Button01
              href={CONTACTS.phone.tel}
              text="Позвонить"
              className="no-invert mt-9 w-fit"
            />
          </div>

          <address className="mt-auto flex flex-col items-start gap-1 pb-8 pt-12 font-headline text-[clamp(1.15rem,1.6vw,1.55rem)] font-semibold not-italic tracking-[-0.025em] lg:pb-5">
            <a className="no-invert underline decoration-1 underline-offset-4" href={CONTACTS.phone.tel}>
              {CONTACTS.phone.display}
            </a>
            <a className="underline decoration-1 underline-offset-4" href={`mailto:${CONTACTS.email}`}>
              {CONTACTS.email}
            </a>
            <div className="mt-4 flex gap-2">
              <a
                href={CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="no-invert flex h-11 w-11 items-center justify-center border border-black/20 text-black transition-colors hover:border-[#FD4B32] hover:bg-[#FD4B32] hover:text-white"
              >
                <IconBrandWhatsapp className="h-5 w-5" stroke={1.5} />
              </a>
              <a
                href={CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="no-invert flex h-11 w-11 items-center justify-center border border-black/20 text-black transition-colors hover:border-[#FD4B32] hover:bg-[#FD4B32] hover:text-white"
              >
                <IconBrandTelegram className="h-5 w-5" stroke={1.5} />
              </a>
            </div>
          </address>
        </div>

        <div className="self-start bg-black p-[clamp(1.5rem,3vw,2.75rem)] text-white lg:min-h-[41rem]">
          {status === "success" ? (
            <div className="flex min-h-[35rem] flex-col justify-between">
              <p className="no-invert font-mono text-xs uppercase tracking-[0.16em] text-white/45">
                Заявка отправлена
              </p>
              <div>
                <h3 className="no-invert max-w-[13ch] font-headline text-[clamp(2rem,3vw,3.5rem)] font-medium tracking-[-0.045em] !leading-[0.98]">
                  {formatTypography("Спасибо. Скоро обсудим ваш проект")}
                </h3>
                <p className="no-invert mt-6 max-w-md text-base leading-relaxed text-white/55">
                  {formatTypography("Свяжемся с вами в течение рабочего дня")}
                </p>
              </div>
              <Button01
                onClick={() => setStatus("idle")}
                text="Отправить ещё раз"
                variant="dark"
                className="w-fit"
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex min-h-[35rem] flex-col">
              <h3 className="no-invert font-headline text-[clamp(1.8rem,2.55vw,3rem)] font-medium tracking-[-0.045em] !leading-[1]">
                {formatTypography("Расскажите о проекте")}
              </h3>

              <div className="mt-[clamp(2.5rem,5vw,4.5rem)] grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="block font-sans text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    Ваше имя
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Иван Иванов"
                    autoComplete="name"
                    className={fieldClassName}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="block font-sans text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    Компания
                  </span>
                  <input
                    type="text"
                    disabled={isLoading}
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Название компании"
                    autoComplete="organization"
                    className={fieldClassName}
                  />
                </label>
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="block font-sans text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    Контакты (Телефон)
                  </span>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    theme="dark"
                    variant="box"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <span className="block font-sans text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    Где с вами связаться?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["WhatsApp", "Telegram", "Звонок"].map((label) => {
                      const isActive = contactMethod === label;

                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={isLoading}
                          onClick={() => setContactMethod(label)}
                          className={`no-invert flex items-center gap-1.5 border px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            isActive
                              ? "border-white bg-white text-black"
                              : "border-white/10 bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {formatTypography(label)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block space-y-1.5 sm:col-span-2">
                  <span className="block font-sans text-xs font-extrabold uppercase tracking-widest text-neutral-400">
                    О вашем проекте
                  </span>
                  <textarea
                    disabled={isLoading}
                    value={project}
                    onChange={(event) => setProject(event.target.value)}
                    placeholder="Расскажите о задачах и целях проекта..."
                    rows={3}
                    className={`${fieldClassName} resize-none`}
                  />
                </label>
              </div>

              <div className="mt-8">
                <PrivacyConsentCheckbox
                  checked={privacyConsent}
                  onCheckedChange={setPrivacyConsent}
                  disabled={isLoading}
                  variant="dark"
                />
                {status === "error" && (
                  <p className="no-invert mt-4 text-sm text-[#FD4B32]" role="alert">
                    {formatTypography("Проверьте имя, телефон и согласие на обработку данных")}
                  </p>
                )}
              </div>

              <Button01
                type="submit"
                disabled={isLoading}
                text={isLoading ? "Отправка..." : "Отправить заявку"}
                variant="dark"
                className="mt-8 w-full cursor-pointer"
              />
            </form>
          )}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="relative z-0 -ml-[var(--page-margin)] mt-[clamp(2rem,4vw,4rem)] flex w-[calc(100%+2*var(--page-margin))] items-end justify-between pb-[clamp(1rem,2vw,2rem)] whitespace-nowrap px-[0.015em] font-headline text-[clamp(3.15rem,12.2vw,14rem)] font-medium uppercase tracking-[-0.075em] !leading-[0.82]"
      >
        <span>Начнём</span>
        <span>проект</span>
      </div>
    </section>
  );
}
