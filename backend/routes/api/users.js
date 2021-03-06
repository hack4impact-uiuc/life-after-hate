const express = require("express");
const beeline = require("honeycomb-beeline");
const { filterSensitiveInfo } = require("../../utils/user-utils");
const router = express.Router();
const User = require("../../models/User");
const { celebrate, Joi } = require("celebrate");
const errorWrap = require("../../utils/error-wrap");
const {
  requireAdminStatus,
  requirePendingStatus,
} = require("../../utils/auth-middleware");
const { roleEnum } = require("../../models/User");
// Filters down the user information into just what's needed

// get all users
router.get(
  "/",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const span = beeline.startSpan({ name: "User Fetch" });
    const users = await User.find({}).sort({ firstName: "asc" });
    beeline.finishSpan(span);
    res.json({
      code: 200,
      result: users.map(filterSensitiveInfo),
      success: true,
    });
  })
);

// get current users (partial info only)
router.get("/current", requirePendingStatus, (req, res) => {
  const userInfo = req.user;
  res.json({
    code: 200,
    result: filterSensitiveInfo(userInfo),
    success: true,
  });
});

// get all users of given role
router.get(
  "/role/:role",
  requireAdminStatus,
  celebrate({
    params: {
      role: Joi.string()
        .valid(...Object.values(roleEnum))
        .insensitive()
        .required(),
    },
  }),
  errorWrap(async (req, res) => {
    const role = req.params.role.toUpperCase();
    const span = beeline.startSpan({ name: "User Fetch" });
    const users = await User.find({ role: role });
    beeline.finishSpan(span);
    res.json({
      code: 200,
      result: users.map(filterSensitiveInfo),
      success: true,
    });
  })
);

// get one user
router.get(
  "/:user_id",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const userId = req.params.user_id;
    const span = beeline.startSpan({ name: "User Fetch" });
    const user = await User.findById(userId);
    beeline.finishSpan(span);
    res.json({
      code: 200,
      result: filterSensitiveInfo(user),
      success: true,
    });
  })
);

// create new user
router.post(
  "/",
  requireAdminStatus,
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      oauthId: Joi.string().required(),
      propicUrl: Joi.string(),
      role: Joi.string().default(roleEnum.PENDING),
      title: Joi.string(),
      location: Joi.string().required(),
      email: Joi.string().required(),
    }),
  }),
  errorWrap(async (req, res) => {
    const data = req.body;
    const span = beeline.startSpan({ name: "User Create" });
    const newUser = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      oauthId: data.oauthId,
      propicUrl: data.propicUrl,
      role: data.role,
      title: data.title,
      location: data.location,
      email: data.email,
    });
    await newUser.save();
    beeline.finishSpan(span);
    res.json({
      code: 200,
      message: "User Successfully Created",
      success: true,
    });
  })
);

// set role and title
router.patch(
  "/:user_id",
  requireAdminStatus,
  celebrate({
    body: Joi.object().keys({
      role: Joi.string().required(),
      title: Joi.string().allow("").default(""),
    }),
  }),
  errorWrap(async (req, res) => {
    const data = req.body;
    const userId = req.params.user_id;

    const span = beeline.startSpan({ name: "User Update" });
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: data.role, title: data.title } },
      { new: true }
    );
    beeline.finishSpan(span);
    const ret = user
      ? {
          code: 200,
          message: "User Role Updated Successfully",
          success: true,
        }
      : {
          code: 404,
          message: "User Not Found",
          success: false,
        };
    res.status(ret.code).json(ret);
  })
);

// delete user
router.delete(
  "/:user_id",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const userId = req.params.user_id;
    const span = beeline.startSpan({ name: "User Delete" });
    const user = await User.findByIdAndRemove(userId);
    beeline.finishSpan(span);
    const ret = user
      ? {
          code: 200,
          message: "User deleted successfully",
          success: true,
        }
      : {
          code: 404,
          message: "User not found",
          success: false,
        };
    res.status(ret.code).json(ret);
  })
);

module.exports = router;
