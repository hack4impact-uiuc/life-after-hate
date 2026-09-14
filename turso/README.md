# Vercel + Turso

Production target: Vercel Node 24 functions and static Vite assets, with a Turso **libSQL** database. The authenticated API lives under `server/src`. The newer Turso Database engine uses a different client and has not been validated by this migration.

Server environment variables:

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (existing `.env` names `TURSO_SQL` and `TURSO_TOKEN` also work).
- `APP_ORIGIN`: exact HTTPS origin, no trailing slash, matching the deployed hostname.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth web application. Register `${APP_ORIGIN}/api/auth/login/callback` as the redirect URI.
- `MAPQUEST_KEY`: server-side location lookup.

Never use `VITE_` prefixes for secrets. Production assets use `/api`, bundled fonts, and OpenFreeMap tiles. Local demo assets and bootstrap sessions are not deployed. Keep preview deployments on a separate database and OAuth origin.

Run `npm run check:server`, `npm run test:turso` and `npm run build:vercel`. Vercel uses the root `vercel.json`; set the project's Node version to 24 and root to this repository. The legacy Express/Mongo backend is retained but is no longer the Vercel entry point.

Migration: `node --env-file=.env turso/migrate.mjs /absolute/private/data.sql`. This requires an empty database and imports the verified Mongo-to-SQL export, retaining complete application documents and original IDs. Schema and documents commit atomically. All document hashes are compared after import. Pass `--local-check` to verify entirely in memory, without a remote connection. Old sessions and duplicate BSON provenance are not imported; retain the original protected backup outside Git. This script is a one-time import, not an ongoing backup system.

The API keeps hashed sessions, server-side expiration, CSRF, role checks, bound SQL parameters, and transactional audit events. Expired session/state/rate-limit records are cleaned on incoming traffic at most once per ten minutes per warm instance; authentication always checks expiration independently. Vercel's overwritten X-Forwarded-For header is used only on Vercel. No private request details or SQL errors are logged by the adapter.

Before cutover: configure Google and geocoding credentials, verify real login and administrative changes on a protected preview, verify production data freshness, configure backup retention/recovery in Turso, and keep the old service available for rollback. Local tests do not verify live Google OAuth, Turso quotas, or Vercel account settings.

Local demo: `npm run build:vercel && npm run dev:demo` starts a disposable synthetic libSQL database on localhost:3001. The backup conversion tool is `server/scripts/migrate-archive.mjs`; it restores a Mongo archive locally and produces verified SQL outside the repository.
