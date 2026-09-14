import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`resource editor layout and type switching at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const result = await request.post("http://127.0.0.1:4176/__test/reset", {
      data: { role: "ADMIN" },
    });
    const { token } = await result.json();
    await page
      .context()
      .addCookies([
        {
          name: "lah.sid",
          value: token,
          url: "http://127.0.0.1:4174",
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
    await page.goto("/directory");
    if (width < 768) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
    }
    await page.locator("#add-button").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Individual", exact: true }),
    ).toBeChecked();
    await page.locator('[data-cy="modal-contactName"]').fill("Editor demo");
    await page.getByRole("radio", { name: "Group", exact: true }).check();
    await expect(page.locator('[data-cy="modal-contactName"]')).toHaveValue(
      "Editor demo",
    );
    await expect(page.locator('[data-cy="modal-companyName"]')).toBeVisible();
    await page.getByRole("radio", { name: "Individual", exact: true }).check();
    await expect(page.locator('[data-cy="modal-skills"]')).toBeVisible();
    await expect(page.locator("#submit-form-button")).toBeInViewport();
    const bounds = await page.locator(".modal-content").boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(901);
    await expect(dialog).toHaveCSS("opacity", "1");
    await page.screenshot({ path: `/tmp/lah-resource-editor-${width}.png` });
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
  });
}
