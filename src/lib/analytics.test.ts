import { describe, expect, it } from "vitest";
import { isAnalyticsEventName, isUuid, trafficChannel } from "./analytics";

describe("first-party analytics helpers", () => {
  it("validates event identifiers and supported names", () => {
    expect(isUuid("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isAnalyticsEventName("page_view")).toBe(true);
    expect(isAnalyticsEventName("lead_submitted")).toBe(false);
  });

  it("groups common acquisition sources into real traffic channels", () => {
    expect(trafficChannel("Google Ads", "cpc")).toBe("Платная реклама (Paid Ads)");
    expect(trafficChannel("instagram", "social")).toBe("Соцсети и мессенджеры");
    expect(trafficChannel("google.com", "organic")).toBe("Поисковые системы (SEO)");
    expect(trafficChannel("Прямой заход", "")).toBe("Прямые визиты (Direct)");
  });
});
