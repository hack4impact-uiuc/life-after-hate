var router = require("express").Router();

/*
 * Put all your routes here!
 * When you add a new route file,
 * you must include it for it to be accessible under /api/
 * For example, here, a route matching "/" in "sample.js"
 * will correspond to endpoint /api/sample,
 * And a route matching "/info" in "sample.js"
 * will correspond to endpoint /api/sample/info
 */

router.use("/sample", require("./sample"));
router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/resources", require("./resources"));
if (process.env.NODE_ENV !== "production" && process.env.BYPASS_AUTH_ROLE) {
  router.use("/test", require("./test"));
}

module.exports = router;
