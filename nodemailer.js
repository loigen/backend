// nodemailer.js

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { getRefreshToken } = require("./fetchRefresh");
const { auth } = require("firebase-admin");
const { refreshToken } = require("firebase-admin/app");
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
  const subject = "SAFEPLACE VERIFICATION CODE";
  const html = `
      <p>Hi ${to}, here's your verification code</p>
      <b> OTP: ${otp}</b>
      <p>Thank you</p>
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
  const subject = "Appointment Reminder";
  const html = `
      <p>Hi ${firstname},</p>
      <p>This is a reminder that your appointment is scheduled for <strong>${date}</strong> at <strong>${time}</strong>.</p>
      <p>Thank you</p>
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
      <p>Hi ${username},</p>
      <p>You requested to reset your password. Click the link below to reset your password:</p>
      <a href="${link}">Reset Password</a>
      <p>This link will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
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
