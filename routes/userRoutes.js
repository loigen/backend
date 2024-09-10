const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const checkAdmin = require("../middlewares/checkAdmin");
const authenticateToken = require("../middlewares/authenticateToken");
const { uploadProfilePicture } = require("../middlewares/multer");

router.get("/profile", authenticateToken, userController.getProfile);

router.put(
  "/updateprofile",
  [authenticateToken, uploadProfilePicture.single("profile_picture")],
  userController.updateProfile
);

router.post(
  "/admin",
  [authenticateToken, checkAdmin],
  userController.adminFunction
);

router.get("/countNonAdminUsers", userController.countNonAdminUsers);

router.post(
  "/changepassword",
  authenticateToken,
  userController.changePassword
);

router.get("/users", [authenticateToken], userController.getAllUsers);

router.patch("/users/:id/block", [authenticateToken], userController.blockUser);

router.patch(
  "/users/:id/unblock",
  [authenticateToken],
  userController.unblockUser
);

router.get("/all", authenticateToken, userController.getAll);

router.post("/logout", authenticateToken, authController.logout);

router.get("/find/:userId", userController.findUser);

router.get("/", userController.getUser);
module.exports = router;
