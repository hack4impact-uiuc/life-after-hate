const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createBackup } = require("./backup");
const env = {
  MONGO_SECRET_ARN: "secret-arn",
  S3_BUCKET: "test-bucket",
  BACKUP_KMS_KEY_ARN: "kms-arn",
};
const uri =
  "mongodb://user:secret@localhost/database?authSource=admin&retryWrites=true&tls=true";
const secrets = {
  send: async () => ({ SecretString: JSON.stringify({ uri }) }),
};
test("uses private configuration, no shell, encrypted upload and scoped cleanup", async () => {
  let folder;
  let uploaded = false;
  const handler = createBackup({
    env,
    secrets,
    dump: async (executable, args) => {
      assert.equal(executable, "/opt/bin/mongodump");
      assert.ok(!args.join(" ").includes(uri));
      const config = args[0].slice("--config=".length);
      folder = path.dirname(config);
      assert.equal((await fs.stat(config)).mode & 0o777, 0o600);
      assert.equal(
        await fs.readFile(config, "utf8"),
        `uri: ${JSON.stringify(uri)}\n`,
      );
      await fs.writeFile(args[1].slice("--archive=".length), "test archive");
    },
    s3: {
      send: async ({ input }) => {
        assert.equal(input.ServerSideEncryption, "aws:kms");
        assert.equal(input.SSEKMSKeyId, env.BACKUP_KMS_KEY_ARN);
        let contents = "";
        for await (const part of input.Body) contents += part;
        assert.equal(contents, "test archive");
        uploaded = true;
      },
    },
  });
  await handler();
  assert.ok(uploaded);
  await assert.rejects(fs.access(folder));
});
test("sanitizes CLI failures and still cleans temporary credentials", async () => {
  let folder;
  const handler = createBackup({
    env,
    secrets,
    s3: {},
    dump: async (_exe, args) => {
      folder = path.dirname(args[0].slice("--config=".length));
      throw new Error(uri);
    },
  });
  await assert.rejects(handler(), (error) => !error.message.includes(uri));
  await assert.rejects(fs.access(folder));
});

test("rejects an insecure database secret before invoking the dump tool", async () => {
  let called = false;
  const handler = createBackup({
    env,
    s3: {},
    secrets: {
      send: async () => ({
        SecretString: JSON.stringify({
          uri: "mongodb://user:secret@db.example/database",
        }),
      }),
    },
    dump: async () => {
      called = true;
    },
  });
  await assert.rejects(handler());
  assert.equal(called, false);
});
