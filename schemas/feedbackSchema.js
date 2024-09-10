const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "anonymous",
    required: true,
  },
  displayName: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
