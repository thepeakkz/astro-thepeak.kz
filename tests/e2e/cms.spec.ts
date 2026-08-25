import { expect, test } from "@playwright/test";

test("admin route is protected and shows a regular login form", async ({ page }) => {
  const response = await page.goto("/admin");
  if (response?.status() === 404) {
    test.skip(true, "Admin routes are proxied via Vercel rewrites to legacy-admin");
    return;
  }

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Вход в CMS" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Пароль")).toBeVisible();
});

test("media signing endpoint rejects anonymous requests", async ({ request }) => {
  const response = await request.post("/api/admin/media/sign", {
    data: { fileName: "test.webp", contentType: "image/webp", size: 100 },
  });

  if (response.status() === 404) {
    test.skip(true, "Admin API is proxied via Vercel rewrites to legacy-admin");
    return;
  }

  expect(response.status()).toBe(401);
});


