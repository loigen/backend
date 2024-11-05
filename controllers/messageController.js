const crypto = require("crypto");
const messageModel = require("../schemas/messageModel");

// Load secret key from environment variables
require("dotenv").config();
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex"); // Make sure this is 32 bytes
const algorithm = "aes-256-cbc";

// Encrypt text function
const encryptText = (text) => {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Store IV with the ciphertext
};

// Decrypt text function
const decryptText = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":"); // Split to get IV and encrypted text
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format"); // Handle missing IV or ciphertext
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Controller to create a new message with encryption
const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
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

// Controller to retrieve messages with decryption
const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });
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
