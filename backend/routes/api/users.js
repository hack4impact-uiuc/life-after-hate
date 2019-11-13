const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const { celebrate, Joi } = require("celebrate");
const auth = require("../../utils/auth-middleware");

// Filters down the user information into just what's needed
const filterSensitiveInfo = userInfo => {
  const { _id, firstName, lastName, role, location, propicUrl } = userInfo;
  return { id: _id, firstName, lastName, role, location, propicUrl };
};

// get all users
router.get("/", auth.isAdmin, async (req, res) => {
  const users = await User.find({});
  res.json({
    code: 200,
    result: users.map(filterSensitiveInfo),
    success: true
  });
});

// get current users (partial info only)
router.get("/current", auth.isAuthenticated, (req, res) => {
  const user_info = req.user;
  res.json({
    code: 200,
    result: filterSensitiveInfo(user_info),
    success: true
  });
});

// get one user
router.get("/:user_id", auth.isAdmin, async (req, res) => {
  const userId = req.params.user_id;
  const user = await User.findById(userId);
  res.json({
    code: 200,
    result: filterSensitiveInfo(user),
    success: true
  });
});

// create new user
router.post(
  "/",
  auth.isAdmin,
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      oauthId: Joi.string().required(),
      propicUrl: Joi.string(),
      isApproved: Joi.boolean().default(false),
      role: Joi.string().required(),
      location: Joi.string().required()
    })
  }),
  async (req, res) => {
    const data = req.body;
    const newUser = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      oauthId: data.oauthId,
      propicUrl: data.propicUrl,
      role: data.role,
      location: data.location
    });
    await newUser.save();
    res.json({
      code: 200,
      message: "User Successfully Created",
      success: true
    });
  }
);

// set role
router.put(
  "/:user_id/role",
  auth.isAdmin,
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      oauthId: Joi.string(),
      propicUrl: Joi.string(),
      isApproved: Joi.boolean(),
      role: Joi.string().required(),
      location: Joi.string()
    })
  }),
  async (req, res) => {
    const data = req.body;
    const userId = req.params.user_id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: data.role } },
      { new: true }
    );
    const ret = user
      ? {
          code: 200,
          message: "User Role Updated Successfully",
          success: true
        }
      : {
          code: 404,
          message: "User Not Found",
          success: false
        };
    res.status(ret.code).json(ret);
  }
);

// approve user
router.put(
  "/:user_id/approve",
  auth.isAdmin,
  celebrate({
    body: Joi.object().keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      oauthId: Joi.string(),
      propicUrl: Joi.string(),
      isApproved: Joi.boolean(),
      role: Joi.string(),
      location: Joi.string()
    })
  }),
  async (req, res) => {
    const userId = req.params.user_id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isApproved: true } },
      { new: true }
    );
    const ret = user
      ? {
          code: 200,
          message: "User Approved Successfully",
          success: true
        }
      : {
          code: 404,
          message: "User Not Found",
          success: false
        };
    res.status(ret.code).json(ret);
  }
);

// delete user
router.delete("/:user_id", auth.isAdmin, async (req, res) => {
  const userId = req.params.user_id;
  const user = await User.findByIdAndRemove(userId);
  const ret = user
    ? {
        code: 200,
        message: "User deleted successfully",
        success: true
      }
    : {
        code: 404,
        message: "User not found",
        success: false
      };
  res.status(ret.code).json(ret);
});

module.exports = router;
