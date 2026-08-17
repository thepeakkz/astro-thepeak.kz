"use client";

import Image from "next/image";

function ClientLogo({ ext, id }: { ext: string; id: number }) {
  return (
    <div className="relative h-[44px] sm:h-[56px] w-[80%] pointer-events-none">
      <Image
        src={`https://media.thepeak.kz/logos/clot-${id}.${ext}`}
        alt={`Client Logo ${id}`}
        fill
        sizes="176px"
        quality={75}
        className="object-contain"
        loading="lazy"
        decoding="async"
        onError={(event) => {
          const fallback = new URL(`/logo/clot-${id}.${ext}`, window.location.origin).href;
          if (event.currentTarget.src === fallback) return;
          event.currentTarget.srcset = "";
          event.currentTarget.src = fallback;
        }}
      />
    </div>
  );
}

export default function ClientLogosBlock() {
  const baseRow1 = [
    60, 12, 2, 11, 3, 1, 10, 5, 18, 13, 8, 6, 4, 7, 17, 19, 15, 16, 14, 9,
  ];
  const baseRow2 = [
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  ];
  const baseRow3 = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
  const baseRow4 = [53, 54, 55, 56, 57, 58, 59, 60];

  function createInfiniteItems(baseArray: number[]) {
    let repeated = [...baseArray];
    while (repeated.length < 18) {
      repeated = [...repeated, ...baseArray];
    }
    const mapped = repeated.map((id) => ({
      id,
      ext: id === 34 ? "png" : "webp",
    }));
    // Two identical groups for seamless -50% marquee
    return [...mapped, ...mapped];
  }

  const row1 = createInfiniteItems(baseRow1);
  const row2 = createInfiniteItems(baseRow2);
  const row3 = createInfiniteItems(baseRow3);
  const row4 = createInfiniteItems(baseRow4);

  return (
    <section
      className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] overflow-hidden pt-0 pb-0 bg-white select-none"
      id="client-logos"
    >
      {/* CSS for custom reverse marquee animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-reverse {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 60s linear infinite;
        }
      `,
        }}
      />

      {/* 4 Rows of Carousels */}
      <div className="flex flex-col w-full">
        {/* Row 1 (starts with 12, scrolls left) */}
        <div
          className="relative w-full h-[60px] sm:h-[80px] md:h-[84px] overflow-hidden border-b border-brand-gray/15"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div
            className="flex items-center w-max h-full"
            style={{
              animation: "marquee-scroll-horizontal 240s linear infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {row1.map((item, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <ClientLogo id={item.id} ext={item.ext} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 (starts with 20, scrolls right) */}
        <div
          className="relative w-full h-[60px] sm:h-[80px] md:h-[84px] overflow-hidden border-b border-brand-gray/15"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div
            className="flex items-center w-max h-full animate-marquee-reverse"
            style={{
              animationDuration: "200s",
              animationTimingFunction: "linear",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {row2.map((item, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <ClientLogo id={item.id} ext={item.ext} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 (starts with 38, scrolls left) — hidden on mobile */}
        <div
          className="relative hidden md:block w-full h-[84px] overflow-hidden border-b border-brand-gray/15"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div
            className="flex items-center w-max h-full"
            style={{
              animation: "marquee-scroll-horizontal 280s linear infinite",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {row3.map((item, index) => (
              <div
                key={`row3-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <ClientLogo id={item.id} ext={item.ext} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 (starts with 53, scrolls right) — hidden on mobile */}
        <div
          className="relative hidden md:block w-full h-[84px] overflow-hidden border-b border-brand-gray/15"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <div
            className="flex items-center w-max h-full animate-marquee-reverse"
            style={{
              animationDuration: "220s",
              animationTimingFunction: "linear",
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {row4.map((item, index) => (
              <div
                key={`row4-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <ClientLogo id={item.id} ext={item.ext} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
