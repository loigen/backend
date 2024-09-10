const { json } = require("express");
const Feedback = require("../schemas/feedbackSchema");

exports.submitFeedback = async (req, res) => {
  const { rating, feedback, email, displayName } = req.body;

  if (rating == null || feedback == null) {
    return res
      .status(400)
      .json({ message: "Rating and feedback are required." });
  }

  try {
    const newFeedback = new Feedback({
      rating,
      feedback,
      email: email || "anonymous",
      displayName,
    });

    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback: savedFeedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Feedback retrieved successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
