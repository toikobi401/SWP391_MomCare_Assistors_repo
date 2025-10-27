const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const controller = require("../controllers/chatUpload.controller");
const uploadCloud = require("../middlewares/uploadCloud.middleware");

// Upload file cho chat (hình ảnh, PDF, v.v.)
router.post(
  "/",
  upload.single("file"),
  uploadCloud.uploadSingle,
  controller.uploadChatFile
);

module.exports = router;
