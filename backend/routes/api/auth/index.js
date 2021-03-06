var router = require("express").Router();

/*
 * Put all your auth routes here!
 * When you add a new route file,
 * you must include it for it to be accessible under /api/
 * For example, here, a route matching "/" in "sample.js"
 * will correspond to endpoint /api/sample,
 * And a route matching "/info" in "sample.js"
 * will correspond to endpoint /api/sample/info
 */

router.use("/login", require("./login"));
router.use("/logout", require("./logout"));

module.exports = router;
