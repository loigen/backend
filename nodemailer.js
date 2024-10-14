const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { getRefreshToken } = require("./fetchRefresh");
dotenv.config();

// Step 3: Configure the transporter
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; //DONT EDIT THIS
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

module.exports = { sendEmailOTP };
