const BlogModel = require("../models/blogModel");

// [GET] /api/blog/
module.exports.index = async (req, res) => {
  try {
    const { category, sort } = req.query;
    const blogs = await BlogModel.getBlogsFiltered(category, sort);
    return res.json({
      code: 200,
      message: "Thành công!",
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};

// [GET] /api/blog/:id
module.exports.detail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const blog = await BlogModel.getBlogById(id);
    return res.json({
      code: 200,
      message: "Thành công!",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    return res.status(500).json({
      code: 500,
      message: "Thất bại!",
      error: error.message,
    });
  }
};
