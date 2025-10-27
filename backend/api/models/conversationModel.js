const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy tất cả conversations của một user
 */
module.exports.getConversationsByUserId = async (userId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID", sql.Int, userId)
    .query(`
      SELECT DISTINCT
        c.ConversationID,
        c.Name,
        c.CreateAt,
        (SELECT TOP 1 m.Content 
         FROM Messages m 
         WHERE m.MessageID IN (
           SELECT MessageID FROM Messages WHERE ConversationID = c.ConversationID
         )
         ORDER BY m.Timestamp DESC) AS LastMessage,
        (SELECT TOP 1 m.Timestamp 
         FROM Messages m 
         WHERE m.MessageID IN (
           SELECT MessageID FROM Messages WHERE ConversationID = c.ConversationID
         )
         ORDER BY m.Timestamp DESC) AS LastMessageTime,
        -- Lấy thông tin participants để xử lý tên cho chat 1-1
        (SELECT COUNT(*) FROM Participant WHERE ConversationID = c.ConversationID AND ModelID IS NULL) AS ParticipantCount,
        -- Lấy thông tin user khác trong chat 1-1 (nếu chỉ có 2 người)
        (SELECT TOP 1 u.FullName 
         FROM Participant p 
         INNER JOIN [User] u ON p.UserID = u.UserID
         WHERE p.ConversationID = c.ConversationID 
         AND p.UserID != @UserID 
         AND p.ModelID IS NULL) AS OtherUserName,
        (SELECT TOP 1 u.Avatar 
         FROM Participant p 
         INNER JOIN [User] u ON p.UserID = u.UserID
         WHERE p.ConversationID = c.ConversationID 
         AND p.UserID != @UserID 
         AND p.ModelID IS NULL) AS OtherUserAvatar,
        -- Lấy tên tất cả participants cho group chat
        (SELECT STRING_AGG(u.UserName, ', ') 
         FROM Participant p 
         INNER JOIN [User] u ON p.UserID = u.UserID
         WHERE p.ConversationID = c.ConversationID 
         AND p.ModelID IS NULL) AS AllParticipantNames
      FROM Conversations c
      INNER JOIN Participant p ON c.ConversationID = p.ConversationID
      WHERE p.UserID = @UserID
      ORDER BY LastMessageTime DESC
    `);
  return result.recordset;
};

/**
 * 🧩 Lấy chi tiết một conversation
 */
module.exports.getConversationById = async (conversationId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .query(`
      SELECT 
        c.ConversationID,
        c.Name,
        c.CreateAt,
        -- Lấy thông tin participants để xử lý tên
        (SELECT COUNT(*) FROM Participant WHERE ConversationID = c.ConversationID AND ModelID IS NULL) AS ParticipantCount,
        -- Lấy tên tất cả participants cho group chat
        (SELECT STRING_AGG(u.FullName, ', ') 
         FROM Participant p 
         INNER JOIN [User] u ON p.UserID = u.UserID
         WHERE p.ConversationID = c.ConversationID 
         AND p.ModelID IS NULL) AS AllParticipantNames
      FROM Conversations c
      WHERE c.ConversationID = @ConversationID
    `);
  return result.recordset[0];
};

/**
 * 🧩 Lấy danh sách participants trong conversation
 */
module.exports.getParticipants = async (conversationId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .query(`
      SELECT 
        p.UserID,
        u.FullName,
        u.Avatar,
        u.Email,
        p.ModelID,
        m.Name AS ModelName
      FROM Participant p
      LEFT JOIN [User] u ON p.UserID = u.UserID
      LEFT JOIN Models m ON p.ModelID = m.ModelID
      WHERE p.ConversationID = @ConversationID
    `);
  return result.recordset;
};

/**
 * 🧩 Kiểm tra và lấy cuộc hội thoại 1-1 giữa 2 user (tương tự Messenger)
 * @param {number} userId1 - ID user thứ nhất
 * @param {number} userId2 - ID user thứ hai
 * @returns {object|null} - Cuộc hội thoại nếu tồn tại, null nếu không
 */
module.exports.findPrivateConversation = async (userId1, userId2) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID1", sql.Int, userId1)
    .input("UserID2", sql.Int, userId2)
    .query(`
      SELECT c.ConversationID, c.Name, c.CreateAt
      FROM Conversations c
      WHERE c.ConversationID IN (
        -- Tìm conversations có đúng 2 participants
        SELECT p1.ConversationID
        FROM Participant p1
        INNER JOIN Participant p2 ON p1.ConversationID = p2.ConversationID
        WHERE p1.UserID = @UserID1 AND p2.UserID = @UserID2
        AND p1.UserID != p2.UserID
        AND p1.ModelID IS NULL AND p2.ModelID IS NULL
        GROUP BY p1.ConversationID
        HAVING COUNT(*) = 2
      )
    `);
  return result.recordset[0] || null;
};

/**
 * 🧩 Tạo hoặc lấy cuộc hội thoại 1-1 (tương tự Messenger)
 * @param {number} userId1 - ID user thứ nhất
 * @param {number} userId2 - ID user thứ hai
 * @returns {object} - Cuộc hội thoại (có thể là mới tạo hoặc đã tồn tại)
 */
module.exports.createOrGetPrivateConversation = async (userId1, userId2) => {
  // Kiểm tra xem đã có cuộc hội thoại 1-1 chưa
  const existingConversation = await this.findPrivateConversation(userId1, userId2);
  
  if (existingConversation) {
    return existingConversation;
  }

  // Nếu chưa có, tạo mới với tên mặc định
  // Tên sẽ được tạo từ ID của 2 users để đảm bảo unique
  const conversationName = `Chat_${Math.min(userId1, userId2)}_${Math.max(userId1, userId2)}`;
  
  const conversationId = await this.createConversation(
    conversationName, // Tên conversation tự động
    userId1,
    [userId2], // Chỉ có 2 người
    null // Không có model AI cho chat 1-1
  );

  // Lấy thông tin conversation vừa tạo
  return await this.getConversationById(conversationId);
};

/**
 * 🧩 Tạo conversation mới
 * @param {string} name - Tên cuộc trò chuyện
 * @param {number} creatorUserId - ID người tạo
 * @param {array} participantUserIds - Mảng ID các user tham gia
 * @param {number} modelId - ID mô hình AI (nullable)
 */
module.exports.createConversation = async (name, creatorUserId, participantUserIds = [], modelId = null) => {
  const pool = await database.connect();
  const transaction = pool.transaction();
  
  try {
    await transaction.begin();

    // Đảm bảo name không bao giờ là NULL
    const conversationName = name || `Conversation_${Date.now()}`;

    // Tạo conversation
    const conversationResult = await transaction
      .request()
      .input("Name", sql.NVarChar(50), conversationName)
      .input("CreateAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO Conversations (Name, CreateAt)
        OUTPUT INSERTED.ConversationID
        VALUES (@Name, @CreateAt)
      `);

    const conversationId = conversationResult.recordset[0].ConversationID;

    // Thêm creator vào participant
    await transaction
      .request()
      .input("ConversationID", sql.BigInt, conversationId)
      .input("UserID", sql.Int, creatorUserId)
      .input("ModelID", sql.BigInt, modelId)
      .query(`
        INSERT INTO Participant (ConversationID, UserID, ModelID)
        VALUES (@ConversationID, @UserID, @ModelID)
      `);

    // Thêm các participants khác
    for (const userId of participantUserIds) {
      if (userId !== creatorUserId) {
        await transaction
          .request()
          .input("ConversationID", sql.BigInt, conversationId)
          .input("UserID", sql.Int, userId)
          .input("ModelID", sql.BigInt, modelId)
          .query(`
            INSERT INTO Participant (ConversationID, UserID, ModelID)
            VALUES (@ConversationID, @UserID, @ModelID)
          `);
      }
    }

    await transaction.commit();
    return conversationId;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * 🧩 Thêm participant vào conversation
 */
module.exports.addParticipant = async (conversationId, userId, modelId = null) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("UserID", sql.Int, userId)
    .input("ModelID", sql.BigInt, modelId)
    .query(`
      INSERT INTO Participant (ConversationID, UserID, ModelID)
      VALUES (@ConversationID, @UserID, @ModelID)
    `);
};

/**
 * 🧩 Xóa participant khỏi conversation
 */
module.exports.removeParticipant = async (conversationId, userId) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("UserID", sql.Int, userId)
    .query(`
      DELETE FROM Participant 
      WHERE ConversationID = @ConversationID AND UserID = @UserID
    `);
};

/**
 * 🧩 Cập nhật tên conversation
 */
module.exports.updateConversationName = async (conversationId, name) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ConversationID", sql.BigInt, conversationId)
    .input("Name", sql.NVarChar(50), name)
    .query(`
      UPDATE Conversations 
      SET Name = @Name 
      WHERE ConversationID = @ConversationID
    `);
};

/**
 * 🧩 Xóa conversation (xóa cả messages và participants)
 */
module.exports.deleteConversation = async (conversationId) => {
  const pool = await database.connect();
  const transaction = pool.transaction();
  
  try {
    await transaction.begin();

    // Xóa attachments
    await transaction
      .request()
      .input("ConversationID", sql.BigInt, conversationId)
      .query(`
        DELETE FROM Attachments 
        WHERE MessageID IN (
          SELECT MessageID FROM Messages WHERE ConversationID = @ConversationID
        )
      `);

    // Xóa messages
    await transaction
      .request()
      .input("ConversationID", sql.BigInt, conversationId)
      .query(`
        DELETE FROM Messages 
        WHERE ConversationID = @ConversationID
      `);

    // Xóa participants
    await transaction
      .request()
      .input("ConversationID", sql.BigInt, conversationId)
      .query(`
        DELETE FROM Participant 
        WHERE ConversationID = @ConversationID
      `);

    // Xóa conversation
    await transaction
      .request()
      .input("ConversationID", sql.BigInt, conversationId)
      .query(`
        DELETE FROM Conversations 
        WHERE ConversationID = @ConversationID
      `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
