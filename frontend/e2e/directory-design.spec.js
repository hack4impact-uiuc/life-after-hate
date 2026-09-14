import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`directory layout and controls at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
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
    await page.goto("/directory");
    await page.locator("#search-button").click();
    await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
    await expect(page.locator(".resource-tags").first()).toBeVisible();
    const comfortable = await page
      .locator(".card-wrapper")
      .first()
      .boundingBox();
    await page.getByRole("button", { name: "Compact", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Compact", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(
        async () =>
          (await page.locator(".card-wrapper").first().boundingBox()).height,
      )
      .toBeLessThan(comfortable.height);
    await page
      .getByRole("button", { name: "Comfortable", exact: true })
      .click();
    if (width < 768) {
      await page
        .getByRole("combobox", { name: "Sort resources" })
        .selectOption("RESOURCE NAME");
    } else {
      await page
        .getByRole("button", { name: "Sort by resource", exact: true })
        .click();
    }
    await expect(
      page.locator('[data-cy="card-companyName"]').first(),
    ).toHaveText("Alpha Support");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    expect((await download).suggestedFilename()).toBe("resources.csv");
    const row = page.locator(".card-wrapper").first();
    const details = page.getByRole("complementary", {
      name: "Resource details",
    });
    await row.click();
    await expect(details).toBeVisible();
    await expect(
      details.getByRole("heading", { name: "Alpha Support" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Close resource details" }).click();
    await expect(details).toHaveCount(0);
    await row.focus();
    await row.press("Enter");
    await expect(details).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(details).toHaveCount(0);
    await page.locator(".edit-button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close dialog" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/lah-directory-${width}.png`,
      fullPage: true,
    });
    await page.locator("#search-general").fill("no-matching-resource");
    await page.locator("#search-button").click();
    await expect(page.locator(".directory-empty")).toContainText(
      "No resources found",
    );
  });
}
