#!/usr/bin/env bash
set -euo pipefail
# No database credentials are passed in command arguments or CloudFormation parameters.
: "${MONGO_SECRET_ARN:?}" "${MONGODB_BACKUP_BUCKET:?}" "${BACKUP_KMS_KEY_ARN:?}" "${MONGO_TOOLS_LAYER_ARN:?}" "${NOTIFICATION_EMAIL_ADDRESS:?}"
sam build --template-file template.yml
sam deploy --guided --template-file .aws-sam/build/template.yaml --capabilities CAPABILITY_IAM --parameter-overrides \
  "MongoSecretArn=$MONGO_SECRET_ARN" "S3Bucket=$MONGODB_BACKUP_BUCKET" \
  "BackupKmsKeyArn=$BACKUP_KMS_KEY_ARN" "MongoToolsLayerArn=$MONGO_TOOLS_LAYER_ARN" \
  "EmailAddress=$NOTIFICATION_EMAIL_ADDRESS"
