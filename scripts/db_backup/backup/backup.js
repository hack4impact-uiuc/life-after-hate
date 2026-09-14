const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs/promises");
const { createReadStream } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

function createBackup({
  s3 = new S3Client({}),
  secrets = new SecretsManagerClient({}),
  dump = promisify(execFile),
  env = process.env,
} = {}) {
  return async () => {
    if (!env.MONGO_SECRET_ARN || !env.S3_BUCKET || !env.BACKUP_KMS_KEY_ARN) {
      throw new Error("Backup secret, bucket and KMS key are required");
    }
    const folder = await fs.mkdtemp(path.join(tmpdir(), "lah-backup-"));
    await fs.chmod(folder, 0o700);
    let stream;
    try {
      const secret = await secrets.send(
        new GetSecretValueCommand({ SecretId: env.MONGO_SECRET_ARN }),
      );
      const { uri } = JSON.parse(secret.SecretString);
      if (typeof uri !== "string" || !/^mongodb(?:\+srv)?:\/\//.test(uri))
        throw new Error("Invalid backup secret");
      const options = Object.fromEntries(
        [...new URLSearchParams(uri.split("?")[1] || "")].map(
          ([key, value]) => [key.toLowerCase(), value.toLowerCase()],
        ),
      );
      const tls =
        uri.startsWith("mongodb+srv://") ||
        options.tls === "true" ||
        options.ssl === "true";
      if (
        !tls ||
        options.tls === "false" ||
        options.ssl === "false" ||
        [
          "tlsinsecure",
          "tlsallowinvalidcertificates",
          "tlsallowinvalidhostnames",
        ].some((key) => options[key] === "true")
      ) {
        throw new Error("Backups require verified database TLS");
      }
      const config = path.join(folder, "mongodump.yml");
      const archive = path.join(folder, "database.archive.gz");
      // A restricted config file keeps credentials out of logs and process arguments.
      await fs.writeFile(config, `uri: ${JSON.stringify(uri)}\n`, {
        mode: 0o600,
      });
      await dump(
        "/opt/bin/mongodump",
        [`--config=${config}`, `--archive=${archive}`, "--gzip"],
        {
          timeout: 240000,
          maxBuffer: 1024 * 1024,
        },
      );
      stream = createReadStream(archive);
      await s3.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: `backups/${new Date().toISOString()}-${path.basename(folder)}.archive.gz`,
          Body: stream,
          ContentLength: (await fs.stat(archive)).size,
          ContentType: "application/gzip",
          ServerSideEncryption: "aws:kms",
          SSEKMSKeyId: env.BACKUP_KMS_KEY_ARN,
        }),
      );
      console.info("Backup completed");
    } catch (_error) {
      // Driver, CLI and SDK errors may contain database credentials or records.
      throw new Error(
        "Backup failed; inspect configuration and service health",
      );
    } finally {
      stream?.destroy();
      await fs.rm(folder, { recursive: true, force: true });
    }
  };
}
exports.createBackup = createBackup;
exports.handler = createBackup();
