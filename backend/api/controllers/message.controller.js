const MessageModel = require("../models/messageModel");
const AttachmentModel = require("../models/attachmentModel");
const fetch = require('node-fetch');

/**
 * [GET] /api/messages/:conversationId
 * Lấy tất cả messages trong conversation
 * Query: ?limit=100&offset=0
 */
module.exports.getMessages = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = parseInt(req.query.offset, 10) || 0;

    const messages = await MessageModel.getMessagesByConversationId(conversationId, limit, offset);

    // Attachments đã được load trong messageModel.getMessagesByConversationId()
    // Không cần load lại ở đây

    return res.json({
      code: 200,
      message: "Lấy danh sách messages thành công!",
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách messages!",
      error: error.message,
    });
  }
};

/**
 * [GET] /api/messages/detail/:messageId
 * Lấy chi tiết một message
 */
module.exports.getMessageDetail = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const message = await MessageModel.getMessageById(messageId);

    if (!message) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy message!",
      });
    }

    // Lấy attachments
    message.attachments = await AttachmentModel.getAttachmentsByMessageId(messageId);

    return res.json({
      code: 200,
      message: "Lấy chi tiết message thành công!",
      data: message,
    });
  } catch (error) {
    console.error("Error fetching message detail:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy chi tiết message!",
      error: error.message,
    });
  }
};

/**
 * [POST] /api/messages/send-user
 * Gửi message từ user
 * Body: { conversationId, userId, content, messageType, attachments: [{fileName, fileSize, url}] }
 */
module.exports.sendUserMessage = async (req, res) => {
  try {
    const { conversationId, userId, content, messageType = "text", attachments = [] } = req.body;

    if (!conversationId || !userId || !content) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin: conversationId, userId, content!",
      });
    }

    // Tạo message
    const messageId = await MessageModel.createUserMessage(conversationId, userId, content, messageType);

    // Tạo attachments nếu có
    for (let attachment of attachments) {
      await AttachmentModel.createAttachment(
        messageId,
        attachment.fileName,
        attachment.fileSize,
        attachment.url
      );
    }

    // Lấy lại message vừa tạo
    const message = await MessageModel.getMessageById(messageId);
    message.Attachments = await AttachmentModel.getAttachmentsByMessageId(messageId);
    
    console.log(`📤 Sending message ${messageId} with attachments:`, message.Attachments);

    // Nếu có attachments, delay và verify URL accessibility
    if (attachments && attachments.length > 0) {
      console.log(`Delaying socket emission for ${attachments.length} attachment(s)...`);
      
      // Delay đầu tiên để đảm bảo upload hoàn thành
      await new Promise(resolve => setTimeout(resolve, 3000)); // Delay 3 giây
      
      // Verify attachment URLs accessibility (simple check)
      for (let attachment of attachments) {
        if (attachment.url) {
          try {
            const response = await fetch(attachment.url, { method: 'HEAD' });
            if (!response.ok) {
              console.warn(`Attachment URL not accessible yet: ${attachment.url}`);
              // Thêm delay thêm 2 giây nếu URL chưa accessible
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.warn(`Error checking attachment URL: ${attachment.url}`, error.message);
            // Vẫn tiếp tục, không block việc emit
          }
        }
      }
    }

    // Emit socket event để notify real-time
    const io = req.app.get('io');
    if (io) {
      // Emit đến conversation room để tất cả participants nhận được
      io.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        message
      });

      // Emit đến user rooms để update conversation list (last message)
      const ConversationModel = require("../models/conversationModel");
      const participants = await ConversationModel.getParticipants(conversationId);
      participants.forEach(participant => {
        io.to(`user_${participant.UserID}`).emit('conversation_updated', {
          conversationId
        });
      });
    }

    return res.json({
      code: 200,
      message: "Gửi message thành công!",
      data: message,
    });
  } catch (error) {
    console.error("Error sending user message:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi gửi message!",
      error: error.message,
    });
  }
};

/**
 * [POST] /api/messages/send-model
 * Gửi message từ AI model
 * Body: { conversationId, modelId, content, messageType }
 */
module.exports.sendModelMessage = async (req, res) => {
  try {
    const { conversationId, modelId, content, messageType = "text" } = req.body;

    if (!conversationId || !modelId || !content) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin: conversationId, modelId, content!",
      });
    }

    // Tạo message
    const messageId = await MessageModel.createModelMessage(conversationId, modelId, content, messageType);

    // Lấy lại message vừa tạo
    const message = await MessageModel.getMessageById(messageId);

    // Emit socket event để notify real-time
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        message
      });

      // Update conversation list cho participants
      const ConversationModel = require("../models/conversationModel");
      const participants = await ConversationModel.getParticipants(conversationId);
      participants.forEach(participant => {
        io.to(`user_${participant.UserID}`).emit('conversation_updated', {
          conversationId
        });
      });
    }

    return res.json({
      code: 200,
      message: "Gửi message từ AI thành công!",
      data: message,
    });
  } catch (error) {
    console.error("Error sending model message:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi gửi message từ AI!",
      error: error.message,
    });
  }
};

/**
 * [PUT] /api/messages/:messageId
 * Cập nhật nội dung message
 * Body: { content }
 */
module.exports.updateMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu nội dung message!",
      });
    }

    await MessageModel.updateMessage(messageId, content);

    return res.json({
      code: 200,
      message: "Cập nhật message thành công!",
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi cập nhật message!",
      error: error.message,
    });
  }
};

/**
 * [DELETE] /api/messages/:messageId
 * Xóa message
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);

    await MessageModel.deleteMessage(messageId);

    return res.json({
      code: 200,
      message: "Xóa message thành công!",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa message!",
      error: error.message,
    });
  }
};

/**
 * [GET] /api/messages/:conversationId/search
 * Tìm kiếm messages theo nội dung
 * Query: ?q=search_text
 */
module.exports.searchMessages = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const searchText = req.query.q;

    if (!searchText) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu từ khóa tìm kiếm!",
      });
    }

    const messages = await MessageModel.searchMessages(conversationId, searchText);

    return res.json({
      code: 200,
      message: "Tìm kiếm messages thành công!",
      data: messages,
    });
  } catch (error) {
    console.error("Error searching messages:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi tìm kiếm messages!",
      error: error.message,
    });
  }
};

/**
 * [PUT] /api/messages/:messageId/edit
 * Chỉnh sửa nội dung message (tương tự Messenger)
 * Body: { userId, newContent }
 */
module.exports.editMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const { userId, newContent } = req.body;

    if (!newContent || !newContent.trim()) {
      return res.status(400).json({
        code: 400,
        message: "Nội dung tin nhắn không được để trống!"
      });
    }

    // Chỉnh sửa message
    const updatedMessage = await MessageModel.editMessage(messageId, newContent.trim(), userId);

    // Emit socket event để notify real-time
    const io = req.app.get('io');
    if (io && updatedMessage.ConversationID) {
      // Broadcast đến tất cả users trong conversation
      io.to(`conversation_${updatedMessage.ConversationID}`).emit('message_edited', {
        conversationId: updatedMessage.ConversationID,
        message: updatedMessage
      });
    }

    return res.json({
      code: 200,
      message: "Chỉnh sửa tin nhắn thành công!",
      data: updatedMessage
    });
  } catch (error) {
    console.error("Error editing message:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "Chỉnh sửa tin nhắn thất bại!",
      error: error.message
    });
  }
};

/**
 * [PUT] /api/messages/:messageId/recall
 * Thu hồi message (tương tự Messenger)
 * Body: { userId }
 */
module.exports.recallMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const { userId } = req.body;

    // Thu hồi message
    const recalledMessage = await MessageModel.recallMessage(messageId, userId);

    // Emit socket event để notify real-time
    const io = req.app.get('io');
    if (io && recalledMessage.ConversationID) {
      // Broadcast đến tất cả users trong conversation
      io.to(`conversation_${recalledMessage.ConversationID}`).emit('message_recalled', {
        conversationId: recalledMessage.ConversationID,
        message: recalledMessage
      });
    }

    return res.json({
      code: 200,
      message: "Thu hồi tin nhắn thành công!",
      data: recalledMessage
    });
  } catch (error) {
    console.error("Error recalling message:", error);
    return res.status(500).json({
      code: 500,
      message: error.message || "Thu hồi tin nhắn thất bại!",
      error: error.message
    });
  }
};
