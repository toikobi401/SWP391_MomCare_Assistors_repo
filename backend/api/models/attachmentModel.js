const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy tất cả attachments của một message
 */
module.exports.getAttachmentsByMessageId = async (messageId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .query(`
      SELECT 
        AttachmentID,
        MessageID,
        OriginalFileName,
        FileSize,
        StorageURL,
        CreateAt
      FROM Attachments
      WHERE MessageID = @MessageID
      ORDER BY CreateAt ASC
    `);
  return result.recordset;
};

/**
 * 🧩 Lấy chi tiết một attachment
 */
module.exports.getAttachmentById = async (attachmentId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("AttachmentID", sql.BigInt, attachmentId)
    .query(`
      SELECT 
        AttachmentID,
        MessageID,
        OriginalFileName,
        FileSize,
        StorageURL,
        CreateAt
      FROM Attachments
      WHERE AttachmentID = @AttachmentID
    `);
  return result.recordset[0];
};

/**
 * 🧩 Tạo attachment mới
 */
module.exports.createAttachment = async (messageId, originalFileName, fileSize, storageURL) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .input("OriginalFileName", sql.NVarChar(sql.MAX), originalFileName)
    .input("FileSize", sql.BigInt, fileSize)
    .input("StorageURL", sql.NVarChar(sql.MAX), storageURL)
    .input("CreateAt", sql.DateTime, new Date())
    .query(`
      INSERT INTO Attachments (MessageID, OriginalFileName, FileSize, StorageURL, CreateAt)
      OUTPUT INSERTED.AttachmentID
      VALUES (@MessageID, @OriginalFileName, @FileSize, @StorageURL, @CreateAt)
    `);
  return result.recordset[0].AttachmentID;
};

/**
 * 🧩 Xóa attachment
 */
module.exports.deleteAttachment = async (attachmentId) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("AttachmentID", sql.BigInt, attachmentId)
    .query(`
      DELETE FROM Attachments 
      WHERE AttachmentID = @AttachmentID
    `);
};

/**
 * 🧩 Xóa tất cả attachments của một message
 */
module.exports.deleteAttachmentsByMessageId = async (messageId) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .query(`
      DELETE FROM Attachments 
      WHERE MessageID = @MessageID
    `);
};

/**
 * 🧩 Đếm số lượng attachments của một message
 */
module.exports.countAttachments = async (messageId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("MessageID", sql.BigInt, messageId)
    .query(`
      SELECT COUNT(*) AS Total 
      FROM Attachments 
      WHERE MessageID = @MessageID
    `);
  return result.recordset[0].Total;
};
