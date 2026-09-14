# Tests and coverage

Install locked dependencies before running the suites:

```sh
npm ci --ignore-scripts
npm ci --prefix frontend
npm ci --prefix backend --ignore-scripts
npm ci --prefix scripts/db_backup/backup --ignore-scripts
```

`npm test` runs the source-level server tests, Turso/API integration tests,
legacy Express/MongoDB tests, frontend unit tests, and backup tests. MongoDB
uses an isolated temporary database; the runner never uses an operator's
`DB_URI`. It needs permission to open local test ports and may download a
MongoDB binary on first use.

For shorter feedback cycles:

```sh
npm run test:server:unit
npm --prefix frontend test
npm run test:turso
npm run test:coverage
```

The server Vitest suite tests validation, geocoding, search, authentication,
CSRF, rate limits, and OAuth branches. `routes.unit.test.ts` additionally
exercises the source API against a fresh in-memory libSQL database per test.
Provider calls are mocked. The separate existing OAuth integration tests verify
signed tokens, so mocked unit coverage does not replace signature verification.

The frontend tests cover reducers, selectors, API workflows, asynchronous search
ordering, CSV export, formatting, idle sessions, and component interactions.
Page tests exercise directory loading/search/density/sorting, account review and
error recovery, map filtering/selection/drawers, navigation, and authentication.
Form tests cover each resource type, required fields, writable-field payloads,
read-only access, pending submissions, failed mutations, retry, and deletion
confirmation. Map graphics and virtualized layout are mocked at their library
boundaries; the separate Playwright tests validate actual browser interactions.
Tests include regression cases for stale selected records, missing resource tags,
invalid geographic coordinates, zero-valued query parameters, duplicate form
submissions, premature dialog closure on deletion, rendering a resource removed
during deletion, and undispatched map resets.

## Coverage reports and enforcement

`npm run test:coverage` writes HTML and JSON summaries to:

- `server/coverage/index.html`
- `server/coverage/coverage-summary.json`
- `frontend/coverage/index.html`
- `frontend/coverage/coverage-summary.json`

Reports include untested source files. CI enforces 100% server line, statement,
and function coverage, and at least 90% branch coverage per server module.
Frontend reducers, selectors, and SessionGuard require 100% coverage; utilities
require 100% line, statement, and function coverage and at least 80% branches.
Frontend coverage must also stay above 88% lines/statements, 82% branches, and
80% functions overall. The three main page components require 100% lines,
statements, and functions; resource/user editors require at least 95% lines and
statements.

The current source tests reach 100% server lines and approximately 97% branches.
Frontend coverage is approximately 89% of lines overall, with 100% lines in
reducers, selectors, utilities, and the three main page components. This report
still includes the standalone design drafts under `src/draft`, which have no
unit coverage, as well as unused legacy map controls. These are visible gaps,
not excluded files. Run the separate Playwright suite with `npm run test:e2e`. The Vitest reports do not measure the legacy backend, backup scripts,
Node integration tests, or Playwright execution. Legacy coverage is separately
available with `npm --prefix backend run test:coverage`.

These numbers describe executed code, not exhaustive input coverage or proof
that the application has no bugs. Remaining gaps include the standalone design drafts, legacy map controls,
entrypoint wiring, and a small number of condition branches. Browser tests are
still needed for real graphics, layout, and focus behavior.
