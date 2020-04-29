"use strict";

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
    console.error("Did not receieve the MongoDB URI!");
    return 1;
  }
  if (!s3Bucket) {
    console.error("Could not create the S3 bucket!");
    return 1;
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
      console.error(error);
      return 1;
    }

    exec(`./mongodump --uri=${mongoUri} --out=${folder}`, (error) => {
      if (error) {
        console.error("Mongodump failed!");
        console.error(error);
        return 1;
      }

      ZipFolder.zipFolder(folder, zipfile, (error) => {
        if (error) {
          console.error("ZIP failed!");
          console.error(error);
          return 1;
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
                console.error(error);
                return 1;
              }

              console.log("Backup completed successfully!");
              return 0;
            }
          );
        });
      });
    });
  });
};
