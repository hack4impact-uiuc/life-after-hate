const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
const errorWrap = require("../../utils/error-wrap");
const { roleEnum } = require("../../models/User");

// get all users
router.get(
  "/setRole/:role",
  celebrate({
    params: {
      role: Joi.string()
        .valid(...Object.values(roleEnum))
        .insensitive()
        .required()
    }
  }),
  errorWrap((req, res) => {
    req.app.locals.mockRole = req.params.role;
    res.json({
      code: 200,
      result: `Mock user changed to ${req.app.locals.mockRole}.`,
      success: true
    });
  })
);

module.exports = router;
