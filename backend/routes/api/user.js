const express = require("express");
const router = express.Router();
const { User } = require("../../models/User");

// get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json({
    code: 200,
    result: users,
    success: true
  });
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
