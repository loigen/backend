// nodemailer.js

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { getRefreshToken } = require("./fetchRefresh");

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const MY_EMAIL = process.env.TEST_EMAIL;

const sendEmailOTP = async (to, otp) => {
  const response = await getRefreshToken(
    REFRESH_TOKEN,
    CLIENT_ID,
    CLIENT_SECRET
  );
  const ACCESS_TOKEN = response.access_token;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MY_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const from = MY_EMAIL;
  const subject = "Your Verification Code";
  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">Dear ${to},</h2>
          <p>Your verification code is as follows:</p>
          <h3 style="background-color: #e7f3fe; padding: 10px; border: 1px solid #b3d4fc; color: #31708f;">OTP: ${otp}</h3>
          <p>Please use this code to complete your verification process.</p>
          <p>Thank you.</p>
      </div>
      `;

  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
};

const sendAppointmentReminder = async (to, firstname, date, time) => {
  const response = await getRefreshToken(
    REFRESH_TOKEN,
    CLIENT_ID,
    CLIENT_SECRET
  );
  const ACCESS_TOKEN = response.access_token;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MY_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const from = MY_EMAIL;
  const subject = "Appointment Reminder Notification";
  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">Dear ${firstname},</h2>
          <p>This is a reminder regarding your upcoming appointment scheduled for:</p>
          <p style="font-weight: bold;">Date: <strong>${date}</strong><br>Time: <strong>${time}</strong></p>
          <p>We look forward to seeing you.</p>
          <p>Thank you.</p>
      </div>
      `;

  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
};

const sendPasswordResetEmail = async (to, username, link) => {
  const response = await getRefreshToken(
    REFRESH_TOKEN,
    CLIENT_ID,
    CLIENT_SECRET
  );
  const ACCESS_TOKEN = response.access_token;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MY_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  const from = MY_EMAIL;
  const subject = "Password Reset Request";
  const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
          <h2 style="color: #333;">Dear ${username},</h2>
          <p>You have requested to reset your password. Please click the link below to proceed:</p>
          <p style="font-weight: bold;"><a href="${link}" style="color: #007bff; text-decoration: none;">Reset Your Password</a></p>
          <p>This link will expire in 5 minutes.</p>
          <p>If you did not make this request, please ignore this email.</p>
          <p>Thank you.</p>
      </div>
      `;

  return new Promise((resolve, reject) => {
    transport.sendMail({ from, subject, to, html }, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
};

module.exports = {
  sendEmailOTP,
  sendAppointmentReminder,
  sendPasswordResetEmail,
};
