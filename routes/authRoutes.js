const express = require("express");
const {
  signup,
  login,
  logout,
  forgotpassword,
  resetpassword,
  updatePassword,
  Adminlogin,
  verifyOtp,
} = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", authenticateToken, logout);

router.post("/forgot-password", forgotpassword);

router.get("/reset-password/:id/:token", resetpassword);

router.post("/reset-password/:id/:token", updatePassword);

router.post("/AdminLogin", Adminlogin);

router.post("/verify-otp", verifyOtp);

module.exports = router;
