const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const controller = require("../controllers/upload.controller");
const uploadCloud = require("../middlewares/uploadCloud.middleware");

router.post(
  "/",
  upload.single("file"),
  uploadCloud.uploadSingle,
  controller.upload
);

module.exports = router;
