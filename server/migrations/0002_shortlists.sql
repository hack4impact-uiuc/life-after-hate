CREATE TABLE IF NOT EXISTS shortlists (
 id TEXT PRIMARY KEY CHECK(length(id)=24),
 name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
 owner_id TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS shortlist_items (
 shortlist_id TEXT NOT NULL REFERENCES shortlists(id) ON DELETE CASCADE,
 resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
 added_at TEXT NOT NULL,
 PRIMARY KEY(shortlist_id,resource_id)
);
