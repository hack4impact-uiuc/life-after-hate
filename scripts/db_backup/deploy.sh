#!/bin/sh
aws s3api create-bucket --bucket $MONGODB_BACKUP_BUCKET --region us-east-1 && \
sam deploy --template-file template.yml --stack-name lah-db-backup \
  --capabilities CAPABILITY_IAM --s3-bucket $MONGODB_BACKUP_BUCKET \
  --parameter-overrides S3Bucket=$MONGODB_BACKUP_BUCKET MongoURI=$DB_URI
