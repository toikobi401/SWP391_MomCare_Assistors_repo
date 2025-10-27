const sql = require("mssql");
const database = require("../config/database");

// Lấy tất cả danh mục còn hoạt động
module.exports.getAllCategories = async () => {
  const pool = await database.connect();
  const result = await pool.request().query("SELECT * FROM Category WHERE IsActive = 1 AND IsDelete = 0");
  return result.recordset;
}

// Lấy danh mục theo ID
module.exports.getCategoryById = async (id) => {
  const pool = await database.connect();
  const result = await pool.request()
    .input("CategoryID", sql.Int, id)
    .query("SELECT * FROM Category WHERE CategoryID = @CategoryID AND IsActive = 1 AND IsDelete = 0");
  return result.recordset;
}

// Tạo danh mục mới
module.exports.createCategory = async (category) => {
  const pool = await database.connect();
  const result = await pool.request()
    .input("Title", sql.NVarChar, category.Title)
    .input("Description", sql.NVarChar, category.Description || null)
    .input("Image", sql.NVarChar, category.Image || null)
    .query(`
      INSERT INTO Category (Title, [Description], [Image])
      VALUES (@Title, @Description, @Image);
      SELECT SCOPE_IDENTITY() AS CategoryID;
    `);
  return result.recordset[0];
}

// Cập nhật danh mục
module.exports.updateCategory = async (id, category) => {
  const pool = await database.connect();
  await pool.request()
    .input("CategoryID", sql.Int, id)
    .input("Title", sql.NVarChar, category.Title)
    .input("Description", sql.NVarChar, category.Description || null)
    .input("Image", sql.NVarChar, category.Image || null)
    .input("IsActive", sql.Bit, category.IsActive)
    .query(`
      UPDATE Category
      SET Title = @Title, [Description] = @Description, [Image] = @Image, IsActive = @IsActive
      WHERE CategoryID = @CategoryID
    `);
  return true;
}

module.exports.deleteCategory = async (id) => {
  const pool = await database.connect();
  await pool.request()
    .input("CategoryID", sql.Int, id)
    .query("UPDATE Category SET IsDelete = 0 WHERE CategoryID = @CategoryID");
  return true;
}