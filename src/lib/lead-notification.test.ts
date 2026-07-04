import { describe, expect, it } from "vitest";
import { formatTelegramLead } from "./lead-notification";
import type { Touchpoint, UtmAttribution } from "./utm";

const googleTouch: Touchpoint = {
  source: "Google Ads",
  params: { utm_campaign: "summer" },
  clickIds: { gclid: "long-technical-id" },
  landingPage: "https://www.thepeak.kz/?gclid=long-technical-id",
  capturedAt: "2026-07-03T18:45:26.000Z",
};

function attribution(lastTouch = googleTouch): UtmAttribution {
  return {
    firstTouch: googleTouch,
    lastTouch,
    deviceType: "Мобильный",
    userPath: ["/"],
  };
}

describe("Telegram lead notification", () => {
  it("renders a compact notification and collapses identical touchpoints", () => {
    const message = formatTelegramLead({
      name: "Хеким",
      phone: "+7 (707) 493-75-31",
      form: "Главная страница (Связаться с нами)",
      comment: "Мне подписчик и лайк нужно",
      attribution: attribution(),
    });

    expect(message).toContain('<a href="https://wa.me/77074937531">+7 (707) 493-75-31</a>');
    expect(message).toContain("📊 Источник: Google Ads");
    expect(message).toContain("• Тип: Мобильный");
    expect(message).toContain("• Время: 2026-07-03 23:45:26");
    expect(message).toContain('<a href="https://www.thepeak.kz/?gclid=long-technical-id">Посадочная страница</a>');
    expect(message).not.toContain("Первый источник");
    expect(message).not.toContain("gclid:");
    expect(message).not.toContain("Путь:");
  });

  it("shows two short blocks when first and last touchpoints differ", () => {
    const message = formatTelegramLead({
      name: "Клиент",
      phone: "+7 700 000 00 00",
      form: "Форма",
      comment: "Комментарий",
      attribution: attribution({
        ...googleTouch,
        source: "instagram",
        landingPage: "https://www.thepeak.kz/cases",
        capturedAt: "2026-07-04T10:00:00.000Z",
      }),
    });

    expect(message).toContain("📊 Первый источник: Google Ads");
    expect(message).toContain("📊 Последний источник: instagram");
    expect(message.match(/Посадочная страница/g)).toHaveLength(2);
  });
});
