import { test, expect } from "@playwright/test";
async function fits(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}
for (const width of [320, 390, 768, 1280]) {
  test(`responsive workflows at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 });
    const reset = await request.post("http://127.0.0.1:4176/__test/reset", {
      data: { role: "ADMIN" },
    });
    const { token } = await reset.json();
    await page.context().addCookies([
      {
        name: "lah.sid",
        value: token,
        url: "http://127.0.0.1:4174",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.route("https://api.mapbox.com/**", (r) =>
      r.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
    );
    await page.goto("/directory");
    await page.locator("#search-button").click();
    await expect(
      page.locator('[data-cy="card-companyName"]').first(),
    ).toBeVisible();
    await fits(page);
    if (width < 768) {
      await expect(
        page.locator('[data-cy="card-address"]').first(),
      ).toBeVisible();
      expect(
        await page
          .locator("#search-general")
          .evaluate((el) => getComputedStyle(el).fontSize),
      ).toBe("16px");
    }
    if (width < 768) {
      await page
        .getByRole("combobox", { name: "Sort resources" })
        .selectOption("RESOURCE NAME");
      await page.getByRole("button", { name: "Change sort order" }).click();
      await expect(
        page.locator("[data-cy=card-companyName]").first(),
      ).toHaveText("Charlie Supplies");
    }
    if (width === 390)
      await page.screenshot({
        animations: "disabled",
        path: "/tmp/lah-mobile-directory.png",
        fullPage: true,
      });
    if (width < 768)
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page.locator("#add-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".modal")).toHaveClass(/show/);
    const dialog = await page.locator(".modal-content").boundingBox();
    expect(dialog.x).toBeGreaterThanOrEqual(0);
    expect(dialog.x + dialog.width).toBeLessThanOrEqual(width + 1);
    expect(dialog.y + dialog.height).toBeLessThanOrEqual(845);
    if (width === 390)
      await page.screenshot({
        animations: "disabled",
        path: "/tmp/lah-mobile-form.png",
      });
    await page.locator("#submit-form-button").scrollIntoViewIfNeeded();
    await expect(page.locator("#submit-form-button")).toBeInViewport();
    await page.getByRole("button", { name: "Close dialog" }).click();
    if (width < 768) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await expect(
        page.getByRole("button", { name: "Toggle navigation" }),
      ).toHaveAttribute("aria-expanded", "true");
    }
    await page.getByRole("link", { name: "People" }).click();
    await expect(page.locator(".user-name").first()).toBeVisible();
    if (width < 768) {
      await expect(
        page.getByRole("button", { name: "Toggle navigation" }),
      ).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#main-navigation")).toBeHidden();
    }
    await fits(page);
    if (width === 390)
      await page.screenshot({
        animations: "disabled",
        path: "/tmp/lah-mobile-users.png",
        fullPage: true,
      });
    await page.locator(".user-directory .card-wrapper").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();
    await page.goto("/");
    await page.locator("#map-keyword-input").fill("Alpha");
    await page.locator(".submitSearch").click();
    await expect(page.locator(".card-title").first()).toBeVisible();
    await fits(page);
    const map = await page.locator(".map-canvas").boundingBox();
    expect(map.width).toBeLessThanOrEqual(width);
    expect(map.height).toBeGreaterThan(200);
    if (width < 768) {
      const search = await page.locator(".search-content").boundingBox();
      expect(map.y).toBeGreaterThanOrEqual(search.y + search.height);
    }
    if (width === 390)
      await page.screenshot({
        animations: "disabled",
        path: "/tmp/lah-mobile-map.png",
        fullPage: true,
      });
  });
}
