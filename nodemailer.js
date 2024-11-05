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

const sendEmailOTP = async (to, otp, lastname) => {
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
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f4; border-radius: 5px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 15px 0; background-color: #68B2A0; color: #ffffff; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0; text-transform: capitalize;">SafePlace Verification Code</h2>
        </div>
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 5px 5px;">
          <h3 style="color: #333333; text-transform: capitalize;">Dear SafePlace Admin,</h3>
          <p>We received a request to access your SafePlace Account <span style="color: #31708f;">${to}</span> through your email address. Your SafePlace verification code is:</p>
          <h1>${otp}</h1>
          <p>If you did not request this code, it is possible that someone else is trying to access your SafePlace account <span style="color: #31708f;">${to}</span>. <strong>Do not forward or give this code to anyone.</strong></p>
          <p style="color: #666666;">You received this message because this email address is listed as an admin in the SafePlace system.</p>
          <p>Sincerely yours,</p>
          <p style="font-weight: bold;">safeplacewithdr.jeb</p>
        </div>
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
          <h2 style="color: #333;">Hello ${firstname},</h2>
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
          <h2 style="color: #333;">Hello ${username},</h2>
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
