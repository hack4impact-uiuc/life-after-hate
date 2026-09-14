import { test, expect } from "@playwright/test";
test("browser Back and Forward follow page navigation", async ({
  page,
  request,
}) => {
  const response = await request.post("http://127.0.0.1:4176/__test/reset", {
    data: { role: "ADMIN" },
  });
  const { token } = await response.json();
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
  await page.route("https://api.mapbox.com/**", (r) =>
    r.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
  );
  await page.goto("/");
  await page.getByRole("link", { name: "Directory", exact: true }).click();
  await expect(page).toHaveURL(/\/directory$/);
  await page.getByRole("link", { name: "People", exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/directory$/);
  await expect(page).toHaveTitle("Directory View - Life After Hate");
  await page.goBack();
  await expect(page).toHaveURL("http://127.0.0.1:4174/");
  await expect(page).toHaveTitle("Map View - Life After Hate");
  await page.goForward();
  await expect(page).toHaveURL(/\/directory$/);
});
