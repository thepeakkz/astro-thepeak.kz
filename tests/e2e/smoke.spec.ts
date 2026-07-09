import { expect, test } from "@playwright/test";

test("main routes render without an application error", async ({ page }) => {
  for (const route of ["/", "/cases", "/cases/lukoil"]) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} should respond successfully`).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Application error");
  }
});

test("case videos request fullscreen immediately", async ({ page }) => {

  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = function requestFullscreen() {
      document.documentElement.dataset.fullscreenRequested = "true";
      return Promise.resolve();
    };
  });

  await page.goto("/cases/ark");
  const firstVideo = page.getByTestId("case-gallery-video").first();
  await expect(firstVideo).toBeVisible();

  await firstVideo.click();
  await expect(page.locator("html")).toHaveAttribute("data-fullscreen-requested", "true");
});

test("case gallery uses the required responsive column count", async ({ page }) => {

  await page.goto("/cases/ark");
  const gallery = page.getByTestId("case-gallery-grid");
  await expect(gallery).toBeVisible();

  for (const [width, columns] of [[390, 2], [768, 3], [1280, 4], [1536, 5]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(async () => gallery.evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length,
    )).toBe(columns);
  }
});
