const express = require("express");
const Boom = require("@hapi/boom");
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

router.param("user_id", (req, res, next, id) => {
  if (!/^[a-fA-F0-9]{24}$/.test(id))
    return res
      .status(400)
      .json({ code: 400, success: false, message: "Invalid user ID" });
  next();
});

// get all users
router.get(
  "/",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const users = await User.find({}).sort({ firstName: "asc" });

    res.json({
      code: 200,
      result: users.map(filterSensitiveInfo),
      success: true,
    });
  }),
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

    const users = await User.find({ role: role });

    res.json({
      code: 200,
      result: users.map(filterSensitiveInfo),
      success: true,
    });
  }),
);

// get one user
router.get(
  "/:user_id",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const userId = req.params.user_id;

    const user = await User.findById(userId);
    if (!user) throw Boom.notFound();

    res.json({
      code: 200,
      result: filterSensitiveInfo(user),
      success: true,
    });
  }),
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
      role: Joi.string()
        .valid(...Object.values(roleEnum))
        .default(roleEnum.PENDING),
      title: Joi.string(),
      location: Joi.string().required(),
      email: Joi.string().email().max(254).required(),
    }),
  }),
  errorWrap(async (req, res) => {
    const data = req.body;

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

    res.json({
      code: 200,
      message: "User Successfully Created",
      success: true,
    });
  }),
);

// set role and title
router.patch(
  "/:user_id",
  requireAdminStatus,
  celebrate({
    body: Joi.object().keys({
      role: Joi.string()
        .valid(...Object.values(roleEnum))
        .required(),
      title: Joi.string().allow("").default(""),
    }),
  }),
  errorWrap(async (req, res) => {
    const data = req.body;
    const userId = req.params.user_id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: data.role, title: data.title } },
      { returnDocument: "after", runValidators: true },
    );

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
  }),
);

// delete user
router.delete(
  "/:user_id",
  requireAdminStatus,
  errorWrap(async (req, res) => {
    const userId = req.params.user_id;

    const user = await User.findByIdAndDelete(userId);

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
  }),
);

module.exports = router;
