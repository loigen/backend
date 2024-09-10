const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authenticateToken = require("../middlewares/authenticateToken");
const { put } = require("./scheduleRoutes");

router.post("/create", blogController.createBlog);

router.post("/save-draft", blogController.saveBlogAsDraft);

router.post("/addToFavorites/:blogId/:userId", blogController.addToFavorites);

router.post(
  "/removeFromFavorites/:blogId/:userId",
  blogController.removeFromFavorites
);

router.get("/userFavorites/:userId", blogController.getUserFavorites);

router.get("/newestBlogs", blogController.getNewestBlogs);

router.get("/all", blogController.getAllBlogs);

router.get("/allBlogs", blogController.getAllBlogs);

router.get("/drafts", blogController.getAllDrafts);

router.put("/:draftId/update", blogController.updateDraft);

router.put("/:draftId/publish", blogController.publishDraft);

router.put("/:blogId/edit", blogController.editPublishedBlog);

module.exports = router;
