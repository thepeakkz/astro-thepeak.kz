<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Russian Typography Guidelines (Non-breaking Spaces)

To ensure high-quality, professional, and visually premium layout, follow these guidelines for all Russian text on the website:

1. **Prepositions, Conjunctions, and Concluding Particles**: Never let single-letter or short multi-letter prepositions, conjunctions, or particles (e.g., "в", "во", "с", "со", "и", "а", "но", "или", "у", "к", "ко", "о", "об", "за", "под", "над", "из", "до", "для", "без", "при", "про", "через", "как", "что", "где", "там", "бы", "ли", "же", "не", "ни", "он", "мы", "вы", "ты", "я", "их", "ее", "его", "от", "по", "так") hang at the end of lines.
2. **Implementation**:
   - In static TSX text or strings, use non-breaking spaces (represented as `\u00a0` or `{"\u00a0"}`) instead of regular spaces after these short words to bind them to the next word.
   - For dynamic text or data arrays, wrap them in the `formatTypography` helper function from `@/utils/typography` (e.g., `formatTypography(someString)`).
3. **Double check**: Always make sure the text wraps properly on all viewport widths (especially mobile) without leaving orphan words or hanging particles.

# Case Media Gallery Rules

For every case media gallery, keep the responsive grid consistent:

1. Large desktop screens: 5 media columns.
2. Laptop screens: 4 media columns.
3. Tablet screens: 3 media columns.
4. Mobile screens: 2 media columns.
5. Clicking a case video must open it fullscreen immediately.

# Client Logo Showcase Rules

When displaying client logos on service/details pages:
1. Render logos in their original, color formats (do not force grayscale/opacity unless requested).
2. Display them in their original aspect ratios with an identical height (using `h-[height] w-auto object-contain`).
3. If requested, implement a seamless infinite marquee/ticker (moving `-50%` using `marquee-scroll-horizontal` animation).
4. Do not wrap them in rounded circles/cards unless specifically requested.

