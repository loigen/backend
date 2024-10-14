const express = require("express");
const {
  signup,
  login,
  logout,
  forgotpassword,
  resetpassword,
  updatePassword,
  verifyOTP,
  Adminlogin,
} = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");
const { post } = require("./authRoutes");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", authenticateToken, logout);

router.post("/forgot-password", forgotpassword);

router.get("/reset-password/:id/:token", resetpassword);

router.post("/reset-password/:id/:token", updatePassword);

router.post("/verify-otp", verifyOTP);
router.post("/admin-login", Adminlogin);
module.exports = router;
