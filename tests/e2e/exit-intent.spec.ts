import { expect, test } from "@playwright/test";

const testOrigin = process.env.EXIT_INTENT_TEST_URL ?? "";

test("exit-intent popup opens once per session across the site", async ({ page }) => {
  await page.goto(`${testOrigin}/privacy`);
  await page.waitForTimeout(1_600);

  await page.mouse.move(500, 300);
  await page.mouse.move(500, -10);

  const dialog = page.getByRole("dialog", { name: "Получите бесплатную консультацию" });
  await expect(dialog).toBeVisible();

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
  await page.goto(`${testOrigin}/privacy`);

  await page.clock.fastForward(40_000);

  await expect(
    page.getByRole("dialog", { name: "Получите бесплатную консультацию" }),
  ).toBeVisible();
});
