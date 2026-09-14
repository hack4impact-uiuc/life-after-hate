import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`split workspace filters and details at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await request.post("http://127.0.0.1:4176/__test/reset", {
      data: { role: "ADMIN" },
    });
    const { token } = await response.json();
    await page.context().addCookies([
      {
        name: "lah.sid",
        value: token,
        url: "http://127.0.0.1:4174",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.route("https://api.mapbox.com/**", (route) =>
      route.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
    );
    await page.goto("/");
    await expect(page.locator(".card-title")).toHaveCount(3);
    await page
      .getByRole("textbox", { name: "Search resources", exact: true })
      .fill("Alpha");
    await expect(page.locator(".card-title")).toHaveCount(1);
    await expect(page.locator(".card-title")).toHaveText("Alpha Support");
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await expect(page.locator(".card-title")).toHaveCount(3);
    const typeFilters = page.getByRole("group", { name: "Resource type" });
    await typeFilters
      .getByRole("button", { name: "Groups", exact: true })
      .click();
    await expect(page.locator(".card-title")).toHaveCount(3);
    await typeFilters
      .getByRole("button", { name: "Individuals", exact: true })
      .click();
    await expect(page.locator(".card-title")).toHaveCount(0);
    await expect(
      typeFilters.getByRole("button", { name: "Groups", exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await expect(typeFilters.locator('[aria-pressed="true"]')).toHaveCount(1);
    await typeFilters.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator(".card-title")).toHaveCount(3);
    await page
      .getByRole("button", { name: "Sort map resources: Nearest" })
      .click();
    await page
      .getByRole("menuitemradio", { name: "Name", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Sort map resources: Name" }),
    ).toBeVisible();
    await page.locator(".resource-select").first().focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("complementary", { name: "Resource details" }),
    ).toBeVisible();
    await expect(page.locator(".resource-drawer h2")).toHaveText(
      "Alpha Support",
    );
    await expect
      .poll(() =>
        page
          .locator(".drawer-shell")
          .evaluate((el) =>
            el
              .getAnimations({ subtree: true })
              .every((animation) => animation.playState === "finished"),
          ),
      )
      .toBe(true);
    if (width === 1440) {
      const rail = await page.locator(".results-rail").boundingBox();
      const map = await page.locator(".map-canvas").boundingBox();
      const drawer = await page.locator(".resource-drawer").boundingBox();
      expect(rail.x + rail.width).toBeLessThanOrEqual(map.x + 1);
      expect(map.x + map.width).toBeLessThanOrEqual(drawer.x + 1);
    }
    await page.screenshot({ path: `/tmp/lah-split-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(page.locator(".resource-drawer")).toHaveCount(0);
    await expect(page.locator(".resource-select").first()).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
}
