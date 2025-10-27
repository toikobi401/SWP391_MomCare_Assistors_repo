const express = require("express");
const router = express.Router();

const controller = require("../controllers/model.controller");

// Lấy tất cả models
router.get("/", controller.getAllModels);

// Lấy chi tiết model
router.get("/:modelId", controller.getModelDetail);

// Tạo model mới
router.post("/create", controller.createModel);

// Cập nhật model
router.put("/:modelId", controller.updateModel);

// Xóa model
router.delete("/:modelId", controller.deleteModel);

module.exports = router;
