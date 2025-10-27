const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy danh sách blog có thể lọc và sắp xếp
 */
module.exports.getBlogsFiltered = async (category = "all", sort = "desc") => {
  const pool = await database.connect();
  const request = pool.request();

  let query = `
    SELECT 
      c.ContentID, 
      c.Title, 
      c.Description, 
      c.CreatedAt,
      cat.CategoryID,
      cat.Title AS CategoryName
    FROM Content c
    INNER JOIN Category cat ON c.CategoryID = cat.CategoryID
    WHERE c.IsDelete = 0 AND c.IsActive = 1
  `;

  // Nếu có category cụ thể
  if (category && category !== "all") {
    query += ` AND c.CategoryID = @category `;
    request.input("category", sql.Int, parseInt(category, 10));
  }

  // Sắp xếp
  const order = sort === "asc" ? "ASC" : "DESC";
  query += ` ORDER BY c.CreatedAt ${order}`;

  const result = await request.query(query);
  return result.recordset;
};

/**
 * 🧩 Lấy toàn bộ blog (fallback cũ)
 */
module.exports.getAllBlogs = async () => {
  const pool = await database.connect();
  const result = await pool.request().query(`
    SELECT 
      c.ContentID, 
      c.Title, 
      c.Description, 
      c.CreatedAt,
      cat.CategoryID,
      cat.Title AS CategoryName
    FROM Content c
    INNER JOIN Category cat ON c.CategoryID = cat.CategoryID
    WHERE c.IsDelete = 0 AND c.IsActive = 1
    ORDER BY c.CreatedAt DESC
  `);
  return result.recordset;
};

/**
 * 🧩 Lấy chi tiết 1 blog
 */
module.exports.getBlogById = async (id) => {
  const pool = await database.connect();
  const result = await pool.request().input("ContentID", sql.Int, id).query(`
      SELECT 
        c.ContentID, 
        c.Title, 
        c.Description, 
        c.CreatedAt,
        cat.Title AS CategoryName,
        u.Username AS Author, 
        u.Avatar
      FROM Content c
      INNER JOIN Category cat ON c.CategoryID = cat.CategoryID
      LEFT JOIN [User] u ON u.UserID = 1 -- giả định admin viết bài
      WHERE c.ContentID = @ContentID AND c.IsDelete = 0 AND c.IsActive = 1
    `);
  return result.recordset[0];
};
