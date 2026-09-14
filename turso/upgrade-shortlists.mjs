import { readFile } from "node:fs/promises";
import { connect } from "./client.mjs";
const client = connect();
try {
  const sql = await readFile(
    new URL("../server/migrations/0002_shortlists.sql", import.meta.url),
    "utf8",
  );
  await client.batch(
    sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    "write",
  );
  console.log(
    "Shortlist tables are ready. Existing resources and users preserved.",
  );
} finally {
  client.close();
}
