const router = require("express").Router();
const { requireVolunteerStatus } = require("../../../utils/auth-middleware");

router.get("/", requireVolunteerStatus, (req, res) => {
  req.logout();
  res.send({
    code: 200,
    message: "You have been signed out!",
    success: true,
  });
});

module.exports = router;
