const mongoose = require("mongoose");
const { save } = require("node-cron/src/storage");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  middleName: { type: String, required: false },
  Profession: { type: String, required: true },
  EducationBackground: { type: String, required: true },
  Religion: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  sex: { type: String, required: true, enum: ["Male", "Female"] },
  status: { type: String, default: "active" },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
  birthdate: { type: Date, required: true },
  otp: { type: String, default: null },
  otpExpiration: { type: Date, default: null },
});

userSchema.methods.getGravatarUrl = function () {
  return `https://res.cloudinary.com/dovlzzudf/image/upload/v1723710022/profile_pictures/66a367e4a828e02e834561e0_profile.jpg`;
};

userSchema.pre("save", function (next) {
  if (!this.profilePicture) {
    this.profilePicture = this.getGravatarUrl();
  }
  next();
});
userSchema.methods.clearOtp = function () {
  this.otp = null;
  this.otpExpiration = null;
  return this.save();
};
const User = mongoose.model("User", userSchema);

module.exports = User;
