import { test, expect } from "@playwright/test";

async function signIn(page, request) {
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
}

test("workspace navigation persists across routes and indicator follows the active tab", async ({
  page,
  request,
}) => {
  await signIn(page, request);
  await page.goto("/directory");
  const nav = page.locator(".lah-navbar-container");
  await expect(nav).toBeVisible();
  await nav.evaluate((element) => {
    element.dataset.persistenceCheck = "original";
  });
  await page.getByRole("link", { name: "People", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "People", exact: true }),
  ).toBeVisible();
  await expect(nav).toHaveAttribute("data-persistence-check", "original");
  const active = page.getByRole("link", { name: "People", exact: true });
  await expect(active).toHaveAttribute("aria-current", "page");
  await expect
    .poll(async () => {
      const target = await active.boundingBox();
      const indicator = await page
        .locator(".workspace-tab-indicator")
        .boundingBox();
      return (
        Math.abs(target.x - indicator.x) +
        Math.abs(target.width - indicator.width)
      );
    })
    .toBeLessThan(2);
});

test("reduced motion keeps navigation immediate and mobile menu remains usable", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, request);
  await page.goto("/directory");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await expect(
    page.getByRole("link", { name: "People", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "People", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "People", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#main-navigation")).toBeHidden();
  expect(
    await page
      .locator("html")
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--motion-medium").trim(),
      ),
  ).toBe("0ms");
});

test("returning while a lazy route is loading restores directory results", async ({
  page,
  request,
}) => {
  await signIn(page, request);
  await page.goto("/directory");
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let delayed = false;
  await page.route("**/assets/*.js", async (route) => {
    delayed = true;
    await gate;
    await route.continue();
  });
  try {
    await page.getByRole("link", { name: "Map", exact: true }).click();
    await expect.poll(() => delayed).toBe(true);
    await page.getByRole("link", { name: "Directory", exact: true }).click();
    await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});
