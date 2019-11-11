const router = require("express").Router();
const auth = require("../../../utils/auth-middleware");

router.get("/", auth.isAuthenticated, (req, res) => {
  req.logout();
  res.send({
    code: 200,
    message: "You have been signed out!",
    success: true
  });
});

module.exports = router;
