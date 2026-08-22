import React from "react";

interface HeroScrollAnimationProps {
  cover: React.ReactNode;
  second: React.ReactNode;
}

const HeroScrollAnimation = React.forwardRef<
  HTMLDivElement,
  HeroScrollAnimationProps
>(({ cover, second }, forwardedRef) => {
  return (
    <div
      ref={forwardedRef}
      className="relative isolate col-span-12 w-full bg-black before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-black before:content-['']"
    >
      <div data-hero-scroll-section="cover" className="relative z-0">
        {cover}
      </div>
      <div data-hero-scroll-section="second" className="relative z-10">
        {second}
      </div>
    </div>
  );
});

HeroScrollAnimation.displayName = "HeroScrollAnimation";

export default HeroScrollAnimation;
