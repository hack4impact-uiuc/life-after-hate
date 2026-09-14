import { test, expect } from "@playwright/test";
async function login(page, request, role = "VOLUNTEER") {
  const response = await request.post("http://127.0.0.1:4176/__test/reset", {
    data: { role },
  });
  const { token } = await response.json();
  if (role)
    await page
      .context()
      .addCookies([
        { name: "lah.sid", value: token, url: "http://127.0.0.1:4174" },
      ]);
}
test("save, share, reopen, rename, print, remove and delete a shortlist", async ({
  page,
  request,
}) => {
  await login(page, request);
  await page.goto("/directory");
  await page
    .locator('[data-cy="card-companyName"]')
    .filter({ hasText: "Alpha Support" })
    .click();
  await page.getByRole("button", { name: "Add to shortlist" }).click();
  await page.getByLabel("List name", { exact: true }).fill("Chicago options");
  await page
    .getByRole("button", { name: "Save resource", exact: true })
    .click();
  await page.getByRole("link", { name: "Open shortlist" }).click();
  await expect(
    page.getByRole("heading", { name: "Chicago options" }),
  ).toBeVisible();
  const sharedURL = page.url();
  await page.reload();
  await expect(page.getByRole("link", { name: "Alpha Support" })).toBeVisible();
  await page.getByRole("button", { name: "Copy shortlist link" }).click();
  await expect(page.getByText(/LAH sign-in required/)).toBeVisible();
  await page.getByText("Manage shortlist").click();
  await page.getByLabel("List name", { exact: true }).fill("Updated options");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(
    page.getByRole("heading", { name: "Updated options" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview handout" }).click();
  await expect(page.locator(".handout")).toContainText("contact@example.com");
  await expect(page.locator(".handout")).not.toContainText(
    "Synthetic private notes",
  );
  await expect(page.locator(".handout")).not.toContainText("Updated options");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".shortlist-controls")).toBeHidden();
  await expect(page.locator(".lah-navbar-container")).toBeHidden();
  await expect(page.locator(".handout")).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.screenshot({ path: "/tmp/lah-handout.png", fullPage: true });
  await page.getByRole("button", { name: "Close handout preview" }).click();
  await page.getByRole("link", { name: "Alpha Support" }).click();
  await expect(page).toHaveURL(/\/resources\/6{24}$/);
  await expect(
    page.getByRole("heading", { name: "Alpha Support" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Copy resource link" }).click();
  await expect(page.getByText(/LAH sign-in required/)).toBeVisible();
  await page.getByRole("button", { name: "Add to shortlist" }).click();
  await page
    .getByRole("combobox", { name: "Shortlist", exact: true })
    .selectOption({ label: "Updated options" });
  await page
    .getByRole("button", { name: "Save resource", exact: true })
    .click();
  await page.getByRole("link", { name: "Open shortlist" }).click();
  await expect(page.locator(".shortlist-resources article")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/lah-shortlist-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Remove Alpha Support" }).click();
  await expect(page.getByText(/This shortlist is empty/)).toBeVisible();
  await page.getByText("Manage shortlist").click();
  await page
    .getByRole("button", { name: "Delete shortlist", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page).toHaveURL(/\/shortlists$/);
  await page.goto(sharedURL);
  await expect(page.getByRole("alert")).toContainText(
    "Could not load shortlists",
  );
});
test("resource link remembers the destination through sign-in", async ({
  page,
  request,
}) => {
  await login(page, request, null);
  const path = `/resources/${"6".repeat(24)}`;
  await page.goto(path);
  await expect(page).toHaveURL(/\/login$/);
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ contentType: "text/html", body: "Sign-in provider" }),
  );
  await page.getByRole("link", { name: "Continue with Google" }).click();
  await login(page, request);
  await page.goto("/");
  await expect(page).toHaveURL(new RegExp(path + "$"));
  await expect(
    page.getByRole("heading", { name: "Alpha Support" }),
  ).toBeVisible();
});

test("admins can edit a resource opened directly from a shared link", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN");
  await page.goto(`/resources/${"6".repeat(24)}`);
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.locator('[data-cy="modal-companyName"]')).toHaveValue(
    "Alpha Support",
  );
  await page.locator('[data-cy="modal-companyName"]').fill("Updated support");
  await page.locator("#submit-form-button").click();
  await expect(page.locator(".resource-drawer h2")).toHaveText(
    "Updated support",
  );
  await page.reload();
  await expect(page.locator(".resource-drawer h2")).toHaveText(
    "Updated support",
  );
});
