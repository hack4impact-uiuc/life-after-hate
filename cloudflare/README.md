# Workers + D1 migration trial

This is a local migration candidate. It preserves the React interface and `/api`
contracts while replacing Express/Mongoose at runtime with a TypeScript Hono
Worker and D1 SQL storage. The legacy backend remains available for rollback.
Nothing in this directory has been deployed or connected to production.

## Run locally

Use Node 24 (the repository `.nvmrc`).

```sh
npm ci --prefix frontend
npm run build --prefix frontend
npm ci --prefix cloudflare
npm run check --prefix cloudflare
npm test --prefix cloudflare
npm run dev --prefix cloudflare
```

The preview prints a one-use sign-in link on `http://localhost:3001`. It seeds
synthetic records in disposable D1, creates a real server session for a demo
administrator, and binds only to loopback. Restarting discards edits. Its
geocoder returns a synthetic Chicago location for every address. External OAuth
is disabled there. Production code contains no demo login or role bypass.
Mapbox still needs the existing public frontend token for a basemap; the current
session's temporary preview assets use OpenFreeMap instead.
To reproduce the keyless local preview, build the frontend with
`VITE_MAP_STYLE=https://tiles.openfreemap.org/styles/positron npm run build --prefix frontend`.
Provider attribution is supplied by the style. This does not change production's
default Mapbox configuration or its content security policy; a production provider
change also needs the corresponding CSP allowlist reviewed.

## Convert a backup locally

Install MongoDB Database Tools and the legacy backend dev dependencies (needed
only for a disposable MongoDB restore). Build the Worker, then run:

```sh
cd cloudflare
npm run build
npm run migrate:archive -- \
  --archive /absolute/private/path/LAH_DB.archive.gz \
  --out /absolute/private/path/new-d1-migration \
  --mongorestore /absolute/path/to/mongorestore \
  --version 8.0.32
```

The output directory must be new and outside this repository. The converter:

1. Restores only `LAH_DB.resources` and `LAH_DB.users` into a temporary local
   MongoDB matching the source version; it never connects to Atlas.
2. Inserts every document into an isolated D1 database, preserving IDs and
   every JSON-visible field. Dates become ISO strings and ObjectIds become hex
   strings, matching the original API serialization.
3. Retains the exact original BSON representation as canonical Extended JSON
   in `migration_source`, so BSON types and unknown fields remain recoverable.
4. Compares every document field and original representation, then imports the
   generated SQL into a second fresh D1 database and checks its content hashes.
5. Writes private `data.sql` and `manifest.json` files only after verification.
   Temporary databases are removed even on failure. Sessions are not migrated.

The SQL is plaintext sensitive data, even with owner-only file permissions.
Keep it out of Git, synced folders, build assets and CI. The original encrypted
backup strategy is still required. `migration_source` contains historical data
that normal resource deletion does not remove: after cutover verification, move
its retention responsibility to the restricted backup system and drop that
table from the live database according to the organization's retention policy.

## Data model and security

This initial migration deliberately uses a hybrid SQL/JSON model. `resources`
retains flexible resource fields as JSON with an indexed resource type. `users`
has SQL-enforced unique OAuth subjects/emails and constrained roles, plus JSON
for the existing UI fields. This avoids silently dropping old college-era
fields during a full schema redesign. All values use prepared statements.

Google login checks signed ID tokens, issuer, audience, verified email, nonce,
PKCE and single-use cookie-bound state. Accounts are matched by Google subject,
never linked automatically by email, and new accounts start PENDING. Sessions
are random tokens stored only as SHA-256 hashes, with idle/absolute expiry;
production cookies use `__Host-`, Secure, HttpOnly and SameSite=Lax. Every unsafe
authenticated request requires CSRF and same-origin checks. Roles reload on
every request; role edits revoke that user's sessions immediately.

Administrative mutations and their metadata-only audit events share a D1 batch
transaction. These audit records are not tamper-proof against database owners.
No request bodies, URLs, private records or raw provider exceptions are logged.
API and HTML responses are no-store. OAuth/MapQuest redirects are not followed.
An indexed D1 rate counter is shared across Worker instances; quota exhaustion
fails closed. Hourly cleanup removes expired sessions, OAuth state and counters.

`npm test` exercises real local D1 and the Workers runtime. OAuth tests use
locally signed test tokens and stub Google endpoints; geocoding tests use
synthetic responses. No live Google integration or Cloudflare account is needed.

The stable Miniflare 4 runtime is pinned with patched `undici` and `sharp`
overrides. The current Wrangler CLI has its own Miniflare dependency. Keep the
lockfile and review these overrides when upgrading tooling.

## Before a production cutover

Configure a separate staging D1 database, its ID in `wrangler.jsonc`, the real
HTTPS `APP_ORIGIN`, and a custom domain. The checked-in placeholders deliberately
cannot serve the app. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and
`MAPQUEST_KEY` as Worker secrets and register the exact
`APP_ORIGIN/api/auth/login/callback` in Google Cloud. Keep `workers_dev` and preview
URLs disabled to avoid alternate public origins. Build the React frontend before
the Worker deployment. The assets directory includes only the frontend build.

Use the schema in `migrations/` and import the verified data into an **empty**
target; the import uses INSERT, never REPLACE or destructive reset. Staging
should use synthetic data. Remote resource creation, uploads, deployment and DNS
changes are separate from this local trial.

Test live Google login, approval, revocation, exports and mapping in staging.
Profile search against the Free plan's CPU and D1 read/write quotas: fuzzy search
still scans the small directory in memory, and no free-quota performance claim
has been validated on Cloudflare. Mapbox/MapQuest costs remain separate from
hosting. Review staff MFA, volunteer export/notes access, data location and
retention with the organization.

Before cutover, pause production edits, take and verify a fresh backup, regenerate
the SQL, import into an empty target and rerun counts/content checks. Invalidate
old sessions. Keep the old deployment and backup until acceptance. Once users
write to D1, rollback requires reconciling those changes; the original MongoDB
backup alone will not include them. Add independent encrypted exports and
restore drills alongside D1's built-in recovery.

References: [D1 batches](https://developers.cloudflare.com/d1/worker-api/d1-database/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/),
[Worker configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).
