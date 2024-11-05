// const messageModel = require("../schemas/messageModel");

// const createMessage = async (req, res) => {
//   const { chatId, senderId, text } = req.body;

//   const message = new messageModel({
//     chatId,
//     senderId,
//     text,
//   });

//   try {
//     const response = await message.save();

//     res.status(200).json(response);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// };

// const getMessages = async (req, res) => {
//   const { chatId } = req.params;

//   try {
//     const messages = await messageModel.find({ chatId });
//     res.status(200).json(messages);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }
// };

// module.exports = { createMessage, getMessages };

const crypto = require("crypto");
const messageModel = require("../schemas/messageModel");

require("dotenv").config();
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex");
const algorithm = "aes-256-cbc";

// Encrypt text function
const encryptText = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

// Decrypt text function
const decryptText = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted text format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

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
