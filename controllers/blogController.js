const { json } = require("express");
const Blog = require("../schemas/blogSchema");
const User = require("../schemas/User");
const mongoose = require("mongoose");
const { save } = require("node-cron/src/storage");

exports.createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "Title, content, and category are required" });
    }

    const newBlog = new Blog({
      title,
      content,
      category,
      author: "Jeb Doe",
      status: "published",
    });

    const savedBlog = await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: savedBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveBlogAsDraft = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ message: "Title, content, and category are required" });
    }

    const newBlog = new Blog({
      title,
      content,
      category,
      author: "Jeb Doe",
      status: "draft",
    });

    const savedBlog = await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog saved as draft successfully", blog: savedBlog });
  } catch (error) {
    console.error("Error saving blog as draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdDate: -1 });

    if (!blogs.length) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addToFavorites = async (req, res) => {
  const { blogId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(blogId)
  ) {
    return res.status(400).json({ message: "Invalid userId or blogId" });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!blog.readerIDs.includes(userObjectId)) {
      blog.readerIDs.push(userObjectId);
      await blog.save();
    }

    res.status(200).json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeFromFavorites = async (req, res) => {
  const { blogId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(blogId)
  ) {
    return res.status(400).json({ message: "Invalid userId or blogId" });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.readerIDs = blog.readerIDs.filter(
      (id) => id.toString() !== userId.toString()
    );

    await blog.save();

    res.status(200).json({ message: "User removed from favorites" });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserFavorites = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    const blogs = await Blog.find({ readerIDs: userId }).sort({
      createdDate: -1,
    });

    if (!blogs.length) {
      return res.status(404).json({ message: "No favorite blogs found" });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching favorite blogs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getNewestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdDate: -1 }).limit(10);

    res.json({ blogs });
  } catch (error) {
    console.error("Error fetching newest blogs:", error);
    res.status(500).json({ message: "Failed to fetch newest blogs" });
  }
};
exports.getAllDrafts = async (req, res) => {
  try {
    const drafts = await Blog.find({ status: "draft" }).sort({
      createdDate: -1,
    });

    if (!drafts.length) {
      return res.status(404).json({ message: "No drafts found" });
    }

    res.status(200).json({ drafts });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateDraft = async (req, res) => {
  const { draftId } = req.params;
  const { title, content, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(draftId)) {
    return res.status(400).json({ message: "Invalid draftId" });
  }

  try {
    const updatedDraft = await Blog.findByIdAndUpdate(
      draftId,
      { title, content, category },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res
      .status(200)
      .json({ message: "Draft updated successfully", draft: updatedDraft });
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.publishDraft = async (req, res) => {
  const { draftId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(draftId)) {
    return res.status(400).json({ message: "Invalid draftId" });
  }

  try {
    const updatedDraft = await Blog.findByIdAndUpdate(
      draftId,
      { status: "published" },
      { new: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({ message: "Draft not found" });
    }

    res
      .status(200)
      .json({ message: "Draft published successfully", blog: updatedDraft });
  } catch (error) {
    console.error("Error publishing draft:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.editPublishedBlog = async (req, res) => {
  const { blogId } = req.params;
  const { title, content, category } = req.body;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json({ message: "Invalid blogId" });
  }

  if (!title || !content || !category) {
    return res
      .status(400)
      .json({ message: "Title, content, and category are required" });
  }

  try {
    const blog = await Blog.findOne({ _id: blogId, status: "published" });

    if (!blog) {
      return res.status(404).json({ message: "Published blog not found" });
    }

    blog.title = title;
    blog.content = content;
    blog.category = category;

    const updatedBlog = await blog.save();

    res
      .status(200)
      .json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    console.error("Error updating published blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
