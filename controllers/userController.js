const User = require("../schemas/User");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");

// get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

// admin function
exports.adminFunction = async (req, res) => {
  try {
    res.status(200).json({ message: "Admin function executed successfully" });
  } catch (error) {
    console.error("Error in adminFunction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstname, lastname, email, password } = req.body;

    let updatedUserData = { firstname, lastname, email };

    if (password) {
      updatedUserData.password = password;
    }

    if (req.file) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "profile_pictures",
          public_id: `${userId}_profile`,
        });

        updatedUserData.profilePicture = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Error uploading file" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Error updating user profile" });
  }
};

exports.uploadBlogPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "blog_photos",
      public_id: `${Date.now()}_${req.file.originalname}`,
    });

    res.status(200).json({ success: true, url: uploadResult.secure_url });
  } catch (error) {
    console.error("Error uploading blog photo to Cloudinary:", error);
    res.status(500).json({ error: "Error uploading blog photo" });
  }
};

// count non-admin users
exports.countNonAdminUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: { $ne: "admin" } });

    res.status(200).json({ count: userCount });
  } catch (error) {
    console.error("Error counting non-admin users:", error);
    res.status(500).json({ error: "Error counting non-admin users" });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide both current and new passwords" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Error changing password" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password"
    );

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Error fetching all users" });
  }
};

// Block a user (Admin only)
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Error blocking user" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Error unblocking user" });
  }
};

exports.getAll = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.findUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};
