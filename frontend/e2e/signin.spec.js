import { test, expect } from "@playwright/test";
for (const width of [320, 390, 768, 1440]) {
  test(`sign-in layout and login destination at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/api/users/current", (route) =>
      route.fulfill({ status: 401, json: { success: false } }),
    );
    await page.goto("/login");
    const link = page.getByRole("link", { name: "Continue with Google" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/api/auth/login");
    await expect(
      page.getByRole("heading", { name: "Sign in", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const box = await link.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(
      page.getByText("Access the resource map.", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText(/hours of inactivity|app locks after/i),
    ).toHaveCount(0);
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`pending approval and real session logout at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const reset = await request.post("http://127.0.0.1:4176/__test/reset", {
      data: { role: "PENDING" },
    });
    expect(reset.ok()).toBeTruthy();
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
    await page.goto("/directory");
    await expect(
      page.getByRole("heading", { name: "Request received" }),
    ).toBeVisible();
    await expect(
      page.getByText("pending@example.com", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText("pending");
    await expect(page.locator("[data-cy=nav-links]")).toHaveCount(0);
    await expect(
      page.locator("[data-cy=card-companyName], #deckgl-overlay"),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        /Access is granted person by person|on purpose|program administrator reviews each request/i,
      ),
    ).toHaveCount(0);
    await expect(
      page.locator(
        ".sign-in-brand h2, .sign-in-brand p, .sign-in-brand .sign-in-accent",
      ),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const button = page.getByRole("button", { name: "Sign out", exact: true });
    const box = await button.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.height).toBeGreaterThanOrEqual(44);
    const privateData = await request.get(
      "http://127.0.0.1:4176/api/resources",
      {
        headers: { Cookie: `lah.sid=${token}` },
      },
    );
    expect(privateData.status()).toBe(403);
    const logoutResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/auth/logout") &&
        response.request().method() === "POST",
    );
    await button.click();
    expect((await logoutResponse).ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("link", { name: "Continue with Google" }),
    ).toBeVisible();
    // Replay the old cookie to prove server revocation, beyond the UI redirect.
    const replay = await request.get(
      "http://127.0.0.1:4176/api/users/current",
      {
        headers: { Cookie: `lah.sid=${token}` },
      },
    );
    expect(replay.status()).toBe(401);
  });
}
