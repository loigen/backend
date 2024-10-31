const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  datetime: { type: Date, required: true },
  status: { type: String, default: "free" },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
