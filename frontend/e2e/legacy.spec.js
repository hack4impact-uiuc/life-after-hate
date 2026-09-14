import { test, expect } from "@playwright/test";
async function login(page, request, role = "ADMIN", path = "/directory") {
  const r = await request.post("http://127.0.0.1:4176/__test/reset", {
    data: { role },
  });
  expect(r.ok()).toBeTruthy();
  const { token } = await r.json();
  if (role)
    await page.context().addCookies([
      {
        name: "lah.sid",
        value: token,
        url: "http://127.0.0.1:4174",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
  // No external tile network dependency; the real map canvas and markers still render.
  await page.route("https://api.mapbox.com/**", (route) =>
    route.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
  );
  await page.goto(path);
}
const field = (page, name) => page.locator(`[data-cy="modal-${name}"]`);
const names = (page) => page.locator('[data-cy="card-companyName"]');
async function search(page, keyword = "") {
  await page.locator("#search-general").fill(keyword);
  await page.locator("#search-button").click();
}
async function mapSearch(page, keyword = "", location = "") {
  await page.locator("#map-keyword-input").fill(keyword);
  await page.locator("#locationInput").fill(location);
  await page.locator(".submitSearch").click();
}
async function closed(page) {
  await expect(page.locator(".modal-title")).toHaveCount(0);
}
for (const role of ["PENDING", "REJECTED", null])
  test(`${role || "anonymous"} direct-route access restrictions`, async ({
    page,
    request,
  }) => {
    await login(page, request, role, "/");
    for (const path of ["/", "/directory", "/users"]) {
      await page.goto(path);
      if (role === "PENDING") {
        await expect(page.locator("[data-cy=pending]")).toBeVisible();
        await expect(page.locator("[data-cy=logo]")).toBeVisible();
      } else await expect(page).toHaveURL(/\/login$/);
      await expect(page.locator("[data-cy=nav-links]")).toHaveCount(0);
      await expect(page.locator("#deckgl-overlay")).toHaveCount(0);
    }
  });
test("volunteer navigation and read-only directory/map modals", async ({
  page,
  request,
}) => {
  await login(page, request, "VOLUNTEER", "/users");
  await expect(page).toHaveURL("http://127.0.0.1:4174/");
  await expect(page.getByText("People", { exact: true })).toHaveCount(0);
  await page.goto("/directory");
  await search(page);
  await expect(names(page)).toHaveCount(3);
  await expect(page.locator(".edit-button")).toHaveCount(0);
  await names(page).first().click();
  await expect(field(page, "companyName")).toBeDisabled();
  await expect(page.locator("#submit-form-button")).toHaveCount(0);
  await page.locator(".close-button").click();
  await page.goto("/");
  await mapSearch(page, "Alpha");
  await page.locator(".card-title").first().click();
  await expect(page.locator("[data-cy=card-resource-edit-btn]")).toHaveCount(0);
  await page
    .locator(".resource-drawer [data-cy=card-resource-view-btn]")
    .click();
  await expect(field(page, "companyName")).toBeDisabled();
});
test("navbar titles, navigation, logo, authenticated login redirect and logout", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN", "/login");
  await expect(page).toHaveURL("http://127.0.0.1:4174/");
  await expect(page).toHaveTitle("Map View - Life After Hate");
  for (const [label, path, title] of [
    ["Directory", "/directory", "Directory View"],
    ["People", "/users", "Account Management"],
    ["Map", "/", "Map View"],
  ]) {
    await page.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL("http://127.0.0.1:4174" + path);
    await expect(page).toHaveTitle(title + " - Life After Hate");
    await expect(
      page.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("button", { name: "New resource", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#logo")).toHaveCSS("width", "32px");
    await expect(page.locator("#logo")).toHaveCSS("height", "32px");
  }
  await page.getByRole("link", { name: "Directory", exact: true }).click();
  await page.locator("#logo").click();
  await expect(page).toHaveURL("http://127.0.0.1:4174/");
  await page.locator(".dropdown-toggle").click();
  await expect(page.locator(".dropdown-header").first()).toContainText(
    "Alex Example",
  );
  await page.locator("#signout-button").click();
  await expect(page).toHaveURL(/\/login$/);
});
test("directory headers, empty search and CSV visibility", async ({
  page,
  request,
}) => {
  await login(page, request);
  await expect(page.locator(".manager-header")).toContainText(
    "Resource Directory",
  );
  await expect(page.locator("#csv-download-btn")).toBeHidden();
  await search(page);
  await expect(names(page)).toHaveCount(3);
  for (const label of [
    "Resource Name",
    "Location",
    "Volunteer Role",
    "Description",
    "Availability",
  ])
    await expect(page.locator(".resource-labels")).toContainText(label);
  await expect(page.locator("#csv-download-btn")).toBeVisible();
  await search(page, "zzzznonexistentzzzz");
  await expect(names(page)).toHaveCount(0);
});
test("required resource fields and resource type-specific inputs", async ({
  page,
  request,
}) => {
  await login(page, request);
  await page.locator("#add-button").click();
  await expect(field(page, "resourceType")).toHaveValue("INDIVIDUAL");
  await expect(field(page, "skills")).toBeVisible();
  await field(page, "resourceType").selectOption("GROUP");
  await expect(field(page, "skills")).toHaveCount(0);
  await expect(field(page, "description")).toBeVisible();
  await field(page, "companyName").fill("Incomplete");
  await page.locator("#submit-form-button").click();
  await expect(field(page, "contactName")).toHaveClass(/invalid/);
  await expect(page.locator(".modal-title")).toBeVisible();
  await field(page, "contactPhone").fill("123-456-7890");
  await page.locator("#submit-form-button").click();
  await expect(field(page, "contactName")).toHaveClass(/invalid/);
  await expect(field(page, "contactPhone")).not.toHaveClass(/invalid/);
});
for (const type of ["GROUP", "INDIVIDUAL", "TANGIBLE"])
  test(`${type} create, edit, persist tags/geocoding, view and delete`, async ({
    page,
    request,
  }) => {
    await login(page, request);
    await page.locator("#add-button").click();
    await field(page, "resourceType").selectOption(type);
    if (type === "GROUP")
      await field(page, "companyName").fill("Created Group");
    if (type === "TANGIBLE") {
      await field(page, "resourceName").fill("Created Supplies");
      await field(page, "quantity").fill("5");
    }
    await field(page, "contactName").fill("Created Contact");
    await field(page, "address").fill("Chicago");
    await page
      .locator(".add-edit-resource-form [data-cy=tag-autocomplete] input")
      .fill("Sample Tag");
    await page
      .locator(".add-edit-resource-form [data-cy=tag-autocomplete] input")
      .press("Enter");
    await page.locator("#submit-form-button").click();
    await closed(page);
    await page.locator(".edit-button").first().click();
    await expect(page.locator("[data-cy=tag-chip]")).toContainText(
      "Sample Tag",
    );
    await field(page, "contactName").fill("Edited Contact");
    await field(page, "contactEmail").fill("");
    await field(page, "address").fill("Saint Louis");
    await page.locator("#submit-form-button").click();
    await closed(page);
    await page.reload();
    await search(page, "Edited Contact");
    await expect(names(page)).toHaveCount(1);
    await expect(page.locator("[data-cy=card-address]")).toContainText("63101");
    await names(page).click();
    await expect(field(page, "contactName")).toHaveValue("Edited Contact");
    await expect(field(page, "contactEmail")).toHaveValue("");
    await expect(field(page, "contactName")).toBeDisabled();
    await page.locator(".close-button").click();
    await page.locator(".edit-button").click();
    await page.locator("#delete-form-button").click();
    await expect(page.locator("#delete-form-button")).toHaveText("Confirm");
    await page.locator("#delete-form-button").click();
    await closed(page);
    await page.reload();
    await search(page, "Edited Contact");
    await expect(names(page)).toHaveCount(0);
  });
test("directory search location, name/distance sorting, live tag intersection", async ({
  page,
  request,
}) => {
  await login(page, request);
  await page.locator("#search-location").fill("Saint Louis");
  await search(page);
  await expect(names(page)).toHaveCount(2);
  await expect(names(page).first()).toHaveText("Bravo Shelter");
  await expect(page.locator("[data-cy=card-distance]").first()).toBeVisible();
  await page.locator(".resource-label").first().click();
  await expect(names(page).first()).toHaveText("Alpha Support");
  await page.locator(".resource-label").first().click();
  await expect(names(page).first()).toHaveText("Bravo Shelter");
  await page.locator("#search-location").fill("");
  await search(page);
  await expect(names(page)).toHaveCount(3);
  await page.locator("#tags-filled").fill("Housing");
  await page.locator("#tags-filled").press("Enter");
  await expect(names(page)).toHaveCount(2);
  await page.locator("#tags-filled").fill("Meals");
  await page.locator("#tags-filled").press("Enter");
  await expect(names(page)).toHaveText("Alpha Support");
  await page.locator("#tags-filled").press("Backspace");
  await page.locator("#tags-filled").press("Backspace");
  await expect(names(page)).toHaveCount(3);
});
test("navigation clears result and search state", async ({ page, request }) => {
  await login(page, request);
  await search(page);
  await expect(names(page)).toHaveCount(3);
  await page.getByRole("link", { name: "Map", exact: true }).click();
  await expect(page.locator(".card-title")).toHaveCount(0);
  await page.getByRole("link", { name: "Directory", exact: true }).click();
  await expect(names(page)).toHaveCount(0);
  await page.getByRole("link", { name: "Map", exact: true }).click();
  await mapSearch(page, "Alpha", "Chicago");
  await expect(page.locator(".card-title")).toHaveCount(1);
  await page.locator("#logo").click();
  await expect(page.locator(".card-title")).toHaveCount(0);
  await expect(page.locator("#locationInput")).toHaveValue("");
  await expect(page.locator("#map-keyword-input")).toHaveValue("");
});
test("map name/location searches, distances and independent location clearing", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN", "/");
  await mapSearch(page, "Alpha", "Chicago");
  await expect(page.locator(".card-title")).toHaveText("Alpha Support");
  await expect(page.locator(".card-distance")).toBeVisible();
  await page.locator("[data-cy=clear-location]").click();
  await expect(page.locator("#locationInput")).toHaveValue("");
  await expect(page.locator("#map-keyword-input")).toHaveValue("Alpha");
  await page.locator(".submitSearch").click();
  await expect(page.locator(".card-title")).toHaveText("Alpha Support");
  await expect(page.locator(".card-distance")).toHaveCount(0);
  await mapSearch(page, "", "Saint Louis");
  await expect(page.locator(".card-title")).toHaveCount(2);
  await expect(page.locator(".card-title").first()).toHaveText("Bravo Shelter");
  await page.locator(".card-title").first().click();
  await expect(page.locator(".resource-drawer header p")).toBeVisible();
  await mapSearch(page);
  await expect(page.locator(".card-title")).toHaveCount(3);
});
for (const surface of [".resource-drawer"])
  test(`map ${surface} view/edit modal and close synchronization`, async ({
    page,
    request,
  }) => {
    await login(page, request, "ADMIN", "/");
    await mapSearch(page, "Alpha");
    await page.locator(".card-title").click();
    await expect(page.locator(".resource-drawer h2")).toHaveText(
      "Alpha Support",
    );
    await page.locator(`${surface} [data-cy=card-resource-edit-btn]`).click();
    await expect(page.locator(".modal-title")).toHaveText("Edit Resource");
    await field(page, "companyName").fill("Unsaved change");
    await field(page, "contactName").fill("");
    await page.locator("#submit-form-button").click();
    await expect(field(page, "contactName")).toHaveClass(/invalid/);
    await page.locator("#delete-form-button").click();
    await expect(page.locator("#delete-form-button")).toHaveText("Confirm");
    await field(page, "companyName").click();
    await expect(page.locator("#delete-form-button")).toHaveText("Delete");
    await page.locator(".close-button").click();
    await expect(page.locator(".resource-drawer h2")).toBeVisible();
    await page.locator(`${surface} [data-cy=card-resource-view-btn]`).click();
    await expect(field(page, "companyName")).toBeDisabled();
    await expect(page.locator("#submit-form-button")).toHaveCount(0);
    await page.locator(".close-button").click();
    await page.locator("button[aria-label='Close resource details']").click();
    await expect(page.locator(".resource-drawer h2")).toHaveCount(0);
    await expect(page.locator(".expanded")).toHaveCount(0);
  });
test("map drawer opens read-only details and tag selection toggles and stays synchronized", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN", "/");
  await mapSearch(page, "Alpha");
  await page.locator(".card-title").first().click();
  await page
    .locator(".resource-drawer [data-cy=card-resource-view-btn]")
    .click();
  await expect(field(page, "companyName")).toBeDisabled();
  await page.locator(".close-button").click();
  const cardTag = page
    .locator(".card-tags .filter-tag")
    .filter({ hasText: "Housing" })
    .first();
  const drawerTag = page
    .locator(".drawer-tags .filter-tag")
    .filter({ hasText: "Housing" });
  await cardTag.click();
  await expect(cardTag).toHaveAttribute("aria-pressed", "true");
  await expect(drawerTag).toHaveAttribute("aria-pressed", "true");
  await drawerTag.click();
  await expect(cardTag).toHaveAttribute("aria-pressed", "false");
  await expect(drawerTag).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".workspace-filters .filter-tag")).toHaveCount(0);
  for (const tag of ["Housing", "Meals"])
    await page
      .locator(".card-tags .filter-tag")
      .filter({ hasText: tag })
      .first()
      .click();
  await expect(page.locator(".workspace-filters .filter-tag")).toHaveCount(2);
  await mapSearch(page);
  await expect(page.locator(".workspace-filters .filter-tag")).toHaveCount(2);
  await expect(page.locator(".card-title")).toHaveText("Alpha Support");
  await page.locator(".workspace-filters .filter-tag").first().click();
  await expect(page.locator(".workspace-filters .filter-tag")).toHaveCount(1);
  await page.locator(".workspace-filters .filter-tag").first().click();
  await expect(page.locator(".workspace-filters .filter-tag")).toHaveCount(0);
  await expect(page.locator(".card-title")).toHaveCount(3);
});
test("user panel labels, read-only identity, persistent role edit and filters", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN", "/users");
  await expect(page.locator(".people-heading")).toContainText("People");
  await expect(page.locator(".user-labels")).toContainText("Role");
  await expect(page.locator(".card-wrapper")).toHaveCount(3);
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.locator(".review-queue")).toHaveCount(0);
  await expect(page.locator(".card-wrapper")).toHaveCount(4);
  const user = page
    .locator(".card-wrapper")
    .filter({ hasText: "Casey Example" });
  await user.click();
  await expect(field(page, "name")).toHaveValue("Casey Example");
  await expect(field(page, "name")).toBeDisabled();
  await expect(page.locator("[data-cy=modal-submit]")).toHaveCount(0);
  await page.locator(".close-button").click();
  await user.locator(".edit-button").click();
  await expect(field(page, "name")).toBeDisabled();
  await field(page, "role").selectOption("VOLUNTEER");
  await field(page, "title").fill("Updated title");
  await page.locator("[data-cy=modal-submit]").click();
  await closed(page);
  await page.reload();
  await expect(user).toContainText("VOLUNTEER");
  await expect(user).toContainText("Updated title");
  for (const [label, count] of [
    ["Deactivated", 1],
    ["Active", 3],
    ["All", 4],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator(".card-wrapper")).toHaveCount(count);
  }
});
test("people search and decline persist", async ({ page, request }) => {
  await login(page, request, "ADMIN", "/users");
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await expect(page.locator(".review-queue")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Deactivated", exact: true }).click();
  await expect(page.locator(".card-wrapper")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "Find a teammate" }).fill("casey");
  await expect(page.locator(".card-wrapper")).toHaveCount(1);
  await expect(page.locator(".card-wrapper")).toContainText("Casey Example");
  await page.getByRole("searchbox").fill("no such teammate");
  await expect(page.getByText("No teammates match your search.")).toBeVisible();
});
test("expired server session on resource request signs the browser out", async ({
  page,
  request,
}) => {
  await login(page, request, "ADMIN", "/");
  await expect(page.locator(".submitSearch")).toBeVisible();
  await request.post("http://127.0.0.1:4176/__test/reset", {
    data: { role: null },
  });
  await page.locator(".submitSearch").click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator(".card-title")).toHaveCount(0);
});
