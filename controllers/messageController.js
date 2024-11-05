const messageModel = require("../schemas/messageModel");
const crypto = require("crypto");

const secretKey = process.env.SECRET_KEY; // 32-byte key for AES-256
const iv = process.env.IV; // 16-byte IV for AES

// Encrypt function
const encryptText = (text) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decrypt function
const decryptText = (encryptedText) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  // Encrypt the message text before saving
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

    // Decrypt each message's text
    const decryptedMessages = messages.map((message) => {
      return {
        ...message._doc,
        text: decryptText(message.text),
      };
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
