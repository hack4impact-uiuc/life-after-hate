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
ordering, CSV export, formatting, idle-session behavior, and selected components.
Tests include regression cases for stale selected records, missing resource tags,
invalid geographic coordinates, and zero-valued query parameters.

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

The current source tests reach 100% server lines and approximately 97% branches.
Frontend coverage is approximately 48% of lines overall, with 100% lines in
reducers, selectors, and utilities. Many page and form interactions still rely
on the separate Playwright suite (`npm run test:e2e`) and lack direct component
tests. The Vitest reports do not measure the legacy backend, backup scripts,
Node integration tests, or Playwright execution. Legacy coverage is separately
available with `npm --prefix backend run test:coverage`.

These numbers describe executed code, not exhaustive input coverage or proof
that the application has no bugs. Remaining priorities are page/form component
tests, middleware error branches, and the remaining API condition branches.
