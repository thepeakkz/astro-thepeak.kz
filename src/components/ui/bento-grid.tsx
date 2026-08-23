import { ReactNode, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[280px] grid-flow-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
        className
      )}
    >
      {children}
    </div>
  );
};

// Inner visual content of the card (no grid-span classes here)
function CardInner({
  background,
  logo,
  type,
  text,
  transitionDuration,
}: {
  background: ReactNode;
  logo: ReactNode;
  type: string;
  text: string;
  transitionDuration: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      className="no-invert group relative w-full h-full select-none cursor-none flex flex-col"
      transition={{ duration: transitionDuration, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top row - Name on left, Services/Type on right */}
      <div className="no-invert w-full flex justify-between items-center pb-[5px] shrink-0 pointer-events-none" style={{ mixBlendMode: "normal" }}>
        <div className="select-none" style={{ color: "inherit" }}>
          {logo}
        </div>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wide select-none" style={{ color: "inherit", opacity: 0.6 }}>
          {type}
        </span>
      </div>

      {/* Card visual body (middle) */}
      <motion.div
        className="relative w-full flex-1 overflow-hidden bg-black rounded-none isolate"
      >
        {/* Background container */}
        <div className="absolute inset-0">
          {background}
        </div>
      </motion.div>

      {/* Bottom row - Description */}
      <div className="w-full pt-[5px] shrink-0 pointer-events-none">
        <p className="no-invert font-sans font-normal text-[13px] leading-relaxed select-none" style={{ color: "inherit", mixBlendMode: "normal" }}>
          {text}
        </p>
      </div>

      {/* Floating tooltip cursor "Перейти" */}
      {isHovered && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-[100] font-sans text-xs font-bold uppercase tracking-[0.24em] text-white bg-black/80 backdrop-blur-xs px-3 py-1.5 border border-white/20 will-change-transform"
          style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)` }}
        >
          Перейти
        </div>
      )}
    </motion.div>
  );
}

export const BentoCard = ({
  className,
  background,
  logo,
  type,
  text,
  href,
  transitionDuration = 0.2,
}: {
  className?: string;
  background: ReactNode;
  logo: ReactNode;
  type: string;
  text: string;
  href?: string;
  tiltFactor?: number;
  perspective?: number;
  transitionDuration?: number;
  hoverScale?: number;
  glareEffect?: boolean;
  glareIntensity?: number;
  glareSize?: number;
}) => {
  const inner = (
    <CardInner
      background={background}
      logo={logo}
      type={type}
      text={text}
      transitionDuration={transitionDuration}
    />
  );

  if (href) {
    // className with col-span/row-span MUST be on the direct grid child (Link → <a>)
    return (
      <Link href={href} className={cn("flex flex-col w-full h-full", className)}>
        {inner}
      </Link>
    );
  }

  // No href: wrap in a div so className grid spans apply to the direct grid child
  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {inner}
    </div>
  );
};
