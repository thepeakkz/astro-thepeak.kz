"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CaseItem } from "@/data/cases";
import { formatTypography } from "@/utils/typography";
import { cn } from "@/lib/utils";
import { optimizeCloudinaryVideoUrl } from "@/utils/media";

// Map index in a chunk of 5 to Produx-style grid columns
const getGridClass = (index: number) => {
  switch (index) {
    case 0:
      return "col-span-12 lg:col-span-7";
    case 1:
      return "col-span-12 lg:col-span-4 lg:col-start-9 lg:mt-auto h-fit";
    case 2:
      return "col-span-12 lg:col-span-10 lg:col-start-2";
    case 3:
      return "col-span-12 lg:col-span-4 h-fit";
    case 4:
      return "col-span-12 lg:col-span-7 lg:col-start-6";
    default:
      return "col-span-12";
  }
};

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
        <img
          src={poster}
          alt={alt}
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
        filter: isInactive && hasHoverSupport ? "blur(4px)" : "blur(0px)",
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
              <LazyCaseVideo alt={project.name} poster={project.poster} src={optimizeCloudinaryVideoUrl(mediaSrc)} objectPosition={project.objectPosition} />
            ) : project.image ? (
              <img
                src={project.image}
                alt={project.name}
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
        <div className="pointer-events-none absolute right-0 bottom-0 m-[1.39vw] flex gap-[0.41vw] max-sm:hidden">
          {project.services.map((tag, idx) => (
            <motion.div
              key={tag}
              initial={{ y: "1.95vh", opacity: 0, filter: "blur(4px)" }}
              animate={{
                y: showHoverEffects ? 0 : "1.95vh",
                opacity: showHoverEffects ? 1 : 0,
                filter: showHoverEffects ? "blur(0px)" : "blur(4px)",
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 1, 0.5, 1],
                delay: showHoverEffects ? idx * 0.05 : 0,
              }}
              className="font-sans text-[clamp(0.65rem,0.8vw,0.9rem)] font-bold border border-white/5 bg-black/45 px-3 py-1.5 uppercase backdrop-blur-md text-[#F2F2F2] rounded-none select-none"
            >
              {formatTypography(tag)}
            </motion.div>
          ))}
        </div>
      </Link>

      <Link
        href={project.href}
        className="project-info-trigger relative flex w-full max-sm:flex-col max-sm:gap-[2.5vw] justify-between text-left"
      >
        {/* Left Side: Pointer dot + Title + Description text */}
        <div className="flex items-start text-left w-full">
          {/* Custom square pointer before the text */}
          <motion.div
            animate={{
              width: showHoverEffects ? 0 : 8,
              marginRight: showHoverEffects ? 0 : "0.73vw",
              opacity: showHoverEffects ? 0 : 1,
              borderWidth: showHoverEffects ? 0 : 1,
            }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="project-pointer my-[1.1vh] h-2 border border-[#434343] max-sm:hidden shrink-0 mt-[1.3vh] overflow-hidden"
          />

          <div className="flex flex-col gap-[0.73vw] max-lg:gap-[1.02vw] max-sm:gap-[3.48vw] text-left w-full">
            {/* Title reveal */}
            <h3 className="font-headline text-[clamp(1.5rem,1.9vw,3rem)] font-semibold leading-tight text-[#F2F2F2] text-left no-invert">
              <motion.span
                initial={{ y: "30%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                className="inline-block"
              >
                {formatTypography(project.name)}
              </motion.span>
            </h3>

            {/* Subtitle description reveal */}
            <div className="text-[#8E8E93] font-sans text-[clamp(0.75rem,0.9vw,1rem)] leading-[1.3] max-w-[28vw] max-lg:max-w-[40vw] max-sm:max-w-none text-left">
              <motion.span
                initial={{ y: "20%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
                className="inline-block"
              >
                {formatTypography(project.text)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Right Side: Hover arrow & "Смотреть проект" text reveal */}
        <div className="relative self-start shrink-0 mt-[1vh] max-sm:hidden select-none">
          <div className="flex items-center py-[0.39vh] gap-1.5 justify-end">
            {/* White scale-in block with rotating arrow */}
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
            <div className="flex">
              {"Смотреть проект".split("").map((char, idx) => (
                <span key={idx} className="inline-block overflow-hidden">
                  <motion.span
                    initial={{ x: "-110%", opacity: 0 }}
                    animate={{
                      x: showHoverEffects ? 0 : "-110%",
                      opacity: showHoverEffects ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.25, 1, 0.5, 1],
                      delay: showHoverEffects ? idx * 0.02 : 0,
                    }}
                    className="text-[#F2F2F2] font-sans text-[clamp(0.7rem,0.8vw,0.9rem)] font-bold leading-none uppercase inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                </span>
              ))}
            </div>
          </div>
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

  // Chunk cases into arrays of size 5 to repeat the grid layout
  const chunks: CaseItem[][] = [];
  for (let i = 0; i < displayCases.length; i += 5) {
    chunks.push(displayCases.slice(i, i + 5));
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="swiss-grid !gap-y-[6.5vh] pt-[5vh] lg:!hidden">
        {displayCases.map((item) => (
          <ProjectCard
            key={item.href}
            project={item}
            gridClass="col-span-12"
            hoveredProjectId={hoveredProjectId}
            setHoveredProjectId={setHoveredProjectId}
            hasHoverSupport={hasHoverSupport}
          />
        ))}
      </div>

      {/* Desktop Grid (Chunked Rows) */}
      <div className="hidden lg:flex lg:flex-col lg:gap-[13.67vh] pt-[5vh] w-full">
        {chunks.map((chunk, chunkIdx) => (
          <div key={chunkIdx} className="flex flex-col gap-[13.67vh]">
            {/* Row 1: items 0 and 1 */}
            {chunk.slice(0, 2).length > 0 && (
              <div className="swiss-grid">
                {chunk.slice(0, 2).map((item, idx) => (
                  <ProjectCard
                    key={item.href}
                    project={item}
                    gridClass={getGridClass(idx)}
                    hoveredProjectId={hoveredProjectId}
                    setHoveredProjectId={setHoveredProjectId}
                    hasHoverSupport={hasHoverSupport}
                  />
                ))}
              </div>
            )}

            {/* Row 2: item 2 */}
            {chunk.slice(2, 3).length > 0 && (
              <div className="swiss-grid">
                {chunk.slice(2, 3).map((item) => (
                  <ProjectCard
                    key={item.href}
                    project={item}
                    gridClass={getGridClass(2)}
                    hoveredProjectId={hoveredProjectId}
                    setHoveredProjectId={setHoveredProjectId}
                    hasHoverSupport={hasHoverSupport}
                  />
                ))}
              </div>
            )}

            {/* Row 3: items 3 and 4 */}
            {chunk.slice(3, 5).length > 0 && (
              <div className="swiss-grid">
                {chunk.slice(3, 5).map((item, idx) => (
                  <ProjectCard
                    key={item.href}
                    project={item}
                    gridClass={getGridClass(3 + idx)}
                    hoveredProjectId={hoveredProjectId}
                    setHoveredProjectId={setHoveredProjectId}
                    hasHoverSupport={hasHoverSupport}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
