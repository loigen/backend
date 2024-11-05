const messageModel = require("../schemas/messageModel");
const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;

const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

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

    const decryptedMessages = messages.map((message) => {
      const bytes = CryptoJS.AES.decrypt(message.text, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return { ...message._doc, text: originalText };
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
