const router = require("express").Router();

router.get("/", (req, res) => {
  req.logout();
  res.send({
    code: 200,
    message: "You have been signed out!",
    success: true,
  });
});

module.exports = router;
