import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
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
  await expect(page.locator("#result-count")).toHaveText("3 results");
});

test("typing is debounced, clearing refreshes, and submit cancels the timer", async ({
  page,
}) => {
  const searches = [];
  page.on("request", (request) => {
    if (request.url().includes("/resources/filter?"))
      searches.push(request.url());
  });
  await page.clock.install();
  await page.locator("#search-general").fill("Al");
  await page.clock.runFor(200);
  await page.locator("#search-general").fill("Alpha");
  await page.clock.runFor(300);
  expect(searches).toHaveLength(0);
  await page.clock.runFor(50);
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Alpha Support",
  ]);
  expect(searches).toHaveLength(1);
  await page.locator("#search-general").fill("");
  await page.clock.runFor(350);
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
  await page.locator("#search-location").fill("Saint Louis");
  await page.clock.runFor(350);
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(2);
  await page.locator("#search-general").fill("Alpha");
  await page.locator("#search-general").press("Enter");
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Alpha Support",
  ]);
  const submitted = searches.length;
  await page.clock.runFor(700);
  expect(searches).toHaveLength(submitted);
});

test("a late response cannot replace a newer search", async ({ page }) => {
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  let received;
  const arrived = new Promise((resolve) => {
    received = resolve;
  });
  await page.route("**/resources/filter?*", async (route) => {
    const response = await route.fetch();
    if (
      new URL(route.request().url()).searchParams.get("keyword") === "Alpha"
    ) {
      received();
      await held;
    }
    await route.fulfill({ response });
  });
  await page.locator("#search-general").fill("Alpha");
  await arrived;
  await page.locator("#search-general").fill("Bravo");
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Bravo Shelter",
  ]);
  const oldResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).searchParams.get("keyword") === "Alpha",
  );
  release();
  await oldResponse;
  await page.waitForTimeout(100);
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Bravo Shelter",
  ]);
});

test("leaving the directory cancels a pending search", async ({ page }) => {
  const searches = [];
  page.on("request", (request) => {
    if (request.url().includes("/resources/filter?"))
      searches.push(request.url());
  });
  await page.clock.install();
  await page.locator("#search-general").fill("Alpha");
  await page.getByRole("link", { name: "People", exact: true }).click();
  await expect(page.locator(".user-directory")).toBeVisible();
  await page.clock.runFor(700);
  expect(searches).toHaveLength(0);
});

test("typing during the initial load shows searching and keeps the first query", async ({
  page,
}) => {
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  let received;
  const arrived = new Promise((resolve) => {
    received = resolve;
  });
  await page.route("**/resources/filter?*", async (route) => {
    const response = await route.fetch();
    if (!new URL(route.request().url()).searchParams.get("keyword")) {
      received();
      await held;
    }
    await route.fulfill({ response });
  });
  await page.reload();
  await arrived;
  await expect(page.locator("#result-count")).toHaveText("Searching…");
  await expect(page.locator(".directory-empty")).toHaveText(
    "Searching resources…",
  );
  await page.locator("#search-general").fill("Alpha");
  await expect(page.locator("#result-count")).toHaveText("Searching…");
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Alpha Support",
  ]);
  await expect(page.locator("#result-count")).toHaveText("1 result");
  const initialResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/resources/filter?") &&
      !new URL(response.url()).searchParams.get("keyword"),
  );
  release();
  await initialResponse;
  await page.waitForTimeout(100);
  await expect(page.locator('[data-cy="card-companyName"]')).toHaveText([
    "Alpha Support",
  ]);
  await page.locator("#search-general").fill("zzzznonexistentzzzz");
  await expect(page.locator("#result-count")).toHaveText("Searching…");
  await expect(page.locator("#result-count")).toHaveText("0 results");
});
for (const width of [390, 1440]) {
  test(`tag browser filters and removes tags at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
    const addTag = page.getByRole("button", { name: "Add tag filter" });
    await addTag.click();
    const picker = page.getByRole("dialog", { name: "Choose a tag" });
    const query = picker.getByRole("textbox", { name: "Find a tag" });
    await expect(query).toBeFocused();
    await expect(picker).toHaveCSS("width", "260px");
    await expect(picker).toHaveCSS("padding", "8px");
    await expect(picker.getByRole("button").first()).toHaveCSS(
      "display",
      "flex",
    );
    await expect(picker.locator(".tag-picker-options")).toHaveCSS(
      "overflow-y",
      "auto",
    );
    await query.fill("hOuS");
    await picker.getByRole("button", { name: "Housing", exact: true }).click();
    await expect(picker).toBeHidden();
    await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(2);
    await addTag.click();
    await expect(query).toHaveValue("");
    await expect(
      picker.getByRole("button", { name: "Housing", exact: true }),
    ).toHaveCount(0);
    await query.fill("no such tag");
    await expect(picker.getByRole("status")).toHaveText("No matching tags.");
    await query.press("Escape");
    await expect(picker).toBeHidden();
    await expect(addTag).toBeFocused();
    await page.getByRole("button", { name: "Remove Housing filter" }).click();
    await expect(page.locator('[data-cy="card-companyName"]')).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
