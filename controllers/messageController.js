const crypto = require("crypto");
const messageModel = require("../schemas/messageModel");

// Load secret key and IV directly from environment variables
const secretKey = process.env.SECRET_KEY; // Must be 32 characters for AES-256
const iv = process.env.IV; // Must be 16 characters for AES

// Encrypt function
const encryptText = (text) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decrypt function
const decryptText = (encryptedText) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  // Encrypt the message text
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

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });

    // Decrypt each message's text before sending the response
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
