const { sendEmailOTP } = require("./nodemailer");
const sendOTP = async (recipientEmail, otp) => {
  try {
    const response = await sendEmailOTP(recipientEmail, otp);
    console.log("Email sent:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Example usage
sendOTP("22104626@usc.edu.ph", "123456");
