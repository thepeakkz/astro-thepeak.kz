import { describe, expect, it } from "vitest";
import { targetCases } from "./target-cases";

describe("targetCases", () => {
  it("contains complete data for every generated route", () => {
    for (const [slug, caseData] of Object.entries(targetCases)) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(caseData.title).toBeTruthy();
      expect(caseData.year).toMatch(/^20\d{2}([–-]\d{2,4})?$/);
      expect(caseData.service).toBeTruthy();
      expect(caseData.industry).toBeTruthy();
      expect(caseData.hero_desc).toBeTruthy();
      const data = caseData as { metrics?: readonly unknown[]; contentBlocks: readonly unknown[] };
      if (data.metrics) {
        expect(data.metrics.length).toBeGreaterThanOrEqual(3);
      }
      expect(data.contentBlocks.length).toBeGreaterThan(0);
    }
  });
});
