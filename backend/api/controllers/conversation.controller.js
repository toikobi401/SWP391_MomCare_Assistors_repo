const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");

/**
 * [GET] /api/conversations/user/:userId
 * Lấy tất cả conversations của một user
 */
module.exports.getUserConversations = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const conversations = await ConversationModel.getConversationsByUserId(userId);
    
    return res.json({
      code: 200,
      message: "Lấy danh sách conversations thành công!",
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách conversations!",
      error: error.message,
    });
  }
};

/**
 * [GET] /api/conversations/:conversationId
 * Lấy chi tiết một conversation
 */
module.exports.getConversationDetail = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const conversation = await ConversationModel.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy conversation!",
      });
    }

    // Lấy danh sách participants
    const participants = await ConversationModel.getParticipants(conversationId);
    conversation.participants = participants;

    return res.json({
      code: 200,
      message: "Lấy chi tiết conversation thành công!",
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation detail:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy chi tiết conversation!",
      error: error.message,
    });
  }
};

/**
 * [POST] /api/conversations/create
 * Tạo conversation mới
 * Body: { name, creatorUserId, participantUserIds: [], modelId }
 */
module.exports.createConversation = async (req, res) => {
  try {
    const { name, creatorUserId, participantUserIds = [], modelId = null } = req.body;

    if (!name || !creatorUserId) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin: name, creatorUserId!",
      });
    }

    const conversationId = await ConversationModel.createConversation(
      name,
      creatorUserId,
      participantUserIds,
      modelId
    );

    // Emit socket event để notify participants về conversation mới
    const io = req.app.get('io');
    if (io) {
      // Notify creator
      io.to(`user_${creatorUserId}`).emit('new_conversation', { conversationId });
      
      // Notify all participants
      participantUserIds.forEach(userId => {
        io.to(`user_${userId}`).emit('new_conversation', { conversationId });
      });
    }

    return res.json({
      code: 200,
      message: "Tạo conversation thành công!",
      data: { conversationId },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi tạo conversation!",
      error: error.message,
    });
  }
};

/**
 * [POST] /api/conversations/:conversationId/add-participant
 * Thêm participant vào conversation
 * Body: { userId, modelId }
 */
module.exports.addParticipant = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const { userId, modelId = null } = req.body;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu userId!",
      });
    }

    await ConversationModel.addParticipant(conversationId, userId, modelId);

    return res.json({
      code: 200,
      message: "Thêm participant thành công!",
    });
  } catch (error) {
    console.error("Error adding participant:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi thêm participant!",
      error: error.message,
    });
  }
};

/**
 * [DELETE] /api/conversations/:conversationId/remove-participant/:userId
 * Xóa participant khỏi conversation
 */
module.exports.removeParticipant = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const userId = parseInt(req.params.userId, 10);

    await ConversationModel.removeParticipant(conversationId, userId);

    return res.json({
      code: 200,
      message: "Xóa participant thành công!",
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa participant!",
      error: error.message,
    });
  }
};

/**
 * [PUT] /api/conversations/:conversationId/rename
 * Đổi tên conversation
 * Body: { name }
 */
module.exports.renameConversation = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu tên conversation!",
      });
    }

    await ConversationModel.updateConversationName(conversationId, name);

    return res.json({
      code: 200,
      message: "Đổi tên conversation thành công!",
    });
  } catch (error) {
    console.error("Error renaming conversation:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi đổi tên conversation!",
      error: error.message,
    });
  }
};

/**
 * [DELETE] /api/conversations/:conversationId
 * Xóa conversation
 */
module.exports.deleteConversation = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);

    await ConversationModel.deleteConversation(conversationId);

    return res.json({
      code: 200,
      message: "Xóa conversation thành công!",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa conversation!",
      error: error.message,
    });
  }
};
