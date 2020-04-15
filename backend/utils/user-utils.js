const R = require("ramda");
const { renameKeys } = require("ramda-adjunct");
module.exports.filterSensitiveInfo = R.pipe(
  R.pick([
    "_id",
    "firstName",
    "lastName",
    "role",
    "title",
    "location",
    "propicUrl",
    "email",
  ]),
  renameKeys({ _id: "id" })
);
