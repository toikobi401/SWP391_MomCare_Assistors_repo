const CategoryModel = require("../models/categoryModel");

// [GET] /api/category/
module.exports.index = async (req, res) => {
  try {
    const categories = await CategoryModel.getAllCategories();
    return res.json({
      code: 200,
      message: "Thành công!",
      data: categories
    });

  } catch (error) {
    return res.json({
      code: 400,
      message: "Thất bại!"
    });
  }
};

// [GET] /api/category/detail/:CategoryID
module.exports.detail = async (req, res) => {
  try {
    const id = parseInt(req.params.CategoryID, 10);
    const category = await CategoryModel.getCategoryById(id);
    return res.json({
      code: 200,
      message: "Thành công!",
      data: category
    });

  } catch (error) {
    return res.json({
      code: 400,
      message: "Thất bại!"
    });
  }
};

// [POST] /api/category/create
module.exports.create = async (req, res) => {
  try {
    const newCategory = await CategoryModel.createCategory(req.body);
    return res.json({
      code: 200,
      message: "Thành công!",
      CategoryID: newCategory.CategoryID
    });

  } catch (error) {
    return res.json({
      code: 400,
      message: "Thất bại!"
    });
  }
};

// [PUT] /api/category/update/:CategoryID
module.exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.CategoryID, 10);
    await CategoryModel.updateCategory(id, data);

    return res.json({
      code: 200,
      message: "Thành công!"
    });

  } catch (error) {
    return res.json({
      code: 400,
      message: "Thất bại!"
    });
  }
};

// [GET] /api/category/delete/:CategoryID
module.exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.CategoryID, 10);
    await CategoryModel.deleteCategory(id);
    return res.json({
      code: 200,
      message: "Thành công!"
    });

  } catch (error) {
    return res.json({
      code: 400,
      message: "Thất bại!"
    });
  }
};