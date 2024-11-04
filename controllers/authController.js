const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../schemas/User");
const validator = require("validator");
const crypto = require("crypto");
const { logUserActivity } = require("../logger/logger.js");
const { sendEmailOTP, sendPasswordResetEmail } = require("../nodemailer");
const LOCKOUT_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const MAX_ATTEMPTS = 5;
const JWT_SECRET = process.env.JWT_SECRET;
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}
// Signup Validator
const validateSignupData = (
  firstname,
  lastname,
  email,
  password,
  repeatPassword,
  birthdate,
  sex,
  Profession,
  EducationBackground,
  Religion
) => {
  if (
    !firstname ||
    !lastname ||
    !email ||
    !password ||
    !repeatPassword ||
    !birthdate ||
    !sex ||
    !Profession ||
    !EducationBackground ||
    !Religion
  ) {
    return "All fields are required";
  }
  if (password !== repeatPassword) {
    return "Passwords do not match";
  }
  if (!validator.isEmail(email)) {
    return "Invalid email";
  }
  if (!validator.isISO8601(birthdate, { strict: true })) {
    return "Invalid birthdate";
  }
  if (!["Male", "Female"].includes(sex)) {
    return "Sex must be either 'Male' or 'Female'";
  }

  return null;
};

exports.signup = async (req, res) => {
  const {
    firstname,
    lastname,
    middleName,
    Profession,
    EducationBackground,
    Religion,
    email,
    password,
    repeatPassword,
    birthdate,
    sex,
  } = req.body;

  const errorMessage = validateSignupData(
    firstname,
    lastname,
    email,
    password,
    repeatPassword,
    birthdate,
    sex,
    Profession,
    EducationBackground,
    Religion
  );

  if (errorMessage) {
    logUserActivity(email, "Signup Attempt", "Failed - " + errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logUserActivity(email, "Signup Attempt", "Failed - Email already exists");
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "jebBohol@gmail.com" ? "admin" : "user";

    const user = new User({
      firstname,
      lastname,
      middleName: middleName || "", // Optional field
      Profession,
      EducationBackground,
      Religion,
      email,
      password: hashedPassword,
      role,
      birthdate: new Date(birthdate),
      sex,
    });

    await user.save();
    logUserActivity(email, "Signup", "Success");
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("Error creating user:", error);
    logUserActivity(email, "Signup Attempt", "Failed - " + error.message);
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.Adminlogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      logUserActivity(
        email,
        "Admin Login Attempt",
        "Failed - Email and password are required"
      );
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logUserActivity(
        email,
        "Admin Login Attempt",
        "Failed - User doesn't exist"
      );
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Check if user is in lockout period
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const remainingTime = Math.ceil(
        (user.lockoutUntil - Date.now()) / (60 * 1000)
      ); // in minutes
      return res.status(403).json({
        error: `Account locked. Try again in ${remainingTime} minutes.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;

      if (user.failedAttempts >= MAX_ATTEMPTS) {
        // Set lockout time for 3 hours
        user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
        user.failedAttempts = 0; // Reset attempts after lockout
        await user.save();

        logUserActivity(
          email,
          "Admin Login Attempt",
          "Failed - Account locked after too many attempts"
        );
        return res.status(403).json({
          error: "Too many failed attempts. Account locked for 3 hours.",
        });
      } else {
        await user.save();
        logUserActivity(
          email,
          "Admin Login Attempt",
          "Failed - Wrong password"
        );
        return res.status(401).json({ error: "Wrong password" });
      }
    }

    // Reset failed attempts on successful login
    user.failedAttempts = 0;
    user.lockoutUntil = null;

    // Generate and set OTP for admin verification
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    // Send OTP to admin email
    await sendEmailOTP(user.email, otp);
    logUserActivity(email, "Admin Login", "OTP sent to email");

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Admin login error:", error);
    logUserActivity(
      email,
      "Admin Login Attempt",
      "Failed - Internal server error"
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      logUserActivity(
        email,
        "User Login Attempt",
        "Failed - Email and password are required"
      );
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logUserActivity(
        email,
        "User Login Attempt",
        "Failed - User doesn't exist"
      );
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logUserActivity(email, "User Login Attempt", "Failed - Wrong password");
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (user.role === "admin") {
      logUserActivity(
        email,
        "User Login Attempt",
        "Failed - Admins are not allowed to log in"
      );
      return res
        .status(403)
        .json({ error: "Admin user, please use the admin login form!" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    req.session.token = token;

    logUserActivity(email, "User Login", "Success");
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    logUserActivity(
      email,
      "User Login Attempt",
      "Failed - Internal server error"
    );
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

//Logout
exports.logout = (req, res) => {
  const email = req.user?.email; // Assuming you store user email in the session
  req.session.destroy((err) => {
    if (err) {
      logUserActivity(email, "Logout Attempt", "Failed - " + err.message);
      return res.status(500).json({ error: "Failed to logout" });
    }
    logUserActivity(email, "Logout", "Success");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.forgotpassword = async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      logUserActivity(
        email,
        "Forgot Password Attempt",
        "Failed - User not existed"
      );
      return res.json({ status: "User not existed" });
    }

    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `https://backend-production-c8da.up.railway.app/auth/reset-password/${oldUser._id}/${token}`;

    await sendPasswordResetEmail(email, oldUser.email, link);
    logUserActivity(email, "Forgot Password", "Success");

    return res.json({
      status: "success",
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error(error);
    logUserActivity(
      email,
      "Forgot Password Attempt",
      "Failed - " + error.message
    );
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
};

exports.resetpassword = async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);

  try {
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.status(404).render("error", { message: "User not found" });
    }

    const secret = JWT_SECRET + oldUser.password;

    const decoded = jwt.verify(token, secret);

    return res.render("index", { email: decoded.email });
  } catch (error) {
    return res.status(400).render("error", { message: "Verification failed" });
  }
};
exports.updatePassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.status(404).send(`
        <html>
          <body>
            <h1>User not found</h1>
            <a href="https://frontend-loigens-projects.vercel.app">Return to homepage</a>
          </body>
        </html>
      `);
    }

    const secret = JWT_SECRET + oldUser.password;
    jwt.verify(token, secret);

    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );

    return res.send(`
      <html>
        <body>
          <h1>Password Updated Successfully</h1>
          <a href="https://frontend-loigens-projects.vercel.app">Login Here</a>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(400).send(`
      <html>
        <body>
          <h1>Something went wrong</h1>
          <a href="https://frontend-loigens-projects.vercel.app">Return to homepage</a>
        </body>
      </html>
    `);
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check OTP and expiration
    if (user.otp !== otp || user.otpExpiration < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and expiration after successful verification
    await user.clearOtp();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    req.session.token = token; // Store token in session

    // Return token in the response for frontend use
    res.json({ message: "OTP verified successfully", token }); // Include token in response
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      logUserActivity(email, "Resend OTP Attempt", "Failed - User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    await user.save();

    // Send the new OTP to the user's email
    await sendEmailOTP(user.email, otp, user.lastname);
    logUserActivity(email, "Resend OTP", "Success - OTP sent");

    res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    logUserActivity(
      email,
      "Resend OTP Attempt",
      "Failed - Internal server error"
    );
    res.status(500).json({ message: "Internal server error" });
  }
};
