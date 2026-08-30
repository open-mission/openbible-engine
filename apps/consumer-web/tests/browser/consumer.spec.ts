import { expect, test } from "./fixtures";

test("baixa ARA da origem remota, reabre e lê offline", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Sua biblioteca bíblica" })).toBeVisible();
  await expect(page.getByText("ARA", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
  const araCard = page.locator("section").filter({ hasText: "ARA" });
  if (await araCard.getByText("Instalada", { exact: true }).count() === 0) {
    await araCard.getByRole("button", { name: "Instalar" }).click();
  }
  await expect(page.getByText("Instalada", { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: "Leitura" }).click();
  await expect(page.getByRole("heading", { name: "Gênesis 1", exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("p").filter({ hasText: "No princípio, criou Deus os céus e a terra." }).first()).toBeVisible();

  await page.getByRole("button", { name: "Livro" }).click();
  const bookPicker = page.getByRole("dialog", { name: "Selecionar livro e capítulo" });
  await expect(bookPicker).toHaveAttribute("data-picker-mode", "modal");
  await bookPicker.getByRole("button", { name: "Gênesis", exact: true }).click();
  await bookPicker.getByRole("button", { name: "Capítulo 2", exact: true }).click();
  await expect(page).toHaveURL(/\/ara\/gn\/2$/);
  await expect(page.getByRole("heading", { name: "Gênesis 2", exact: true })).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: "Versão" }).click();
  const versionPicker = page.getByRole("dialog", { name: "Selecionar versão" });
  await expect(versionPicker).toHaveAttribute("data-picker-mode", "modal");
  await versionPicker.getByRole("button", { name: "Fechar selecionar versão" }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Livro" }).click();
  await expect(page.getByRole("dialog", { name: "Selecionar livro e capítulo" })).toHaveAttribute("data-picker-mode", "drawer");
  await page.getByRole("button", { name: "Fechar selecionar livro e capítulo" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Gênesis 2", exact: true })).toBeVisible({ timeout: 30_000 });
  await page.evaluate(async () => {
    if ("serviceWorker" in navigator) await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 30_000 });
  if (test.info().project.name === "webkit") {
    await page.route("**/*", (route) => route.abort());
  } else {
    await page.context().setOffline(true);
  }
  await page.reload();
  await expect(page.getByRole("heading", { name: "Gênesis 2", exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("article p").first()).toBeVisible();
});

test("publica manifest instalável", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json() as { display: string; start_url: string };
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
});

// SPECSFY: US-002 FR-004 NFR-002 NFR-003 AC-012 AC-013 AC-014
test("mantém somente as rotas públicas canônicas", async ({ request }) => {
  for (const path of ["/ler/", "/biblioteca", "/busca"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  for (const path of ["/library", "/search"]) {
    expect((await request.get(path)).ok()).toBeTruthy();
  }
});
