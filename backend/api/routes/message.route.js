const express = require("express");
const router = express.Router();

const controller = require("../controllers/message.controller");

// Lấy tất cả messages trong conversation
router.get("/:conversationId", controller.getMessages);

// Lấy chi tiết một message
router.get("/detail/:messageId", controller.getMessageDetail);

// Gửi message từ user
router.post("/send-user", controller.sendUserMessage);

// Gửi message với AI auto-response (sử dụng models từ database)
router.post("/send-with-ai-response", controller.sendMessageWithAIResponse);

// Gửi message từ AI model
router.post("/send-model", controller.sendModelMessage);

// Cập nhật message
router.put("/:messageId", controller.updateMessage);

// Xóa message
router.delete("/:messageId", controller.deleteMessage);

// Tìm kiếm messages
router.get("/:conversationId/search", controller.searchMessages);

// Chỉnh sửa message (Messenger-style)
router.put("/:messageId/edit", controller.editMessage);

// Thu hồi message (Messenger-style)
router.put("/:messageId/recall", controller.recallMessage);

module.exports = router;
