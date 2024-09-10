const express = require("express");
const feedbackController = require("../controllers/FeedbackController");

const router = express.Router();
router.post("/submit-feedback", feedbackController.submitFeedback);
router.get("/feedback", feedbackController.getFeedback);

module.exports = router;
