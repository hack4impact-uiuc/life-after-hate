#!/usr/bin/env sh
source .env && \
sam deploy \
  --template-file template.yml \
  --stack-name lah-dev-db-backup \
  --capabilities CAPABILITY_IAM \
  --s3-bucket ${CLOUDFORMATION_BUCKET} \
  --parameter-overrides \
    S3Bucket=${MONGODB_BACKUP_BUCKET} \
    MongoURI=${MONGODB_GLOBAL_URI} \
    EmailAddress=${NOTIFICATION_EMAIL_ADDRESS}
