"use client";

import { ElementType, ComponentType, CSSProperties, ReactNode } from "react";
import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextShimmerWaveProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  transition?: Transition;
}

const motionMap: Record<string, ElementType> = {
  p: motion.p,
  span: motion.span,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  section: motion.section,
  article: motion.article,
  main: motion.main,
  header: motion.header,
  footer: motion.footer,
  aside: motion.aside,
  nav: motion.nav,
};

export function TextShimmerWave({
  children,
  as: Component = "p",
  className,
  duration = 1.2,
  zDistance = 10,
  xDistance = 2,
  yDistance = -2,
  spread = 1,
  scaleDistance = 1.1,
  rotateYDistance = 10,
  transition,
}: TextShimmerWaveProps) {
  const MotionComponent = (typeof Component === "string"
    ? (motionMap[Component] || (motion as unknown as Record<string, ElementType>)[Component] || motion.p)
    : motion.p) as ComponentType<{
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
    }>;

  return (
    <MotionComponent
      className={cn(
        "relative inline-block [perspective:500px]",
        "[--base-color:#71717a] [--base-gradient-color:#ffffff]",
        className
      )}
      style={{ color: "var(--base-color)" }}
    >
      {children.split("").map((char, i) => {
        const delay = (i * duration * (1 / spread)) / children.length;

        return (
          <motion.span
            key={i}
            className={cn(
              "inline-block whitespace-pre [transform-style:preserve-3d]"
            )}
            initial={{
              translateZ: 0,
              scale: 1,
              rotateY: 0,
              color: "var(--base-color)",
            }}
            animate={{
              translateZ: [0, zDistance, 0],
              translateX: [0, xDistance, 0],
              translateY: [0, yDistance, 0],
              scale: [1, scaleDistance, 1],
              rotateY: [0, rotateYDistance, 0],
              color: [
                "var(--base-color)",
                "var(--base-gradient-color)",
                "var(--base-color)",
              ],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatDelay: (children.length * 0.05) / spread,
              delay,
              ease: "easeInOut",
              ...transition,
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </MotionComponent>
  );
}
