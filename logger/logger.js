const fs = require("fs");
const path = require("path");

// Path to the log file
const logFilePath = path.join(__dirname, "../logs/activity-log.txt");

// Logger function
const logUserActivity = (userId, event, status) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - UserID: ${userId}, Event: ${event}, Status: ${status}\n`;

  // Append the log entry to the file
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

module.exports = { logUserActivity };
