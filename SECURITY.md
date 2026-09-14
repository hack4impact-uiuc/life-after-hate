# Security and deployment

This repository contains sensitive contact information and notes. Passing automated tests and a clean dependency audit are not a security certification or evidence that an existing deployment has never been compromised.

## Implemented protections

- Google OAuth uses a fixed callback and Passport's session-bound, single-use state. The cross-deployment redirect relay is removed. New Google users always enter `PENDING`; only an existing administrator can approve access.
- Every resource/user API enforces backend roles. Passport reloads users from MongoDB on each authenticated request, so deletion and role revocation take effect server-side immediately.
- Every non-read request needs a session-bound `X-CSRF-Token`. `GET /api/auth/csrf` supplies it. An explicit foreign Origin is rejected. Logout is POST-only and destroys the stored session.
- Production cookies use `__Host-lah.sid`, `Secure`, `HttpOnly`, `SameSite=Lax`, and path `/`. Sessions expire after 30 minutes without requests and after eight hours regardless of activity. The browser clears private state after 15 minutes without interaction and rechecks authentication periodically/on returning to the tab.
- Logout clears all Redux data. Responses initiated before logout are discarded. Offline caching and session replay are disabled. API responses and application HTML are marked `no-store`.
- Operational logs contain request IDs, HTTP methods and status codes. They omit identities, URLs, queries, bodies, headers and raw errors. No third-party request logger or session replay is initialized.
- JSON bodies, search inputs and resource fields have size limits. Geocoding requires HTTPS, uses encoded query parameters, rejects redirects and has a timeout. Coordinates are server-derived; partial edits preserve existing addresses.
- CSV cells are quoted and formula prefixes neutralized. Backup credentials come from Secrets Manager, are written to a private temporary config file, and never enter shell commands or logs. Uploads require SSE-KMS encryption.
- CI uses disposable MongoDB and synthetic browser data. Pull-request code never runs with production credentials. Dependency audits fail CI at moderate severity and above for production trees.

## Deployment requirements

1. Use Node 24 LTS and an authenticated, TLS-protected MongoDB deployment. Production startup rejects unauthenticated/plaintext MongoDB URIs and disabled certificate verification. Restrict database network access to the API/backup service and enable provider encryption at rest. Give the application access only to its own database.
2. Set `NODE_ENV=production`, a random `SESSION_SECRET` of at least 32 bytes, Google OAuth credentials, `FE_URI=https://YOUR_HOST`, and `OAUTH_CALLBACK_URI=https://YOUR_HOST/api/auth/login/callback`. The frontend and API must share the same production origin. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.
3. Register that exact callback in Google Cloud. Preview environments need their own registered callback and isolated database/credentials; they must never use the production redirect relay or production data. Require MFA for staff Google accounts through your identity provider. The application does not independently enforce MFA.
4. Terminate HTTPS at a trusted proxy and configure `TRUST_PROXY` to its exact address/subnet. Never trust all clients. Do not expose the API directly around that proxy. The supplied production Compose setup uses Caddy at `172.30.40.2`; adjust its network and the trusted address together if that subnet conflicts with your environment.
5. Store production values in the deployment's secret manager or an untracked `.env.production`. Only `VITE_MAPBOX_ACCESS_TOKEN` is intended as a public build-time value; scope this token to the site's URLs. Keep API requests same-origin (`/api/`). Do not copy the backend environment into the frontend. Vercel deployments require explicit environment and trusted-proxy configuration in the platform; the legacy secret aliases were removed.
6. Use `docker compose --env-file .env.production -f docker-compose.production.yml up --build -d` only after configuring `PUBLIC_HOST`, DNS, OAuth, and database access. This exposes Caddy's HTTPS/HTTP ports, not MongoDB or the API. Docker images/configuration were not deployed as part of this change.
7. Use a private, versioned backup bucket with Block Public Access, a retention/lifecycle policy, a dedicated KMS key and restricted restore permissions. Configure the backup per `scripts/db_backup/README.md`. Regularly restore to an isolated database and verify the result.

`docker-compose.yml` is development-only: the frontend binds to loopback and MongoDB has no published port. It contains no database authentication because it is intended for disposable local data. Never use the authentication bypass or local seed tooling for real records. Production startup rejects bypass/default-role overrides.

## Before using existing production data

- Rotate the database credentials if the old backup job ran: it printed its complete MongoDB URI. Review access to historical logs and backups before applying retention/deletion policies. Check historical LogRocket/Loggly collection; disabling new telemetry does not delete previously collected information.
- Changing the cookie name intentionally signs out existing browser sessions. Delete obsolete server sessions or rotate `SESSION_SECRET` during rollout as appropriate.
- Back up and test a restore before a MongoDB upgrade. Do not attach an old MongoDB volume directly to a new major release or assume unsupported version jumps will migrate it. Follow the database provider's supported upgrade sequence.
- Test Google login, pending approval, role revocation, logout, and map/geocoding against staging credentials and synthetic records. Automated OAuth tests stub Google's token/profile service; they do not exercise a live Google configuration.
- Review who needs bulk exports and which fields volunteers should see. Current behavior deliberately preserves the original policy: approved volunteers can read/export the directory; administrators can mutate it. This is not row-level access control.

## Remaining operational limits

The rate limiter is per process. Run the supplied single API instance or configure a shared limiter/edge rate limiting before scaling to multiple processes or serverless instances. Search still processes the directory in application memory; use indexed/paginated search if data volume or traffic grows. These changes do not introduce a tamper-evident administrative audit trail, database field encryption, an MFA policy, or an organization-specific retention policy.

MapQuest receives addresses for geocoding. Mapbox receives map/tile requests and viewport information. Review those provider relationships for this use case. Telemetry removal does not make mapping fully local or anonymous.

Dependencies are reproducibly locked. React 18 and the existing map/router APIs were retained where needed for verified compatibility; upgrading every UI library to its newest major version is separate from patching known vulnerabilities. Review automated dependency PRs and keep Node/container patches current.

## Reporting a vulnerability

Do not put real records, credentials, session cookies or a working exploit against a live service in a public issue. Report through the repository's private vulnerability-reporting channel if enabled, or contact the project maintainers privately.
