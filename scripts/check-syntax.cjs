const { readdirSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", "coverage", "build", ".nyc_output"].includes(entry.name)) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) check(filename);
    else if (/\.(c?js|mjs)$/.test(filename)) {
      const result = spawnSync(process.execPath, ["--check", filename], { stdio: "inherit" });
      if (result.status) process.exitCode = 1;
    }
  }
}
check("backend"); check("scripts/db_backup/backup");
