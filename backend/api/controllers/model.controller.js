const ModelModel = require("../models/modelModel");

/**
 * [GET] /api/models/
 * Lấy tất cả AI models
 */
module.exports.getAllModels = async (req, res) => {
  try {
    const models = await ModelModel.getAllModels();

    return res.json({
      code: 200,
      message: "Lấy danh sách models thành công!",
      data: models,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách models!",
      error: error.message,
    });
  }
};

/**
 * [GET] /api/models/:modelId
 * Lấy chi tiết một model
 */
module.exports.getModelDetail = async (req, res) => {
  try {
    const modelId = parseInt(req.params.modelId, 10);
    const model = await ModelModel.getModelById(modelId);

    if (!model) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy model!",
      });
    }

    return res.json({
      code: 200,
      message: "Lấy chi tiết model thành công!",
      data: model,
    });
  } catch (error) {
    console.error("Error fetching model detail:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy chi tiết model!",
      error: error.message,
    });
  }
};

/**
 * [POST] /api/models/create
 * Tạo model mới
 * Body: { name, apiKey, description }
 */
module.exports.createModel = async (req, res) => {
  try {
    const { name, apiKey, description = null } = req.body;

    if (!name || !apiKey) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin: name, apiKey!",
      });
    }

    const modelId = await ModelModel.createModel(name, apiKey, description);

    return res.json({
      code: 200,
      message: "Tạo model thành công!",
      data: { modelId },
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi tạo model!",
      error: error.message,
    });
  }
};

/**
 * [PUT] /api/models/:modelId
 * Cập nhật model
 * Body: { name, apiKey, description }
 */
module.exports.updateModel = async (req, res) => {
  try {
    const modelId = parseInt(req.params.modelId, 10);
    const { name, apiKey, description = null } = req.body;

    if (!name || !apiKey) {
      return res.status(400).json({
        code: 400,
        message: "Thiếu thông tin: name, apiKey!",
      });
    }

    await ModelModel.updateModel(modelId, name, apiKey, description);

    return res.json({
      code: 200,
      message: "Cập nhật model thành công!",
    });
  } catch (error) {
    console.error("Error updating model:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi cập nhật model!",
      error: error.message,
    });
  }
};

/**
 * [DELETE] /api/models/:modelId
 * Xóa model
 */
module.exports.deleteModel = async (req, res) => {
  try {
    const modelId = parseInt(req.params.modelId, 10);

    await ModelModel.deleteModel(modelId);

    return res.json({
      code: 200,
      message: "Xóa model thành công!",
    });
  } catch (error) {
    console.error("Error deleting model:", error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa model!",
      error: error.message,
    });
  }
};
