import { expect, test } from "@playwright/test";

test("baixa ARA da origem remota, lê e busca offline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sua biblioteca bíblica" })).toBeVisible();
  await expect(page.getByText("ARA", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  const araCard = page.locator("section").filter({ hasText: "ARA" });
  if (await araCard.getByText("Instalada", { exact: true }).count() === 0) {
    await araCard.getByRole("button", { name: "Instalar" }).click();
  }
  await expect(page.getByText("Instalada", { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: "Ler" }).click();
  await expect(page.getByRole("heading", { name: "Gênesis 1", exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("p").filter({ hasText: "No princípio, criou Deus os céus e a terra." }).first()).toBeVisible();
  await page.getByRole("link", { name: "Buscar versículos" }).click();
  await page.getByLabel("Buscar versículos").fill("princípio");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("ARA", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("p").filter({ hasText: "No princípio, criou Deus os céus e a terra." }).first()).toBeVisible();
});

test("publica manifest instalável", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json() as { display: string; start_url: string };
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
});
