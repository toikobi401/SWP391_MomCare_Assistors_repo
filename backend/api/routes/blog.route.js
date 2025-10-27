// backend/api/routes/blog.route.js
const express = require("express");
const router = express.Router();
const blogCtrl = require("../controllers/blog.controller");
const commentCtrl = require("../controllers/comment.controller");

router.get("/", blogCtrl.index);
router.get("/:id", blogCtrl.detail);

// Comments
router.get("/:id/comments", commentCtrl.index);
router.post("/:id/comments", commentCtrl.create);
module.exports = router;
