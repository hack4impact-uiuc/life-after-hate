import { test, expect } from "@playwright/test";
const record = {
  _id: "507f1f77bcf86cd799439011",
  type: "GROUP",
  contactName: "Test Contact",
  companyName: "Test Resource",
  contactEmail: "test@example.com",
  contactPhone: "",
  address: "123 Test St",
  notes: "Private test note",
  description: "Test description",
  tags: ["Support"],
  dateCreated: "2026-01-01T00:00:00.000Z",
  location: { type: "Point", coordinates: [-87, 41] },
};
async function mockApi(page, role) {
  let signedIn = Boolean(role);
  let resource = { ...record };
  const writes = [];
  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    let result;
    if (path === "/api/auth/csrf")
      return route.fulfill({ json: { token: "test-csrf-token" } });
    if (!["GET", "HEAD"].includes(req.method())) {
      expect(req.headers()["x-csrf-token"]).toBe("test-csrf-token");
      writes.push({ path, method: req.method(), data: req.postDataJSON() });
    }
    if (path === "/api/users/current") {
      if (!signedIn)
        return route.fulfill({ status: 401, json: { success: false } });
      result = {
        id: "user-id",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role,
        propicUrl: "/favicon.ico",
      };
    } else if (path === "/api/auth/logout") {
      signedIn = false;
      return route.fulfill({ json: { success: true } });
    } else if (path === "/api/resources/tags") result = ["Support"];
    else if (path === "/api/resources/filter")
      result = { resources: [resource], center: null };
    else if (path === "/api/resources" && req.method() === "POST") {
      resource = { ...resource, ...req.postDataJSON() };
      return route.fulfill({
        status: 201,
        json: { success: true, id: record._id },
      });
    } else if (path.includes("/api/resources/") && req.method() === "PUT") {
      resource = { ...resource, ...req.postDataJSON() };
      return route.fulfill({ json: { success: true } });
    } else if (path.includes("/api/resources/") && req.method() === "DELETE") {
      return route.fulfill({ json: { success: true } });
    } else if (path.includes("/api/resources/")) result = resource;
    else if (path === "/api/users")
      result = [
        {
          id: "listed-user",
          firstName: "Directory",
          lastName: "Member",
          email: "member@example.com",
          role: "VOLUNTEER",
          title: "Coordinator",
        },
      ];
    else return route.fulfill({ status: 404, json: {} });
    return route.fulfill({ json: { success: true, result } });
  });
  return writes;
}
test("anonymous users cannot open the directory", async ({ page }) => {
  await mockApi(page, null);
  await page.goto("/directory");
  await expect(
    page.getByRole("link", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.locator("#page-title")).toHaveCount(0);
});
test("pending users see approval status", async ({ page }) => {
  await mockApi(page, "PENDING");
  await page.goto("/directory");
  await expect(page.locator('[data-cy="pending"]')).toBeVisible();
  await expect(page.locator("#add-button")).toHaveCount(0);
});
test("volunteers can search and read but have no write controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockApi(page, "VOLUNTEER");
  await page.goto("/directory");
  await page.locator("#search-general").fill("Test");
  await page.locator("#search-button").click();
  await expect(page.locator("#result-count")).toHaveText("1 result");
  await expect(page.locator("#add-button")).toHaveCount(0);
  await expect(page.locator(".edit-button")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("admin can add, edit and delete a resource with CSRF-protected writes", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const writes = await mockApi(page, "ADMIN");
  await page.goto("/directory");
  await page.locator("#add-button").click();
  await page.locator('[data-cy="modal-resourceType"]').selectOption("GROUP");
  await page.locator('[data-cy="modal-companyName"]').fill("Created Resource");
  await page.locator('[data-cy="modal-contactName"]').fill("Test Contact");
  await page.locator('[data-cy="modal-address"]').fill("123 Test St");
  await page.locator("#submit-form-button").click();
  await expect(page.locator(".add-edit-resource-form")).toHaveCount(0);
  expect(writes[0].data.type).toBe("GROUP");
  expect(writes[0].data.companyName).toBe("Created Resource");
  await page.locator(".edit-button").first().click();
  await page.locator('[data-cy="modal-notes"]').fill("Updated note");
  await page.locator("#submit-form-button").click();
  await expect(page.locator(".add-edit-resource-form")).toHaveCount(0);
  expect(writes.find((entry) => entry.method === "PUT").data.notes).toBe(
    "Updated note",
  );
  await page.locator(".edit-button").first().click();
  await page.locator("#delete-form-button").click();
  await page.locator("#delete-form-button").click();
  await expect(page.locator(".add-edit-resource-form")).toHaveCount(0);
  await expect
    .poll(() => writes.some((entry) => entry.method === "DELETE"))
    .toBe(true);
  expect(errors).toEqual([]);
});
test("logout uses POST and removes private content", async ({ page }) => {
  const writes = await mockApi(page, "VOLUNTEER");
  await page.goto("/directory");
  await page.locator("#search-button").click();
  await expect(page.locator("#result-count")).toHaveText("1 result");
  await page.locator("#user-icon").click();
  await page.locator("#signout-button").click();
  await expect(
    page.getByRole("link", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.getByText("Private test note")).toHaveCount(0);
  expect(
    writes.some(
      (entry) => entry.path === "/api/auth/logout" && entry.method === "POST",
    ),
  ).toBe(true);
});

test("locks the screen after inactivity even if the backend is unreachable", async ({
  page,
}) => {
  await page.clock.install();
  await mockApi(page, "VOLUNTEER");
  await page.goto("/directory");
  await expect(page.locator("#page-title")).toBeVisible();
  await page.route("**/api/auth/logout", (route) => route.abort());
  await page.clock.fastForward(15 * 60 * 1000 + 1000);
  await expect(
    page.getByRole("link", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(page.locator("#page-title")).toHaveCount(0);
});

test("map search displays a resource and opens its detail drawer", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockApi(page, "VOLUNTEER");
  await page.route("https://**.mapbox.com/**", (route) =>
    route.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "#eeeeee" },
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".mapboxgl-canvas")).toBeVisible();
  await page.locator('[data-cy="searchInput"] input').fill("Test");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".card-title")).toHaveText("Test Resource");
  await page.locator(".card-top").click();
  await expect(page.locator(".resource-drawer h2")).toHaveText("Test Resource");
  expect(errors).toEqual([]);
});

test("account management loads users from the canonical API path", async ({
  page,
}) => {
  await mockApi(page, "ADMIN");
  await page.goto("/users");
  await expect(
    page.getByText("Directory Member", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("member@example.com", { exact: true }),
  ).toBeVisible();
});
