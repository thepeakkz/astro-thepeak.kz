"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PreloaderProps {
  progress: number;
  onComplete?: () => void;
}

export default function Preloader({ progress, onComplete }: PreloaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Smooth out progress counter ticks
  useEffect(() => {
    // If we've completed preloading, immediately skip to 100 or animate fast
    if (progress === 100) {
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDone(true);
            return 100;
          }
          return prev + 1;
        });
      }, 5);
      return () => clearInterval(interval);
    }

    // Otherwise, smoothly catch up to the current progress
    const diff = progress - displayProgress;
    if (diff > 0) {
      const step = Math.ceil(diff / 5);
      const timer = setTimeout(() => {
        setDisplayProgress((prev) => Math.min(prev + step, 99));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  // Once progress reaches 100% and animation is done, trigger onComplete after a premium delay
  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 800); // 800ms hold at 100% for a premium, satisfying feel
      return () => clearTimeout(timer);
    }
  }, [isDone, onComplete]);

  const formattedProgress = String(displayProgress).padStart(2, "0");

  return (
    <motion.div
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{
        clipPath: "inset(0% 0% 100% 0%)",
        transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
      }}
      className="fixed inset-0 z-[99999] flex flex-col justify-between p-[var(--page-margin)] select-none pointer-events-auto"
      style={{
        background:
          "radial-gradient(circle at center, rgba(253, 75, 50, 0.09) 0%, rgba(0, 0, 0, 0) 70%), #050505",
      }}
    >
      {/* Subtle Background 12-Column Grid Lines for Swiss Agency Style */}
      <div className="absolute inset-0 grid grid-cols-12 gap-[var(--grid-gap)] px-[var(--page-margin)] pointer-events-none opacity-[0.03]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full border-r border-white" />
        ))}
      </div>

      {/* Top Header Row */}
      <div className="w-full flex justify-between items-center z-10 font-sans text-[10px] sm:text-xs tracking-widest text-[#71717a]">
        <span>АГЕНТСТВО THE&nbsp;PEAK</span>
        <span>КРЕАТИВНЫЙ DIGITAL-ПРОДАКШН</span>
      </div>

      {/* Center Logo & Shimmer Wave */}
      <div className="flex flex-col items-center justify-center flex-grow z-10 gap-6">
        {/* PEAK Brand SVG Logo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 68 20"
            className={`w-[8rem] sm:w-[12rem] h-auto transition-colors duration-500 ${
              displayProgress === 100 ? "fill-[#FD4B32]" : "fill-white"
            }`}
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
        </motion.div>
      </div>

      {/* Bottom Footer Row */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 z-10">
        {/* Company and Copyright Info */}
        <div className="font-sans text-[10px] sm:text-xs tracking-widest text-[#71717a] flex flex-col gap-1 text-left">
          <span>АЛМАТЫ / АСТАНА</span>
          <span>© {new Date().getFullYear()} THE&nbsp;PEAK. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</span>
        </div>

        {/* Real Progress Counter */}
        <div className="font-sans text-[10px] sm:text-xs tracking-widest text-[#71717a] flex items-end gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <span className="mb-[6px] sm:mb-[8px]">ПРОГРЕСС ЗАГРУЗКИ</span>
          <span className="text-white text-5xl sm:text-6xl font-medium tracking-tighter min-w-[3.5ch] text-right font-sans tabular-nums leading-none">
            {formattedProgress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
