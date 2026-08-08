"use client";

import { BentoCard } from "@/components/ui/bento-grid";
import { CaseSizeGrid, CaseSizeGridItem } from "@/components/ui/case-size-grid";
import { allCasesData } from "@/data/cases";
import type { CaseItem } from "@/data/cases";
import { cn } from "@/lib/utils";
import { formatTypography } from "@/utils/typography";
import { useEffect, useRef, useState } from "react";

interface CasesBentoGridProps {
  limit?: number;
  className?: string;
  cases?: CaseItem[];
}

const renderCaseLogo = (name: string) => {
  return (
    <span className="no-invert font-sans font-extrabold text-[12px] tracking-wider uppercase leading-none select-none" style={{ color: "inherit", mixBlendMode: "normal" }}>
      {name}
    </span>
  );
};

function LazyCaseVideo({ alt, poster, src, objectPosition }: { alt: string; poster?: string; src: string; objectPosition?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
        setShouldPlay(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { rootMargin: "120px 0px", threshold: [0, 0.2] },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shouldLoad) {
      return;
    }

    video.muted = true;
    video.playsInline = true;

    if (!shouldPlay) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [shouldLoad, shouldPlay]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black overflow-hidden">
      {/* Zoom Wrapper */}
      <div className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-102">
        {poster && (
          <img
            src={poster}
            alt={alt}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out",
              isPlaying && "opacity-0",
            )}
            style={objectPosition ? { objectPosition } : undefined}
            loading="lazy"
            decoding="async"
          />
        )}
        <video
          ref={videoRef}
          src={shouldLoad ? src : undefined}
          autoPlay={shouldPlay}
          loop
          muted
          playsInline
          preload="none"
          className={cn(
            "h-full w-full object-cover transition-opacity duration-[1200ms] ease-out",
            poster && !isPlaying ? "opacity-0" : "opacity-100",
          )}
          style={objectPosition ? { objectPosition } : undefined}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    </div>
  );
}

export default function CasesBentoGrid({
  limit,
  className,
  cases: casesProp,
}: CasesBentoGridProps) {
  const sourceCases = casesProp ?? allCasesData;
  const cases = typeof limit === "number" ? sourceCases.slice(0, limit) : sourceCases;

  return (
    <CaseSizeGrid className={className}>
      {cases.map((item, index) => {
        const isVideo = item.video || item.image?.toLowerCase().endsWith(".mp4");
        const mediaSrc = item.video || item.image;
        const imageLoading = index < 3 ? "eager" : "lazy";

        return (
          <CaseSizeGridItem
            key={item.href}
            size={item.size}
            data-services={item.services.join(",")}
            data-industry={item.industry}
          >
            <BentoCard
              href={item.href}
              tiltFactor={4}
              background={
                isVideo && mediaSrc ? (
                  <LazyCaseVideo alt={item.name} poster={item.poster} src={mediaSrc} objectPosition={item.objectPosition} />
                ) : item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-102"
                    style={item.objectPosition ? { objectPosition: item.objectPosition } : undefined}
                    loading={imageLoading}
                    fetchPriority={index < 3 ? "low" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-black" />
                )
              }
              logo={renderCaseLogo(item.name)}
              type={item.type}
              text={formatTypography(item.text)}
            />
          </CaseSizeGridItem>
        );
      })}
    </CaseSizeGrid>
  );
}
