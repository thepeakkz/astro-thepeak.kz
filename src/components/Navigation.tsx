"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconPhone,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { CONTACTS } from "@/config/contacts";

export default function Navigation() {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const menuItems = [
    { label: "услуги", href: "/#services" },
    { label: "кейсы", href: "/cases" },
    { label: "контакты", href: "/#contacts" },
  ];

  const handleNavClick = () => setMobileOpen(false);

  return (
    <>
      {/* ── Mobile Header Bar: logo + burger aligned on one line ── */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-[1000] h-[52px] flex items-center justify-between px-[var(--page-margin)] transition-all duration-300 pointer-events-none",
          scrolled
            ? "bg-white/92 backdrop-blur-md border-b border-brand-gray/10 shadow-xs"
            : "bg-transparent"
        )}
      >
        <Link
          href="/"
          aria-label="ThePeak Home"
          className="pointer-events-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 68 20"
            className="w-[3.5rem] h-auto transition-colors duration-300 fill-brand-gray hover:fill-brand-red"
          >
            <path d="M30.3212 0C26.0152 0 21.7091 0 17.4031 0C17.4031 1.3762 17.4031 2.7523 17.4031 4.1285C21.7091 4.1285 26.0152 4.1285 30.3212 4.1285C30.3212 2.7523 30.3212 1.3762 30.3212 0Z" />
            <path d="M25.6423 7.9358C22.8959 7.9358 20.1495 7.9358 17.4031 7.9358C17.4031 9.3119 17.4031 10.6881 17.4031 12.0643C20.1495 12.0643 22.8959 12.0643 25.6423 12.0643C25.6423 10.6881 25.6423 9.3119 25.6423 7.9358Z" />
            <path d="M31.613 15.8715C26.8764 15.8715 22.1397 15.8715 17.4031 15.8715C17.4031 17.2477 17.4031 18.6238 17.4031 20C22.1397 20 26.8764 20 31.613 20C31.613 18.6238 31.613 17.2477 31.613 15.8715Z" />
            <path d="M8.2064 0C5.4709 0 2.7355 0 0 0C0 1.3426 0 2.6852 0 4.0278C2.5015 4.0278 5.003 4.0278 7.5045 4.0278C8.5071 4.0278 9.3199 4.8384 9.3199 5.8383C9.3199 5.8408 9.3195 5.8432 9.3195 5.8457C9.3156 6.8422 8.5046 7.6489 7.5045 7.6489C5.003 7.6489 2.5015 7.6489 0 7.6489C0 11.7659 0 15.883 0 20C1.3995 20 2.7989 20 4.1984 20C4.1984 17.2598 4.1984 14.5195 4.1984 11.7793C5.5344 11.7793 6.8704 11.7793 8.2064 11.7793C11.1039 11.7793 13.4528 9.4366 13.4528 6.5469C13.4528 6.1088 13.4528 5.6706 13.4528 5.2324C13.4528 2.3426 11.1039 0 8.2064 0Z" />
            <path d="M45.7489 0C42.2622 6.6666 38.7755 13.3333 35.2888 19.9999C36.8594 19.9999 38.4301 19.9999 40.0007 19.9999C41.9168 16.3364 43.8328 12.6729 45.7489 9.0094C47.6649 12.6729 49.5809 16.3365 51.4969 20C53.0676 20 54.6382 20 56.2089 20C52.7222 13.3333 49.2356 6.6667 45.7489 0Z" />
            <path d="M57.1414 9.9615C57.1414 9.963 57.1414 9.9644 57.1414 9.9658C57.1418 9.9651 57.1423 9.9644 57.1427 9.9637C57.1423 9.963 57.1418 9.9622 57.1414 9.9615Z" />
            <path d="M57.1453 9.9625C57.145 9.9629 57.1448 9.963 57.1445 9.9636C57.1448 9.964 57.145 9.9644 57.1453 9.9649C57.1453 9.9641 57.1453 9.9633 57.1453 9.9625Z" />
            <path d="M57.1414 10.0437C58.8596 13.3355 60.5778 16.6272 62.296 19.919C63.8725 19.919 65.449 19.919 67.0255 19.919C66.9594 19.79 66.8933 19.661 66.8272 19.532C65.1944 16.4039 63.5617 13.2759 61.9289 10.1478C61.9461 10.118 61.9634 10.0883 61.9806 10.0585C63.9871 6.7068 65.9935 3.355 68 0.0033C67.6559 0.0022 67.3119 0.0011 66.9678 0C65.6305 0 64.2931 0 62.9558 0C61.0177 3.3479 59.0795 6.6958 57.1414 10.0437C57.1882 10.0707 57.2351 10.0976 57.2819 10.1246C57.2351 10.0976 57.1882 10.0707 57.1414 10.0437Z" />
          </svg>
        </Link>
        <button
          className="pointer-events-auto w-10 h-10 flex items-center justify-center transition-colors duration-300 text-brand-gray hover:text-brand-red"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {mobileOpen ? (
            <IconX className="w-6 h-6" stroke={1.5} />
          ) : (
            <IconMenu2 className="w-6 h-6" stroke={1.5} />
          )}
        </button>
      </div>
      {/* ── Desktop Header ── */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-[990] pt-2.5 pb-2.5 swiss-grid items-center transition-all duration-300 pointer-events-none",
          scrolled
            ? "bg-white/92 backdrop-blur-md border-b border-brand-gray/10 shadow-xs"
            : "bg-transparent"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="ThePeak Home"
          className="hidden md:flex md:col-span-3 items-center pointer-events-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 68 20"
            className="w-[clamp(3.5rem,5vw,5rem)] h-auto transition-colors duration-300 fill-brand-gray hover:fill-brand-red"
          >
            <path d="M30.3212 0C26.0152 0 21.7091 0 17.4031 0C17.4031 1.3762 17.4031 2.7523 17.4031 4.1285C21.7091 4.1285 26.0152 4.1285 30.3212 4.1285C30.3212 2.7523 30.3212 1.3762 30.3212 0Z" />
            <path d="M25.6423 7.9358C22.8959 7.9358 20.1495 7.9358 17.4031 7.9358C17.4031 9.3119 17.4031 10.6881 17.4031 12.0643C20.1495 12.0643 22.8959 12.0643 25.6423 12.0643C25.6423 10.6881 25.6423 9.3119 25.6423 7.9358Z" />
            <path d="M31.613 15.8715C26.8764 15.8715 22.1397 15.8715 17.4031 15.8715C17.4031 17.2477 17.4031 18.6238 17.4031 20C22.1397 20 26.8764 20 31.613 20C31.613 18.6238 31.613 17.2477 31.613 15.8715Z" />
            <path d="M8.2064 0C5.4709 0 2.7355 0 0 0C0 1.3426 0 2.6852 0 4.0278C2.5015 4.0278 5.003 4.0278 7.5045 4.0278C8.5071 4.0278 9.3199 4.8384 9.3199 5.8383C9.3199 5.8408 9.3195 5.8432 9.3195 5.8457C9.3156 6.8422 8.5046 7.6489 7.5045 7.6489C5.003 7.6489 2.5015 7.6489 0 7.6489C0 11.7659 0 15.883 0 20C1.3995 20 2.7989 20 4.1984 20C4.1984 17.2598 4.1984 14.5195 4.1984 11.7793C5.5344 11.7793 6.8704 11.7793 8.2064 11.7793C11.1039 11.7793 13.4528 9.4366 13.4528 6.5469C13.4528 6.1088 13.4528 5.6706 13.4528 5.2324C13.4528 2.3426 11.1039 0 8.2064 0Z" />
            <path d="M45.7489 0C42.2622 6.6666 38.7755 13.3333 35.2888 19.9999C36.8594 19.9999 38.4301 19.9999 40.0007 19.9999C41.9168 16.3364 43.8328 12.6729 45.7489 9.0094C47.6649 12.6729 49.5809 16.3365 51.4969 20C53.0676 20 54.6382 20 56.2089 20C52.7222 13.3333 49.2356 6.6667 45.7489 0Z" />
            <path d="M57.1414 9.9615C57.1414 9.963 57.1414 9.9644 57.1414 9.9658C57.1418 9.9651 57.1423 9.9644 57.1427 9.9637C57.1423 9.963 57.1418 9.9622 57.1414 9.9615Z" />
            <path d="M57.1453 9.9625C57.145 9.9629 57.1448 9.963 57.1445 9.9636C57.1448 9.964 57.145 9.9644 57.1453 9.9649C57.1453 9.9641 57.1453 9.9633 57.1453 9.9625Z" />
            <path d="M57.1414 10.0437C58.8596 13.3355 60.5778 16.6272 62.296 19.919C63.8725 19.919 65.449 19.919 67.0255 19.919C66.9594 19.79 66.8933 19.661 66.8272 19.532C65.1944 16.4039 63.5617 13.2759 61.9289 10.1478C61.9461 10.118 61.9634 10.0883 61.9806 10.0585C63.9871 6.7068 65.9935 3.355 68 0.0033C67.6559 0.0022 67.3119 0.0011 66.9678 0C65.6305 0 64.2931 0 62.9558 0C61.0177 3.3479 59.0795 6.6958 57.1414 10.0437C57.1882 10.0707 57.2351 10.0976 57.2819 10.1246C57.2351 10.0976 57.1882 10.0707 57.1414 10.0437Z" />
          </svg>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex col-start-7 col-span-3 items-center gap-[clamp(0.75rem,2vw,2rem)] pointer-events-auto">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-sans text-[clamp(0.65rem,0.8vw,0.8rem)] font-medium uppercase tracking-[0.1em] transition-colors duration-300 text-brand-gray hover:text-brand-red"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Phone */}
        <div className="hidden md:flex col-start-10 col-span-3 justify-end items-center relative select-none">
          <a
            href={CONTACTS.phone.tel}
            className={cn(
              "font-sans text-[clamp(0.8rem,1vw,0.95rem)] font-bold uppercase tracking-[0.05em] transition-all duration-300 absolute right-0 whitespace-nowrap cursor-pointer pointer-events-auto text-brand-gray hover:text-brand-red",
              isHovered
                ? "opacity-0 scale-95 pointer-events-none"
                : "opacity-100 scale-100",
            )}
          >
            {CONTACTS.phone.display}
          </a>
        </div>
      </header>

      {/* ── Desktop Social Icons on Hover ── */}
      <div className="hidden md:block fixed top-0 left-0 w-full z-[991] pt-2.5 pb-2.5 swiss-grid items-center pointer-events-none">
        <div className="col-start-10 col-span-3 flex justify-end items-center relative select-none">
          <div
            className="relative flex items-center justify-end h-10 w-48 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute right-0 w-full h-full cursor-pointer" />
            <div
              className={cn(
                "flex items-center gap-3 transition-all duration-300 absolute right-0",
                isHovered
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none",
              )}
            >
              <a
                href={CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="no-invert p-2 bg-brand-light-gray hover:bg-brand-red text-brand-gray hover:text-white transition-colors duration-200 border border-brand-gray/10 rounded-none flex items-center justify-center cursor-pointer"
              >
                <IconBrandTelegram className="w-5 h-5" stroke={1.2} />
              </a>
              <a
                href={CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="no-invert p-2 bg-brand-light-gray hover:bg-brand-red text-brand-gray hover:text-white transition-colors duration-200 border border-brand-gray/10 rounded-none flex items-center justify-center cursor-pointer"
              >
                <IconBrandWhatsapp className="w-5 h-5" stroke={1.2} />
              </a>
              <a
                href={CONTACTS.phone.tel}
                aria-label="Direct Call"
                className="no-invert p-2 bg-brand-light-gray hover:bg-brand-red text-brand-gray hover:text-white transition-colors duration-200 border border-brand-gray/10 rounded-none flex items-center justify-center cursor-pointer"
              >
                <IconPhone className="w-5 h-5" stroke={1.2} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Fullscreen Overlay Menu ── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[999] flex flex-col justify-between transition-all duration-500",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        style={{
          background: "rgba(232, 239, 242, 0.97)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Spacer for fixed mobile header */}
        <div className="h-[52px] flex-shrink-0" />

        {/* Nav Links */}
        <nav className="flex flex-col items-start px-[var(--page-margin)] gap-2">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleNavClick}
              className="text-brand-gray hover:text-brand-orange transition-colors duration-200"
              style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
            >
              <h1 className="font-sans font-black text-[clamp(3rem,14vw,6rem)] leading-[0.85]">
                {item.label}
              </h1>
            </Link>
          ))}
        </nav>

        {/* Bottom: contacts + socials */}
        <div className="px-[var(--page-margin)] pb-8 flex flex-col gap-4 border-t border-brand-gray/15 pt-6">
          <a
            href={CONTACTS.phone.tel}
            className="no-invert font-sans font-bold text-brand-gray text-lg tracking-wider uppercase"
          >
            {CONTACTS.phone.display}
          </a>
          <div className="flex gap-3">
            <a
              href={CONTACTS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="no-invert p-3 bg-white border border-brand-gray/15 text-brand-gray hover:bg-brand-orange hover:text-white transition-colors duration-200 rounded-none flex items-center justify-center"
            >
              <IconBrandTelegram className="w-5 h-5" stroke={1.2} />
            </a>
            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="no-invert p-3 bg-white border border-brand-gray/15 text-brand-gray hover:bg-brand-orange hover:text-white transition-colors duration-200 rounded-none flex items-center justify-center"
            >
              <IconBrandWhatsapp className="w-5 h-5" stroke={1.2} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
