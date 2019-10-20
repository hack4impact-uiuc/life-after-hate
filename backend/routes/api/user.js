const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// get all users
router.get("/", async (req, res) => {
  const users = await User.find({});
  res.json({
    code: 200,
    result: users,
    success: true
  });
});

// create new user
router.post("/", async (req, res) => {
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
});

// set role
router.put("/setRole/:user_id", async (req, res) => {
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
  res.json(ret);
});

// approve user
router.put("/approve/:user_id", async (req, res) => {
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
  res.json(ret);
});

// delete user
router.delete("/:user_id", async (req, res) => {
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
  res.json(ret);
});

module.exports = router;
