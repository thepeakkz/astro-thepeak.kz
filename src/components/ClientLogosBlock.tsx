"use client";

export default function ClientLogosBlock() {
  const baseRow1 = [
    12, 2, 11, 3, 1, 10, 5, 18, 13, 8, 6, 4, 7, 17, 19, 15, 16, 14, 9,
  ];
  const baseRow2 = [
    20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
  ];
  const baseRow3 = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
  const baseRow4 = [60, 53, 54, 55, 56, 57, 58, 59];

  function createInfiniteItems(baseArray: number[]) {
    const mapped = baseArray.map((id) => ({
      id,
      ext: id === 34 ? "png" : "webp",
    }));
    // Repeat enough times to fill screen width
    return [...mapped, ...mapped, ...mapped, ...mapped, ...mapped, ...mapped];
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
          animation: marquee-reverse 60s ease-in-out infinite;
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
            }}
          >
            {row1.map((item, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <img
                  src={`/logo/clot-${item.id}.${item.ext}`}
                  alt={`Client Logo ${item.id}`}
                  className="h-[44px] sm:h-[56px] md:h-[56px] w-auto max-w-[80%] object-contain pointer-events-none"
                  width={125}
                  height={56}
                />
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
            }}
          >
            {row2.map((item, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <img
                  src={`/logo/clot-${item.id}.${item.ext}`}
                  alt={`Client Logo ${item.id}`}
                  className="h-[44px] sm:h-[56px] md:h-[56px] w-auto max-w-[80%] object-contain pointer-events-none"
                  width={125}
                  height={56}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 (starts with 38, scrolls left) — hidden on mobile */}
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
              animation: "marquee-scroll-horizontal 280s linear infinite",
            }}
          >
            {row3.map((item, index) => (
              <div
                key={`row3-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <img
                  src={`/logo/clot-${item.id}.${item.ext}`}
                  alt={`Client Logo ${item.id}`}
                  className="h-[44px] sm:h-[56px] md:h-[56px] w-auto max-w-[80%] object-contain pointer-events-none"
                  width={125}
                  height={56}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 (starts with 53, scrolls right) — hidden on mobile */}
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
              animationDuration: "220s",
              animationTimingFunction: "linear",
            }}
          >
            {row4.map((item, index) => (
              <div
                key={`row4-${index}`}
                className="flex-shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-full flex items-center justify-center border-r border-brand-gray/15"
              >
                <img
                  src={`/logo/clot-${item.id}.${item.ext}`}
                  alt={`Client Logo ${item.id}`}
                  className="h-[44px] sm:h-[56px] md:h-[56px] w-auto max-w-[80%] object-contain pointer-events-none"
                  width={125}
                  height={56}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
