const mongoose = require("mongoose");
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    default: "Jeb Doe",
  },
  createdDate: {
    type: Date,
    required: false,
    default: Date.now,
  },
  createdTime: {
    type: String,
    default: function () {
      return new Date().toTimeString().split(" ")[0];
    },
    required: false,
  },

  status: {
    type: String,
    enum: ["draft", "published"],
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
  readerIDs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
