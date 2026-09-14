# Encrypted MongoDB backups

The Lambda runs on Node 24, reads a Secrets Manager secret containing `{"uri":"mongodb+srv://..."}`, creates a gzip MongoDB archive, and uploads it under `backups/` with SSE-KMS encryption. It awaits completion and cleans only its own temporary directory on success or failure. Raw database/SDK/CLI errors are never logged.

Required infrastructure:

- A reviewed, maintained x86_64 Linux MongoDB Database Tools Lambda layer containing `/opt/bin/mongodump`. The old repository binary was removed.
- A private, versioned S3 bucket with Block Public Access and an appropriate retention policy.
- A dedicated KMS key whose policy permits the Lambda's generated role to use the key.
- A Secrets Manager secret holding a read-only backup account URI. If the secret uses its own customer-managed KMS key, separately grant the function decrypt access to that key. The template grants decrypt only for the backup key.
- Network access from the function to the database. Configure VPC connectivity/security groups in your deployment when using private database endpoints.

Install and test with `npm ci --prefix backup --ignore-scripts` and `npm --prefix backup test`. Export `MONGO_SECRET_ARN`, `MONGODB_BACKUP_BUCKET`, `BACKUP_KMS_KEY_ARN`, `MONGO_TOOLS_LAYER_ARN`, and `NOTIFICATION_EMAIL_ADDRESS`, then review `template.yml` and run `./deploy.sh` from this directory when ready to deploy. No database password is passed through CloudFormation parameters.

Use AWS SAM's `sam build` so only the Node package and configured layer enter the function.

Test restores with `mongorestore --gzip --archive=<downloaded archive>` into an isolated database. Verify collection counts, representative records, roles and indexes. A successful upload alone does not establish that a backup is restorable. The function has a five-minute timeout; confirm it fits your dataset and use a longer-running backup service if necessary.
