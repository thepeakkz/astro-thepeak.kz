import { describe, expect, it } from "vitest";
import {
  createTouchpoint,
  getDeviceType,
  parseUtmAttribution,
  serializeUtmAttribution,
  updateAttribution,
} from "./utm";

describe("visitor attribution", () => {
  it("collects all UTM parameters and supported advertising click IDs", () => {
    const touchpoint = createTouchpoint(
      new URLSearchParams("utm_source=instagram&utm_campaign=spring&utm_custom=extra&fbclid=abc123&ref=ignored"),
      "https://thepeak.kz/?utm_source=instagram",
      "",
      "2026-07-03T10:00:00.000Z"
    );

    expect(touchpoint.source).toBe("instagram");
    expect(touchpoint.params).toEqual({
      utm_source: "instagram",
      utm_campaign: "spring",
      utm_custom: "extra",
    });
    expect(touchpoint.clickIds).toEqual({ fbclid: "abc123" });
  });

  it("keeps first-touch data and updates last-touch data and the user path", () => {
    const first = createTouchpoint(new URLSearchParams("gclid=one"), "https://thepeak.kz/", "");
    const initial = updateAttribution(null, first, "Компьютер", "/", true);
    const last = createTouchpoint(new URLSearchParams("utm_source=telegram"), "https://thepeak.kz/services/web", "");
    const updated = updateAttribution(initial, last, "Мобильный", "/services/web", true);

    expect(updated.firstTouch.source).toBe("Google Ads");
    expect(updated.lastTouch.source).toBe("telegram");
    expect(updated.deviceType).toBe("Мобильный");
    expect(updated.userPath).toEqual(["/", "/services/web"]);
    expect(parseUtmAttribution(serializeUtmAttribution(updated))).toEqual(updated);
  });

  it("detects common device types", () => {
    expect(getDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile")).toBe("Мобильный");
    expect(getDeviceType("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)")).toBe("Планшет");
    expect(getDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("Компьютер");
  });
});
