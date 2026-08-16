"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { CaseItem } from "@/data/cases";
import { formatTypography } from "@/utils/typography";
import { cn } from "@/lib/utils";

// Lazy loaded video helper
function LazyCaseVideo({ alt, poster, src, objectPosition }: { alt: string; poster?: string; src: string; objectPosition?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
        }
        setShouldPlay(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { rootMargin: "120px 0px", threshold: [0, 0.2] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

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
      {poster && (
        <Image
          src={poster}
          alt={alt}
          fill
          sizes="(max-width: 1023px) 94vw, 23vw"
          quality={75}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out",
            isPlaying && "opacity-0"
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
          poster && !isPlaying ? "opacity-0" : "opacity-100"
        )}
        style={objectPosition ? { objectPosition } : undefined}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}

interface ProjectCardProps {
  project: CaseItem;
  gridClass: string;
  hoveredProjectId: string | null;
  setHoveredProjectId: (id: string | null) => void;
  hasHoverSupport: boolean;
}

function ProjectCard({
  project,
  gridClass,
  hoveredProjectId,
  setHoveredProjectId,
  hasHoverSupport,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isInactive = hoveredProjectId !== null && hoveredProjectId !== project.href;

  const isVideo = !!(project.video || project.image?.toLowerCase().endsWith(".mp4"));
  const mediaSrc = project.video || project.image;

  const showHoverEffects = isHovered && hasHoverSupport;

  return (
    <motion.div
      className={cn(
        "group/main flex flex-col gap-[1.67vw] max-lg:gap-[3.074vw] max-sm:gap-[1.5vh] cursor-pointer",
        gridClass
      )}
      onMouseEnter={() => {
        if (!hasHoverSupport) return;
        setIsHovered(true);
        setHoveredProjectId(project.href);
      }}
      onMouseLeave={() => {
        if (!hasHoverSupport) return;
        setIsHovered(false);
        setHoveredProjectId(null);
      }}
      initial="initial"
      animate={{
        opacity: isInactive && hasHoverSupport ? 0.35 : 1,
        scale: isInactive && hasHoverSupport ? 0.98 : 1,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Project Image/Video Wrapper */}
      <Link href={project.href} className="relative w-full overflow-hidden select-none block">
        <div className="relative w-full overflow-hidden aspect-[16/9]">
          {/* Main Media (Always sharp, zoom on hover) */}
          <motion.div
            initial={{ scale: 1.025 }}
            animate={{
              scale: showHoverEffects ? 1.08 : 1.025,
            }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 w-full h-[110%] -top-[5%] will-change-transform"
          >
            {isVideo && mediaSrc ? (
              <LazyCaseVideo alt={project.name} poster={project.poster} src={mediaSrc} objectPosition={project.objectPosition} />
            ) : project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                fill
                sizes="(max-width: 1023px) 94vw, 23vw"
                quality={75}
                draggable={false}
                className="w-full h-full object-cover display-block"
                style={project.objectPosition ? { objectPosition: project.objectPosition } : undefined}
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </motion.div>
        </div>

        {/* Hover tags in the bottom right of the image */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex w-full flex-wrap items-end justify-end gap-1.5 p-3 max-sm:hidden">
          {project.services.map((tag, idx) => (
            <div
              key={tag}
              style={{ transitionDelay: showHoverEffects ? `${idx * 50}ms` : "0ms" }}
              className={cn(
                "max-w-full translate-y-[1.95vh] whitespace-nowrap border border-white/5 bg-black/45 px-2 py-1 font-sans text-[clamp(0.6rem,0.65vw,0.75rem)] font-bold uppercase text-[#F2F2F2] opacity-0 blur-[4px] backdrop-blur-md rounded-none select-none transition-[transform,opacity,filter] duration-400 ease-out",
                showHoverEffects && "translate-y-0 opacity-100 blur-0",
              )}
            >
              {formatTypography(tag)}
            </div>
          ))}
        </div>
      </Link>

      <Link
        href={project.href}
        className="project-info-trigger relative flex w-full flex-col gap-[0.73vw] max-lg:gap-[1.02vw] max-sm:gap-[3.48vw] text-left"
      >
        <div className="flex w-full items-center justify-between text-left">
          {/* Left Side: Pointer dot + Title */}
          <div className="flex min-w-0 flex-1 items-center text-left">
            {/* Custom square pointer before the text */}
            <motion.div
              animate={{
                width: showHoverEffects ? 0 : 8,
                marginRight: showHoverEffects ? 0 : "0.73vw",
                opacity: showHoverEffects ? 0 : 1,
                borderWidth: showHoverEffects ? 0 : 1,
              }}
              transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="project-pointer h-2 self-center border border-[#434343] max-sm:hidden shrink-0 overflow-hidden"
            />

            <h3 className="font-headline text-[clamp(1.25rem,1.35vw,1.75rem)] font-semibold leading-tight text-[#F2F2F2] text-left no-invert">
              <span className="inline-block">
                {formatTypography(project.name)}
              </span>
            </h3>
          </div>

          {/* Right Side: Hover arrow & "Смотреть проект" text reveal */}
          <div className="relative shrink-0 max-sm:hidden select-none">
            <div className="flex items-center gap-1.5 justify-end">
              <motion.div
                initial={{ width: 0, scale: 0, opacity: 0 }}
                animate={{
                  width: showHoverEffects ? 24 : 0,
                  scale: showHoverEffects ? 1 : 0,
                  opacity: showHoverEffects ? 1 : 0,
                }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="grid h-6 w-6 place-items-center overflow-hidden bg-[#F2F2F2] rounded-none shrink-0"
              >
                <motion.div
                  initial={{ rotate: 180, x: -8 }}
                  animate={{
                    rotate: showHoverEffects ? -45 : 180,
                    x: showHoverEffects ? 0 : -8,
                  }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="aspect-square h-[0.7rem] text-black flex items-center justify-center shrink-0"
                >
                  <svg className="h-full w-full" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.48676 7.09893L2.47624 7.08841L5.75973 3.79718L2.47624 0.505641L2.48676 0.495117L4.13315 0.495117L7.42871 3.79687L4.13315 7.09831L2.48676 7.09893Z"
                      fill="black"
                    ></path>
                    <path d="M0.000152588 3.24707L5.77783 3.24707L5.77783 4.34745L0.00015254 4.34745L0.000152588 3.24707Z" fill="black"></path>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Смотреть проект staggered text reveal */}
              <span
                className={cn(
                  "inline-block -translate-x-2 text-[#F2F2F2] font-sans text-[clamp(0.7rem,0.8vw,0.9rem)] font-bold leading-none uppercase opacity-0 transition-[transform,opacity] duration-300",
                  showHoverEffects && "translate-x-0 opacity-100",
                )}
              >
                Смотреть проект
              </span>
            </div>
          </div>
        </div>

        {/* Full-width description */}
        <div className="w-full max-w-none text-left font-sans text-[clamp(0.75rem,0.9vw,1rem)] leading-[1.3] text-[#8E8E93]">
          <span className="inline-block">
            {formatTypography(project.text)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

interface CasesProduxGridProps {
  cases: CaseItem[];
  limit?: number;
  className?: string;
}

export default function CasesProduxGrid({ cases: sourceCases, limit, className }: CasesProduxGridProps) {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [hasHoverSupport, setHasHoverSupport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)");
    setHasHoverSupport(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setHasHoverSupport(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const displayCases = typeof limit === "number" ? sourceCases.slice(0, limit) : sourceCases;

  return (
    <div className={cn("w-full", className)}>
      <div className="swiss-grid !gap-y-[6.5vh] pt-[5vh]">
        {displayCases.map((item) => (
          <ProjectCard
            key={item.href}
            project={item}
            gridClass="col-span-12 lg:col-span-3"
            hoveredProjectId={hoveredProjectId}
            setHoveredProjectId={setHoveredProjectId}
            hasHoverSupport={hasHoverSupport}
          />
        ))}
      </div>
    </div>
  );
}
