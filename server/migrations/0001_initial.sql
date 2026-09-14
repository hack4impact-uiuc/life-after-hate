CREATE TABLE resources (
 id TEXT PRIMARY KEY CHECK(length(id)=24),
 document TEXT NOT NULL CHECK(json_valid(document) AND json_extract(document,'$._id') = id),
 type TEXT GENERATED ALWAYS AS (json_extract(document,'$.type')) STORED
);
CREATE INDEX resources_type ON resources(type);
CREATE TABLE users (
 id TEXT PRIMARY KEY CHECK(length(id)=24),
 oauth_id TEXT NOT NULL UNIQUE,
 email TEXT NOT NULL UNIQUE,
 role TEXT NOT NULL CHECK(role IN ('ADMIN','VOLUNTEER','PENDING','REJECTED')),
 document TEXT NOT NULL CHECK(json_valid(document) AND json_extract(document,'$._id')=id AND json_extract(document,'$.oauthId')=oauth_id AND json_extract(document,'$.email')=email AND json_extract(document,'$.role')=role)
);
CREATE INDEX users_role ON users(role);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 csrf TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 last_seen INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(last_seen);
CREATE TABLE oauth_states (token_hash TEXT PRIMARY KEY, verifier TEXT NOT NULL, nonce TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX oauth_expiry ON oauth_states(expires_at);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX rate_expiry ON rate_limits(expires_at);
CREATE TABLE audit_events (id TEXT PRIMARY KEY, actor_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT NOT NULL, created_at TEXT NOT NULL);
-- Canonical Extended JSON retains original BSON types and unknown legacy fields.
-- This is migration provenance, not an API-readable table or ongoing backup.
CREATE TABLE migration_source (collection TEXT NOT NULL, id TEXT NOT NULL, canonical_ejson TEXT NOT NULL, sha256 TEXT NOT NULL, PRIMARY KEY(collection,id));
