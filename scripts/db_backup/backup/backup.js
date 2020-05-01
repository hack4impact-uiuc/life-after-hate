const exec = require("child_process").exec;
const AWS = require("aws-sdk");
const fs = require("fs");
const dayjs = require("dayjs");
const ZipFolder = require("zip-a-folder");

const mongoUri = process.env.MONGO_URI;
const s3Bucket = new AWS.S3({
  params: { Bucket: process.env.S3_BUCKET },
});

exports.handler = (event, context) => {
  console.log(`Backup triggered by event: ${event} with context: ${context}.`);

  if (!mongoUri) {
    throw new Error("Did not receieve the MongoDB URI!");
  }
  if (!s3Bucket) {
    throw new Error("Could not create the S3 bucket!");
  }

  console.log(
    `Backing up database ${mongoUri} to S3 bucket ${process.env.S3_BUCKET}`
  );

  const backupName = `backup_${dayjs().format("MM-DD-YYYY_HH-mm-ss")}`;
  const folder = `/tmp/${backupName}/`;
  const zipfile = `/tmp/${backupName}.zip`;

  // clear the /tmp directory in case anything is left from a previous execution
  exec("rm -rf /tmp/*", (error) => {
    if (error) {
      console.error("Could not clear /tmp directory!");
      throw new Error(error);
    }

    exec(`./mongodump --gzip --uri=${mongoUri} --out=${folder}`, (error) => {
      if (error) {
        console.error("Mongodump failed!");
        throw new Error(error);
      }

      ZipFolder.zipFolder(folder, zipfile, (error) => {
        if (error) {
          console.error("ZIP failed!");
          throw new Error(error);
        }

        fs.readFile(zipfile, (error, data) => {
          s3Bucket.upload(
            {
              Key: `${backupName}.zip`,
              Body: data,
              ContentType: "application/zip",
            },
            (error) => {
              if (error) {
                console.error("Upload to S3 failed!");
                throw new Error(error);
              }

              console.log("Backup completed successfully!");
            }
          );
        });
      });
    });
  });
};
