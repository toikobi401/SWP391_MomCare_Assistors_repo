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
         ORDER BY m.Timestamp DESC) AS LastMessageTime
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
        c.CreateAt
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

    // Tạo conversation
    const conversationResult = await transaction
      .request()
      .input("Name", sql.NVarChar(50), name)
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
