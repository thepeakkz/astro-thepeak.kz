"use client";

import React from "react";
import { Button01 } from "@/components/ui/nextjsshop-button";
import StatsBlock from "./StatsBlock";
import { formatTypography } from "@/utils/typography";

export type HomeHeroContent = {
  title?: string;
  mobileTitle?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;
  posterUrl?: string;
};

export default function HeroDuplicate({ content = {} }: { content?: HomeHeroContent }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hasVideoEndedRef = React.useRef(false);
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  const logoIds = [2, 11, 12, 20, 21, 24, 38, 39, 40, 41, 44];
  // 4 copies to guarantee a seamless, infinite loop on all screen sizes
  const marqueeItems = [...logoIds, ...logoIds, ...logoIds, ...logoIds];
  const desktopTitle = content.title || "Маркетинг, который работает\nот идеи до результата";
  const mobileTitle = content.mobileTitle || "Маркетинг,\nкоторый работает\nот идеи до готового\nрезультата";
  const description = content.description || "Приходите к нам с задачей «сделать не как у всех».\nМы создаём маркетинг, который становится референсом для других.";

  const playHeroVideo = React.useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (hasVideoEndedRef.current) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = false;
    video.playsInline = true;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsVideoPlaying(false);
      });
    }
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    playHeroVideo();

    const handleCanPlay = () => {
      playHeroVideo();
    };
    const handlePlaying = () => {
      setIsVideoPlaying(true);
    };
    const handlePause = () => {
      if (!hasVideoEndedRef.current) {
        setIsVideoPlaying(false);
      }
    };
    const handleEnded = () => {
      hasVideoEndedRef.current = true;
      setIsVideoPlaying(true);
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        playHeroVideo();
      }
    };
    const handleUserGesture = () => {
      playHeroVideo();
    };

    video.addEventListener("loadedmetadata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pointerdown", handleUserGesture, { once: true, passive: true });
    document.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pointerdown", handleUserGesture);
      document.removeEventListener("touchstart", handleUserGesture);
    };
  }, [playHeroVideo]);

  return (
    <section className="col-span-12 relative w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] overflow-hidden h-screen md:h-auto md:min-h-screen flex flex-col justify-between pt-[60px] md:pt-[clamp(4rem,8vw,6rem)] pb-0 border-b border-brand-gray/10 select-none" id="hero-alternative">
      {/* 1. Background Video */}
      <div className="hero-video-shell absolute top-0 left-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster={content.posterUrl || "https://media.thepeak.kz/hero/bg-mobile-poster.jpg"}
          onError={(event) => {
            if (event.currentTarget.poster !== "/bg-mobile-poster.jpg") {
              event.currentTarget.poster = "/bg-mobile-poster.jpg";
            }
          }}
          disablePictureInPicture
          className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoPlaying ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source
            src={content.mobileVideoUrl || "https://media.thepeak.kz/hero/bg-mobile-fast.mp4"}
            type="video/mp4"
            media="(max-width: 767px)"
          />
          <source
            src="/bg-mobile-fast.mp4"
            type="video/mp4"
            media="(max-width: 767px)"
          />
          <source
            src={content.desktopVideoUrl || "https://media.thepeak.kz/hero/bg.webm"}
            type="video/webm"
            media="(min-width: 768px)"
          />
          <source
            src="/bg.webm"
            type="video/webm"
            media="(min-width: 768px)"
          />
          <source
            src="https://media.thepeak.kz/hero/bg.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
          <source
            src="/bg.mp4"
            type="video/mp4"
            media="(min-width: 768px)"
          />
        </video>
      </div>

      {/* Top Content Row */}
      <div className="swiss-grid w-full relative flex-grow flex items-start md:items-center">
        <div className="col-span-12 text-left">
          {/* Разгоняем clamp:
      - На мобилках стартует с 2.5rem
      - На средних экранах плавно растет как 4.5vw от ширины окна
      - На 27 дюймовых мониторах упирается в жирные, заметные 5.5rem
    */}
          <h1 className="font-headline font-semibold text-white text-[clamp(2.5rem,4.5vw,5.5rem)] leading-[0.95] tracking-[-0.03em] mb-8 md:mb-12">
            {/* Mobile: 4 lines; Desktop: 2 lines */}
            {mobileTitle.split("\n").map((line) => (
              <span key={line} className="inverttext block md:hidden">{formatTypography(line)}</span>
            ))}
            {desktopTitle.split("\n").map((line) => (
              <span key={line} className="inverttext hidden md:block">{formatTypography(line)}</span>
            ))}
          </h1>
          <p className="description-text text-white/80 mb-8 md:mb-[4.5rem] text-[clamp(0.95rem,1.1vw,1.25rem)]">
            {description.split("\n").map((line, index) => (
              <React.Fragment key={`${line}-${index}`}>
                {index > 0 ? <br /> : null}
                <span className="inverttext">{formatTypography(line)}</span>
              </React.Fragment>
            ))}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
            <Button01
              href={content.buttonUrl || "#contacts"}
              text={formatTypography(content.buttonLabel || "оставить заявку")}
              /* max-w-[80%] — забирает лишнюю длину на мобилке.
                md:max-w-none — отменяет это ограничение на компьютерах.
              */
              className="w-full max-w-[80%] sm:w-auto md:max-w-none scale-100 origin-left"
            />
          </div>
        </div>
      </div>
      {/* Bottom Container: Logos + Stats Block */}
      <div className="w-full relative flex flex-col mt-auto">
        {/* Background card container inside the same stacking context */}
        <div
          className="hero-bottom-backdrop absolute inset-0 w-full z-0 border-t border-brand-gray/10 pointer-events-none"
          style={{
            backgroundColor: "var(--hero-bottom-bg)",
            backdropFilter: "blur(var(--hero-bottom-blur))",
            WebkitBackdropFilter: "blur(var(--hero-bottom-blur))",
          }}
        />

        {/* Content rows inside bottom container with z-10 */}
        <div className="w-full relative z-10 flex flex-col">
          {/* Bottom Slider Row — visible on all screens */}
          <div className="w-full">
            {/* Mobile: label above logos */}
            <div className="sm:hidden px-[var(--page-margin)] pt-5 pb-2">
              <p className="no-invert font-headline font-bold text-brand-gray text-[13px] leading-[1.2] m-0 tracking-wider">
                Нам доверяют лучшие
              </p>
            </div>

            {/* Logo slider row */}
            <div className="flex flex-row items-stretch h-[70px] sm:h-[84px]">
              {/* Desktop-only side label */}
              <div className="hidden sm:flex border-r border-brand-gray/10 pl-[var(--page-margin)] pr-8 flex-shrink-0 self-stretch items-center" style={{ minWidth: '220px' }}>
                <p className="no-invert font-headline font-bold text-brand-gray text-[16px] leading-[1.2] m-0 tracking-wider text-left">
                  Нам доверяют лучшие
                </p>
              </div>

              {/* Logos marquee */}
              <div
                className="relative flex-grow overflow-hidden h-full flex items-center"
                style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                }}
              >
                <div
                  className="flex items-center w-max"
                  style={{
                    animation: 'marquee-scroll-horizontal 14s linear infinite',
                  }}
                >
                  {marqueeItems.map((id, index) => (
                    <div key={index} className="flex-shrink-0 h-[56px] sm:h-[58px] flex items-center justify-center mr-10">
                      <img
                        src={`https://media.thepeak.kz/logos/clot-${id}.webp`}
                        alt="Partner Logo"
                        className="h-full w-auto object-contain hover:opacity-80 transition-opacity duration-300 pointer-events-none"
                        width={125}
                        height={58}
                        onError={(event) => {
                          const fallback = `/logo/clot-${id}.webp`;
                          if (event.currentTarget.src !== fallback) {
                            event.currentTarget.src = fallback;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider Line - desktop only */}
          <div className="hidden md:block w-full border-t border-brand-gray/10" />

          {/* Integrated Stats Block - desktop only */}
          <div className="hidden md:block">
            <StatsBlock />
          </div>
        </div>
      </div>
    </section>
  );
}
