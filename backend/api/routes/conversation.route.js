const express = require("express");
const router = express.Router();

const controller = require("../controllers/conversation.controller");

// Lấy tất cả conversations của user
router.get("/user/:userId", controller.getUserConversations);

// Lấy chi tiết conversation
router.get("/:conversationId", controller.getConversationDetail);

// Tạo conversation mới
router.post("/create", controller.createConversation);

// Tạo hoặc lấy cuộc hội thoại 1-1 (tương tự Messenger)
router.post("/create-private", controller.createPrivateConversation);

// Tạo hoặc lấy conversation với chatbot float
router.post("/create-chatbot", controller.createOrGetChatbotConversation);

// Thêm participant
router.post("/:conversationId/add-participant", controller.addParticipant);

// Xóa participant
router.delete("/:conversationId/remove-participant/:userId", controller.removeParticipant);

// Đổi tên conversation
router.put("/:conversationId/rename", controller.renameConversation);

// Xóa conversation
router.delete("/:conversationId", controller.deleteConversation);

module.exports = router;
