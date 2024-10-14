const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../schemas/User");
const validator = require("validator");

const { sendEmailOTP } = require("../nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};
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
    return res.status(400).json({ error: errorMessage });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    req.session.token = token;

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the OTP matches and if it has not expired
    if (user.otp === otp && user.otpExpiration > new Date()) {
      // OTP is valid
      await user.clearOtp(); // Clear the OTP and expiration in the database
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      // OTP is invalid or has expired
      res.status(400).json({ error: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.Adminlogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Generate an OTP
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

    // Save OTP and expiration in the user document
    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    // Send the OTP to the user's email
    await sendEmailOTP(user.email, otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email", role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
//Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};

exports.forgotpassword = async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User not existed" });
    }

    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `https://bacUser.kend-production-c8da.up.railway.app/auth/reset-password/${oldUser._id}/${token}`;
    return res.json({ status: "success", link });
  } catch (error) {
    console.error(error);
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
      return res.status(404).json({ status: "User not found" });
    }

    const secret = JWT_SECRET + oldUser.password;
    jwt.verify(token, secret);

    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );

    return res.json({ status: "Password Updated" });
  } catch (error) {
    return res.status(400).json({ status: "Something went wrong" });
  }
};
