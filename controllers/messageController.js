const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const messageModel = require("../schemas/messageModel");

// Define encryption configurations
const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex'); // Replace with a fixed secret key in production
const iv = crypto.randomBytes(16); // Generate a 16-byte IV (initialization vector)

// Function to encrypt text
const encryptText = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Include IV with encrypted text
};

// Function to decrypt text
const decryptText = (text) => {
  const [ivHex, encryptedText] = text.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Controller to create a new message
const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  // Encrypt the text before saving
  const encryptedText = encryptText(text);

  const message = new messageModel({
    chatId,
    senderId,
    text: encryptedText,
  });

  try {
    const response = await message.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Controller to retrieve messages for a specific chat
const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });
    // Decrypt each message text before sending response
    const decryptedMessages = messages.map((message) => ({
      ...message._doc,
      text: decryptText(message.text),
    }));
    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
