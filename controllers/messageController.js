const messageModel = require("../schemas/messageModel");
const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const createMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;

  try {
    const encryptedText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

    const message = new messageModel({
      chatId,
      senderId,
      text: encryptedText,
    });

    const response = await message.save();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Error creating message" });
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });

    const decryptedMessages = messages.map((message) => {
      try {
        const bytes = CryptoJS.AES.decrypt(message.text, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return { ...message._doc, text: originalText };
      } catch (decryptionError) {
        console.error("Error decrypting message:", decryptionError);
        return { ...message._doc, text: null }; // Handle decryption failure
      }
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Error getting messages" });
  }
};

module.exports = { createMessage, getMessages };
