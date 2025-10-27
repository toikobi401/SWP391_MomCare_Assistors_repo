const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy danh sách comment (bao gồm cả reply)
 * Gom comment theo ParentCommentID
 */
module.exports.getCommentsByContentId = async (contentId) => {
  const pool = await database.connect();
  const result = await pool.request().input("ContentID", sql.Int, contentId)
    .query(`
      SELECT 
        cm.CommentID, 
        cm.ContentID, 
        cm.UserID, 
        cm.ParentCommentID,
        cm.Content, 
        cm.CreatedAt,
        u.Username, 
        u.Avatar
      FROM Comment cm
      JOIN [User] u ON cm.UserID = u.UserID
      WHERE cm.ContentID = @ContentID 
        AND cm.IsDelete = 0 
        AND cm.IsActive = 1
      ORDER BY cm.CreatedAt ASC
    `);

  const comments = result.recordset;

  // 🔁 Gom nhóm reply theo ParentCommentID
  const map = {};
  const rootComments = [];

  comments.forEach((c) => {
    c.replies = [];
    map[c.CommentID] = c;
  });

  comments.forEach((c) => {
    if (c.ParentCommentID) {
      map[c.ParentCommentID]?.replies.push(c);
    } else {
      rootComments.push(c);
    }
  });

  return rootComments;
};

/**
 * 🧩 Thêm comment mới (có thể là reply)
 */
module.exports.addComment = async (
  contentId,
  userId,
  content,
  parentId = null
) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ContentID", sql.Int, contentId)
    .input("UserID", sql.Int, userId)
    .input("Content", sql.NVarChar(sql.MAX), content)
    .input("ParentCommentID", sql.Int, parentId).query(`
      INSERT INTO Comment (ContentID, UserID, Content, ParentCommentID)
      VALUES (@ContentID, @UserID, @Content, @ParentCommentID)
    `);
  return { success: true };
};

/**
 * 🧩 Báo cáo comment (Report)
 * Lưu thông tin comment bị báo cáo vào bảng CommentReport
 */
module.exports.reportComment = async (commentId, userId, reason = null) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("CommentID", sql.Int, commentId)
    .input("UserID", sql.Int, userId)
    .input("Reason", sql.NVarChar(sql.MAX), reason).query(`
      INSERT INTO CommentReport (CommentID, UserID, Reason)
      VALUES (@CommentID, @UserID, @Reason)
    `);
  return { success: true };
};

/**
 * 🧩 Lấy danh sách report (dành cho admin)
 */
module.exports.getCommentReports = async () => {
  const pool = await database.connect();
  const result = await pool.request().query(`
    SELECT 
      r.ReportID, 
      r.CommentID, 
      r.UserID, 
      r.Reason, 
      r.CreatedAt, 
      r.IsHandled,
      u.Username AS Reporter,
      c.Content AS CommentContent
    FROM CommentReport r
    INNER JOIN [User] u ON r.UserID = u.UserID
    INNER JOIN Comment c ON r.CommentID = c.CommentID
    ORDER BY r.CreatedAt DESC
  `);
  return result.recordset;
};
