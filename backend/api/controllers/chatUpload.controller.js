/**
 * [POST] /api/chat-upload/
 * Upload file cho chat và trả về URL từ Cloudinary
 */
module.exports.uploadChatFile = async (req, res) => {
  try {
    // File đã được upload lên Cloudinary qua middleware uploadCloud.uploadSingle
    const fileUrl = req.body.file;

    if (!fileUrl) {
      return res.status(400).json({
        code: 400,
        message: "Không tìm thấy file để upload!",
      });
    }

    // Lấy thông tin file gốc
    const originalFileName = req.file ? req.file.originalname : "unknown";
    const fileSize = req.file ? req.file.size : 0;

    return res.json({
      code: 200,
      message: "Upload file thành công!",
      data: {
        url: fileUrl,
        fileName: originalFileName,
        fileSize: fileSize,
      },
    });
  } catch (error) {
    console.error("Error uploading chat file:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi upload file!",
      error: error.message,
    });
  }
};
