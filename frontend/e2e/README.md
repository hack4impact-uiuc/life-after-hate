# Browser tests

Run `npm run test:e2e` from the repository root. CI runs this on pushes and pull requests with the Chromium version installed by Playwright.

`legacy.spec.js` ports the old Cypress behavior checks to Playwright. It drives the built React application through the real Hono API into disposable in-memory libSQL. Every test resets synthetic users/resources and gets a fresh hashed server session. Geocoding and external map styles are deterministic fixtures. There are no production credentials or production database calls. The reset endpoint exists only in `server/scripts/e2e.mjs`, bound to loopback, and is never imported by the production API.

`security.spec.js` retains the smaller browser tests with mocked API responses for fast UI/security checks. Server OAuth tests separately validate signed Google tokens, PKCE, nonce/state replay protection, and account linking. Browser tests do not automate real Google login or test third-party geocoder accuracy.

## Cypress coverage mapping

| Former Cypress suite | Playwright coverage in `legacy.spec.js` |
| --- | --- |
| Pending / rejected | Direct visits to all protected routes, pending logo/message, no navigation or map |
| Volunteer | Hidden account navigation, forbidden route redirect, no edits, read-only directory and map details |
| Navbar / extra | Titles, links, logo navigation, authenticated login redirect, logout, expired-session redirect |
| Directory | Headers, empty search, required inputs, resource-specific forms, all three resource types, create/edit/delete persistence, tags, normalized addresses, sorting, CSV, view-only details, navigation reset |
| Resource map | Keyword/location combinations, distances, independent clearing, card/popup view-edit modes, validation, delete confirmation reset, close synchronization, maximize, logo reset, deduplicated persistent tags |
| User panel | Labels, list rows, view-only identity, persistent role/title editing, pending/rejected/active/all filters |

Tests use three named synthetic resources and four synthetic roles instead of hard-coded production names/counts. Assertions wait for visible behavior and network completion rather than fixed sleeps or forced clicks. Browser mutation tests reload the page to verify persistence. All tests run with one worker because they share the disposable test server; they never share production state.

The old Cypress files are preserved in Git history before this migration; their obsolete role-switch endpoint and Docker/coverage setup have been removed.
