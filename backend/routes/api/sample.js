var router = require("express").Router();

// Corresopnds to a GET request to /api/sample/
router.get("/", function(req, res) {
  res.send("Hello world!");
});

module.exports = router;
