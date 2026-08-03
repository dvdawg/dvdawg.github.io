import { expect, test } from "@playwright/test";

test("keeps the landing layout toggle working after returning from another page", async ({
  page,
}) => {
  await page.goto("/");

  const heroView = page.locator("#hero-view");
  const sidebarView = page.locator("#sidebar-view");

  await heroView.locator("[data-layout-toggle]").click();
  await expect(sidebarView).toBeVisible();

  await sidebarView.locator('a[href="/blog/"]').click();
  await expect(page).toHaveURL(/\/blog\/$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(sidebarView).toBeVisible();

  await sidebarView.locator("[data-layout-toggle]").click();
  await expect(heroView).toBeVisible();
  await expect(sidebarView).toBeHidden();
});
