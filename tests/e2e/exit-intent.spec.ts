import { expect, test } from "@playwright/test";

test("exit-intent popup opens once per session across the site", async ({ isMobile, page }) => {
  test.skip(isMobile, "Exit intent requires a device with hover and a fine pointer.");

  await page.goto("/privacy");
  await expect(page.locator("html")).toHaveAttribute("data-lead-popup-exit-intent-ready", "true");

  await page.mouse.move(500, 300);
  await page.mouse.move(500, -10);

  const dialog = page.getByRole("dialog", { name: "Получите бесплатную консультацию" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.reload();
  await page.waitForTimeout(1_600);
  await page.mouse.move(500, 300);
  await page.mouse.move(500, -10);

  await expect(dialog).toHaveCount(0);
});

test("popup also opens after 40 seconds", async ({ page }) => {
  await page.clock.install();
  await page.goto("/privacy");
  await expect(page.locator("html")).toHaveAttribute("data-lead-popup-timer-ready", "true");

  await page.clock.fastForward(40_000);

  await expect(
    page.getByRole("dialog", { name: "Получите бесплатную консультацию" }),
  ).toBeVisible();
});
