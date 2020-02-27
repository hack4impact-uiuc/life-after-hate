const { commitInfo } = require("@cypress/commit-info");
commitInfo().then(info => {
  console.log(`COMMIT_INFO_BRANCH=${process.env.GITHUB_REF.substring(11)}`);
  console.log(
    `COMMIT_INFO_MESSAGE=${JSON.stringify(
      info.message.replace(/(\r\n|\n|\r)/gm, "")
    ).slice(1, -1)}`
  );
  console.log(`COMMIT_INFO_EMAIL=${JSON.stringify(info.email).slice(1, -1)}`);
  console.log(`COMMIT_INFO_AUTHOR=${JSON.stringify(info.author).slice(1, -1)}`);
  console.log(`COMMIT_INFO_SHA=${JSON.stringify(info.sha).slice(1, -1)}`);
  console.log(`COMMIT_INFO_REMOTE=${JSON.stringify(info.remote).slice(1, -1)}`);
});
