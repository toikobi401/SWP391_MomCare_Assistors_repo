const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy tất cả messages trong một conversation
 */
module.exports.getMessagesByConversationId = async (conversationId, limit = 100, offset = 0) => {
  const pool = await database.connect();
  
  // Lấy messages
  const messagesResult = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("Limit", sql.Int, limit)
    .input("Offset", sql.Int, offset)
    .query(`
      SELECT 
        m.MessageID,
        m.UserID,
        m.ModelID,
        m.Content,
        m.MessageType,
        m.Timestamp,
        u.FullName AS SenderName,
        u.Avatar AS SenderAvatar,
        mod.Name AS ModelName
      FROM Messages m
      LEFT JOIN [User] u ON m.UserID = u.UserID
      LEFT JOIN Models mod ON m.ModelID = mod.ModelID
      WHERE m.ConversationID = @ConversationID
      ORDER BY m.Timestamp ASC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY
    `);

  const messages = messagesResult.recordset;

  // Lấy attachments cho tất cả messages
  for (let message of messages) {
    const attachmentsResult = await pool
      .request()
      .input("MessageID", sql.BigInt, message.MessageID)
      .query(`
        SELECT 
          AttachmentID,
          OriginalFileName,
          FileSize,
          StorageURL,
          CreateAt
        FROM Attachments
        WHERE MessageID = @MessageID
      `);
    
    message.Attachments = attachmentsResult.recordset;
  }

  return messages;
};

/**
 * 🧩 Lấy chi tiết một message
 */
module.exports.getMessageById = async (messageId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .query(`
      SELECT 
        m.MessageID,
        m.UserID,
        m.ModelID,
        m.Content,
        m.MessageType,
        m.Timestamp,
        m.ConversationID,
        u.FullName AS SenderName,
        u.Avatar AS SenderAvatar,
        mod.Name AS ModelName
      FROM Messages m
      LEFT JOIN [User] u ON m.UserID = u.UserID
      LEFT JOIN Models mod ON m.ModelID = mod.ModelID
      WHERE m.MessageID = @MessageID
    `);
  return result.recordset[0];
};

/**
 * 🧩 Tạo message mới từ user
 * @param {number} conversationId - ID cuộc trò chuyện
 * @param {number} userId - ID người gửi
 * @param {string} content - Nội dung tin nhắn
 * @param {string} messageType - Loại tin nhắn (text, image, file, system)
 */
module.exports.createUserMessage = async (conversationId, userId, content, messageType = "text") => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("UserID", sql.Int, userId)
    .input("Content", sql.NVarChar(sql.MAX), content)
    .input("MessageType", sql.NVarChar(50), messageType)
    .input("Timestamp", sql.DateTime, new Date())
    .query(`
      INSERT INTO Messages (ConversationID, UserID, ModelID, Content, MessageType, Timestamp)
      OUTPUT INSERTED.MessageID
      VALUES (@ConversationID, @UserID, NULL, @Content, @MessageType, @Timestamp)
    `);
  return result.recordset[0].MessageID;
};

/**
 * 🧩 Tạo message mới từ AI model
 * @param {number} conversationId - ID cuộc trò chuyện
 * @param {number} userId - ID người dùng (owner của conversation)
 * @param {number} modelId - ID mô hình AI
 * @param {string} content - Nội dung tin nhắn
 * @param {string} messageType - Loại tin nhắn (text, image, file, system)
 */
module.exports.createModelMessage = async (conversationId, userId, modelId, content, messageType = "text") => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("UserID", sql.Int, userId) // Sử dụng UserID thực tế thay vì NULL
    .input("ModelID", sql.BigInt, modelId) // Có thể là null cho .env fallback
    .input("Content", sql.NVarChar(sql.MAX), content)
    .input("MessageType", sql.NVarChar(50), messageType)
    .input("Timestamp", sql.DateTime, new Date())
    .query(`
      INSERT INTO Messages (ConversationID, UserID, ModelID, Content, MessageType, Timestamp)
      OUTPUT INSERTED.MessageID
      VALUES (@ConversationID, @UserID, @ModelID, @Content, @MessageType, @Timestamp)
    `);
  
  const messageId = result.recordset[0].MessageID;
  console.log("✅ Model message created successfully with ID:", messageId);
  return messageId;
};

/**
 * 🧩 Cập nhật nội dung message
 */
module.exports.updateMessage = async (messageId, content) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("Content", sql.NVarChar(sql.MAX), content)
    .query(`
      UPDATE Messages 
      SET Content = @Content 
      WHERE MessageID = @MessageID
    `);
};

/**
 * 🧩 Xóa message
 */
module.exports.deleteMessage = async (messageId) => {
  const pool = await database.connect();
  const transaction = pool.transaction();
  
  try {
    await transaction.begin();

    // Xóa attachments trước
    await transaction
      .request()
      .input("MessageID", sql.BigInt, messageId)
      .query(`
        DELETE FROM Attachments 
        WHERE MessageID = @MessageID
      `);

    // Xóa message
    await transaction
      .request()
      .input("MessageID", sql.BigInt, messageId)
      .query(`
        DELETE FROM Messages 
        WHERE MessageID = @MessageID
      `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * 🧩 Đếm số lượng messages trong conversation
 */
module.exports.countMessages = async (conversationId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .query(`
      SELECT COUNT(*) AS Total 
      FROM Messages 
      WHERE ConversationID = @ConversationID
    `);
  return result.recordset[0].Total;
};

/**
 * 🧩 Tìm kiếm messages theo nội dung
 */
module.exports.searchMessages = async (conversationId, searchText) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("SearchText", sql.NVarChar(sql.MAX), `%${searchText}%`)
    .query(`
      SELECT 
        m.MessageID,
        m.UserID,
        m.ModelID,
        m.Content,
        m.MessageType,
        m.Timestamp,
        u.FullName AS SenderName,
        mod.Name AS ModelName
      FROM Messages m
      LEFT JOIN [User] u ON m.UserID = u.UserID
      LEFT JOIN Models mod ON m.ModelID = mod.ModelID
      WHERE m.ConversationID = @ConversationID 
        AND m.Content LIKE @SearchText
      ORDER BY m.Timestamp DESC
    `);
  return result.recordset;
};

/**
 * 🧩 Chỉnh sửa nội dung message (tương tự Messenger)
 * @param {number} messageId - ID tin nhắn cần chỉnh sửa
 * @param {string} newContent - Nội dung mới
 * @param {number} userId - ID người dùng (để kiểm tra quyền)
 */
module.exports.editMessage = async (messageId, newContent, userId) => {
  const pool = await database.connect();
  
  // Kiểm tra xem message có thuộc về user không
  const checkResult = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("UserID", sql.Int, userId)
    .query(`
      SELECT MessageID, Content, MessageType 
      FROM Messages 
      WHERE MessageID = @MessageID AND UserID = @UserID
    `);

  if (checkResult.recordset.length === 0) {
    throw new Error("Bạn không có quyền chỉnh sửa tin nhắn này");
  }

  // Cập nhật nội dung
  await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("Content", sql.NVarChar(sql.MAX), newContent)
    .query(`
      UPDATE Messages 
      SET Content = @Content 
      WHERE MessageID = @MessageID
    `);

  // Trả về message đã cập nhật
  return await module.exports.getMessageById(messageId);
};

/**
 * 🧩 Thu hồi message (tương tự Messenger)
 * @param {number} messageId - ID tin nhắn cần thu hồi
 * @param {number} userId - ID người dùng (để kiểm tra quyền)
 */
module.exports.recallMessage = async (messageId, userId) => {
  const pool = await database.connect();
  
  // Kiểm tra xem message có thuộc về user không
  const checkResult = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("UserID", sql.Int, userId)
    .query(`
      SELECT MessageID, Content, MessageType 
      FROM Messages 
      WHERE MessageID = @MessageID AND UserID = @UserID
    `);

  if (checkResult.recordset.length === 0) {
    throw new Error("Bạn không có quyền thu hồi tin nhắn này");
  }

  // Cập nhật message thành "recalled"
  await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("RecalledContent", sql.NVarChar(sql.MAX), "Tin nhắn đã được thu hồi")
    .input("RecalledType", sql.NVarChar(50), "recalled")
    .query(`
      UPDATE Messages 
      SET Content = @RecalledContent, 
          MessageType = @RecalledType 
      WHERE MessageID = @MessageID
    `);

  // Trả về message đã cập nhật
  return await module.exports.getMessageById(messageId);
};
