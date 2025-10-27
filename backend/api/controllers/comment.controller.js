const CommentModel = require("../models/commentModel");

// [GET] /api/blog/:id/comments
module.exports.index = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const comments = await CommentModel.getCommentsByContentId(id);

    return res.json({
      code: 200,
      message: "Thành công!",
      data: comments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy bình luận:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};

// [POST] /api/blog/:id/comments
module.exports.create = async (req, res) => {
  try {
    const contentId = parseInt(req.params.id, 10);
    const { userId, content, parentId = null } = req.body; // 👈 thêm parentId để hỗ trợ reply

    if (!userId || !content) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin userId hoặc nội dung bình luận.",
      });
    }

    await CommentModel.addComment(contentId, userId, content, parentId);

    return res.json({
      code: 200,
      message: "Bình luận đã được thêm thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};

// [POST] /api/comment/report
module.exports.report = async (req, res) => {
  try {
    const { commentId, userId, reason } = req.body;

    if (!commentId || !userId) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu commentId hoặc userId.",
      });
    }

    await CommentModel.reportComment(commentId, userId, reason || null);

    return res.json({
      code: 200,
      message: "Báo cáo bình luận thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi báo cáo bình luận:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};

// (Tuỳ chọn) [GET] /api/comment/reports
module.exports.getReports = async (req, res) => {
  try {
    const reports = await CommentModel.getCommentReports();
    return res.json({
      code: 200,
      message: "Thành công!",
      data: reports,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách report:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};
