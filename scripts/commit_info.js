const { commitInfo } = require("@cypress/commit-info");
commitInfo().then(info => {
  console.log(`COMMIT_INFO_BRANCH=${JSON.stringify(info.branch)}`);
  console.log(`COMMIT_INFO_MESSAGE=${JSON.stringify(info.message)}`);
  console.log(`COMMIT_INFO_EMAIL=${JSON.stringify(info.email)}`);
  console.log(`COMMIT_INFO_AUTHOR=${JSON.stringify(info.author)}`);
  console.log(`COMMIT_INFO_SHA=${JSON.stringify(info.sha)}`);
  console.log(`COMMIT_INFO_REMOTE=${JSON.stringify(info.remote)}`);
  // info object will have properties
  // branch
  // message
  // email
  // author
  // sha
  // timestamp (in seconds since epoch)
  // remote
});
