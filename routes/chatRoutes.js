const express = require("express");
const {
  createChat,
  findUserChats,
  findChat,
  deleteChat,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/", createChat);

router.get("/:userId", findUserChats);

router.get("/find/:firstId/:secondId", findChat);

router.delete("/:chatId", deleteChat);

module.exports = router;
