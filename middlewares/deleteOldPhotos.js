const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

const directory = path.join("uploads", "profile_pictures");
const receiptDirectory = path.join("uploads", "receipts");

// Cron job to auto delete photos every 12:00 AM
// Note: I did this because I'm afraid nga mapuno ang Service namo and dle na maka upload
cron.schedule("0 0 * * *", () => {
  console.log("Running task to delete old photos at 12:00 AM");

  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err.message}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${file}: ${err.message}`);
        } else {
          console.log(`Deleted file: ${file}`);
        }
      });
    });
  });
});

console.log(
  "Cron job scheduled to delete old profile pictures  every day at 12:00 AM"
);

cron.schedule("0 0 * * *", () => {
  console.log("Running task to delete old receipts at 12:00 AM");

  fs.readdir(receiptDirectory, (err, files) => {
    if (err) {
      console.error(`Error reading receipt directory: ${err.message}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(receiptDirectory, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting receipt file ${file}: ${err.message}`);
        } else {
          console.log(`Deleted receipt file: ${file}`);
        }
      });
    });
  });
});

console.log("Cron job scheduled to delete old receipts every day at 12:00 AM");
