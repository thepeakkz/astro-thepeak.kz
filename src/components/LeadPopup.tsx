"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import PhoneInput from "@/components/ui/PhoneInput";
import PrivacyConsentCheckbox from "@/components/PrivacyConsentCheckbox";
import { Button01 } from "@/components/ui/nextjsshop-button";
import { formatTypography } from "@/utils/typography";

const EXIT_INTENT_ARM_DELAY_MS = 1_500;
const TIMED_POPUP_DELAY_MS = 40_000;
const TIMED_POPUP_RETRY_MS = 5_000;
const LEAD_POPUP_SESSION_KEY = "thepeak-lead-popup-shown";

type FormStatus = "idle" | "loading" | "success" | "error";
type PopupTrigger = "exit-intent" | "timer";

const wasExitIntentShown = () => {
  try {
    return window.sessionStorage.getItem(LEAD_POPUP_SESSION_KEY) === "true";
  } catch {
    return false;
  }
};

const markExitIntentAsShown = () => {
  try {
    window.sessionStorage.setItem(LEAD_POPUP_SESSION_KEY, "true");
  } catch {
    // The popup should still work when browser storage is unavailable.
  }
};

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<PopupTrigger>("timer");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
    privacyConsent: true,
  });
  const [phoneError, setPhoneError] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const supportsExitIntent = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (wasExitIntentShown()) {
      return;
    }

    let isTriggered = false;
    let armTimer: number | undefined;
    let timedPopupTimer: number | undefined;

    const clearTriggers = () => {
      if (armTimer !== undefined) {
        window.clearTimeout(armTimer);
      }
      if (timedPopupTimer !== undefined) {
        window.clearTimeout(timedPopupTimer);
      }
      document.removeEventListener("mouseout", handleMouseOut);
    };

    const openPopup = (popupTrigger: PopupTrigger) => {
      if (isTriggered) {
        return true;
      }

      const hasAnotherOpenDialog = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (hasAnotherOpenDialog) {
        return false;
      }

      isTriggered = true;
      markExitIntentAsShown();
      clearTriggers();
      setTrigger(popupTrigger);
      setIsOpen(true);
      return true;
    };

    const handleMouseOut = (event: MouseEvent) => {
      const leftThroughTopEdge = event.clientY <= 0 && event.relatedTarget === null;

      if (!leftThroughTopEdge) {
        return;
      }

      openPopup("exit-intent");
    };

    const scheduleTimedPopup = (delay: number) => {
      timedPopupTimer = window.setTimeout(() => {
        if (!openPopup("timer")) {
          scheduleTimedPopup(TIMED_POPUP_RETRY_MS);
        }
      }, delay);
    };

    scheduleTimedPopup(TIMED_POPUP_DELAY_MS);
    document.documentElement.dataset.leadPopupTimerReady = "true";

    if (supportsExitIntent) {
      armTimer = window.setTimeout(() => {
        document.addEventListener("mouseout", handleMouseOut);
        document.documentElement.dataset.leadPopupExitIntentReady = "true";
      }, EXIT_INTENT_ARM_DELAY_MS);
    }

    return () => {
      clearTriggers();
      delete document.documentElement.dataset.leadPopupTimerReady;
      delete document.documentElement.dataset.leadPopupExitIntentReady;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocusedElement?.focus();
    };
  }, [closePopup, isOpen]);

  const isPhoneValid = () => {
    if (!formData.contact) return false;
    const phone = formData.contact;
    const digits = phone.replace(/\D/g, "");
    if (phone.startsWith("+7") || phone.startsWith("+1") || phone.startsWith("+33")) return digits.length === 11;
    if (phone.startsWith("+375") || phone.startsWith("+380") || phone.startsWith("+996") || phone.startsWith("+998") || phone.startsWith("+49") || phone.startsWith("+44")) return digits.length === 12;
    return digits.length > 5;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPhoneError(false);

    if (!isPhoneValid()) {
      setPhoneError(true);
      return;
    }

    if (!formData.name.trim() || !formData.contact.trim() || !formData.privacyConsent) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.contact.trim(),
          comment: formData.message.trim() || "Не указан",
          source: trigger === "exit-intent" ? "Exit-intent поп-ап" : "Поп-ап через 40 секунд",
        }),
      });

      if (!response.ok) throw new Error("Lead request failed");

      setStatus("success");
    } catch (error) {
      console.error("Failed to submit lead popup form:", error);
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-popup-title"
        tabIndex={-1}
        className="relative w-full max-w-lg border border-white/10 bg-[#060606] outline-none animate-in fade-in zoom-in-95 duration-300"
      >
        <span className="pointer-events-none absolute -left-2.5 -top-2.5 select-none text-xl font-light text-brand-red">+</span>
        <span className="pointer-events-none absolute -right-2.5 -top-2.5 select-none text-xl font-light text-brand-red">+</span>
        <span className="pointer-events-none absolute -bottom-2.5 -left-2.5 select-none text-xl font-light text-brand-red">+</span>
        <span className="pointer-events-none absolute -bottom-2.5 -right-2.5 select-none text-xl font-light text-brand-red">+</span>

        <button
          type="button"
          onClick={closePopup}
          aria-label="Закрыть форму"
          className="absolute right-4 top-4 flex cursor-pointer items-center justify-center border border-white/10 p-2 text-white/50 transition-colors hover:border-white/30 hover:text-white"
        >
          <IconX className="h-4 w-4" stroke={1.8} />
        </button>

        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:p-10">
          {status === "success" ? (
            <div className="space-y-4 py-10 text-center" aria-live="polite">
              <div className="mx-auto flex h-12 w-12 items-center justify-center bg-white text-black">
                <IconCheck className="h-5 w-5" stroke={2.2} />
              </div>
              <h2 id="exit-intent-popup-title" className="font-headline text-xl font-semibold text-white">
                {formatTypography("Заявка отправлена")}
              </h2>
              <p className="font-sans text-sm text-neutral-400">
                {formatTypography("Мы свяжемся с вами в ближайшее время.")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="pr-10">
                <h2 id="exit-intent-popup-title" className="font-headline text-2xl font-bold leading-tight tracking-wide text-white md:text-3xl">
                  {formatTypography("Получите бесплатную консультацию")}
                </h2>
                <p className="mt-3 font-sans text-sm leading-relaxed text-white/60">
                  {formatTypography("Оставьте контакты — мы изучим вашу задачу и предложим подходящее решение.")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="exit-intent-name" className="block font-sans text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                    Ваше имя
                  </label>
                  <input
                    id="exit-intent-name"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={status === "loading"}
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value.replace(/\d/g, "") })}
                    className="w-full border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                    Телефон
                  </label>
                  <PhoneInput
                    value={formData.contact}
                    onChange={(contact) => {
                      setFormData({ ...formData, contact });
                      setPhoneError(false);
                    }}
                    theme="dark"
                    variant="box"
                    required
                    disabled={status === "loading"}
                  />
                  {phoneError && (
                    <p className="text-red-500 font-sans text-xs mt-1">Пожалуйста, введите полный номер телефона</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="exit-intent-message"
                    className="block font-sans text-[10px] font-extrabold uppercase tracking-widest text-neutral-400"
                  >
                    О{"\u00a0"}вашем проекте
                  </label>
                  <textarea
                    id="exit-intent-message"
                    rows={3}
                    disabled={status === "loading"}
                    placeholder={formatTypography("Расскажите о задачах и целях проекта...")}
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                    className="w-full resize-none border border-white/10 bg-white/5 px-4 py-3 font-sans text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <PrivacyConsentCheckbox
                  checked={formData.privacyConsent}
                  onCheckedChange={(privacyConsent) => setFormData({ ...formData, privacyConsent })}
                  disabled={status === "loading"}
                  variant="dark"
                />

                {status === "error" && (
                  <p className="font-sans text-xs font-semibold text-red-500" role="alert">
                    {formatTypography("Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.")}
                  </p>
                )}

                <Button01
                  type="submit"
                  disabled={status === "loading"}
                  text={status === "loading" ? "Отправка..." : "Получить консультацию"}
                  variant="dark"
                  className="w-full cursor-pointer"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
