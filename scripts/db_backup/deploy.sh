#!/usr/bin/env sh
sam deploy \ # serverless application model tool to deploy cloudformation stacks
  --template-file template.yml \ # description of entire architecture (except S3, not supported)
  --stack-name lah-dev-db-backup \
  --capabilities CAPABILITY_IAM \
  --s3-bucket ${CLOUDFORMATION_BUCKET} \ # where deployment artifacts are stored
  --parameter-overrides \ # environment variables to be passed in, see template
    S3Bucket=${MONGODB_BACKUP_BUCKET} \
    MongoURI=${MONGODB_GLOBAL_URI}
