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
    const {
      firstname,
      lastname,
      email,
      middleName,
      Profession,
      EducationBackground,
      Religion,
      sex,
    } = req.body;

    // Define only the fields you want to update
    let updatedUserData = {
      firstname,
      lastname,
      email,
      middleName,
      Profession,
      EducationBackground,
      Religion,
      sex,
    };

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
    }).select("-password -role -status -otp -otpExpiration");

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
    const userId = req.params.id; // Assuming the user ID is passed as a URL parameter

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
    // Retrieve the ID of the logged-in user from the request object
    const loggedInUserId = req.user.id;

    // Find all users except the one who is logged in
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password" // Exclude the password field from the response
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
    const user = await User.find().select(
      "-password -otp" // Exclude the password field from the response
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

exports.addAdminUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      middleName,
      Profession,
      EducationBackground,
      Religion,
      email,
      sex,
      password,
      birthdate,
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin user
    const newUser = new User({
      firstname,
      lastname,
      middleName,
      Profession,
      EducationBackground,
      Religion,
      email,
      sex,
      password: hashedPassword,
      role: "admin",
      birthdate,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "Admin user created successfully!", user: newUser });
  } catch (error) {
    // Log the error to the console for debugging
    console.error("Error creating admin user:", error);

    // Send a detailed error message to the client
    res.status(500).json({
      message: "An error occurred while creating the admin user.",
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined, // Show stack trace only in development
      },
    });
  }
};
exports.getAdminUsers = async (req, res) => {
  try {
    const adminUsers = await User.find({ role: "admin" });

    // If no admin users are found, return a 404 status
    if (adminUsers.length === 0) {
      return res.status(404).json({ message: "No admin users found." });
    }

    // Return the found admin users
    return res.status(200).json(adminUsers);
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching admin users:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
