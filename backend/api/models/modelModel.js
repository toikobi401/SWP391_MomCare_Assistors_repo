const sql = require("mssql");
const database = require("../config/database");

/**
 * 🧩 Lấy tất cả AI models
 */
module.exports.getAllModels = async () => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .query(`
      SELECT 
        ModelID,
        Name,
        Api_Key,
        description
      FROM Models
      ORDER BY Name ASC
    `);
  return result.recordset;
};

/**
 * 🧩 Lấy chi tiết một model
 */
module.exports.getModelById = async (modelId) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("ModelID", sql.BigInt, modelId)
    .query(`
      SELECT 
        ModelID,
        Name,
        Api_Key,
        description
      FROM Models
      WHERE ModelID = @ModelID
    `);
  return result.recordset[0];
};

/**
 * 🧩 Lấy model theo tên
 */
module.exports.getModelByName = async (name) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("Name", sql.NVarChar(50), name)
    .query(`
      SELECT 
        ModelID,
        Name,
        Api_Key,
        description
      FROM Models
      WHERE Name = @Name
    `);
  return result.recordset[0];
};

/**
 * 🧩 Tạo model mới
 */
module.exports.createModel = async (name, apiKey, description = null) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("Name", sql.NVarChar(50), name)
    .input("Api_Key", sql.NVarChar(150), apiKey)
    .input("description", sql.NVarChar(255), description)
    .query(`
      INSERT INTO Models (Name, Api_Key, description)
      OUTPUT INSERTED.ModelID
      VALUES (@Name, @Api_Key, @description)
    `);
  return result.recordset[0].ModelID;
};

/**
 * 🧩 Cập nhật model
 */
module.exports.updateModel = async (modelId, name, apiKey, description = null) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ModelID", sql.BigInt, modelId)
    .input("Name", sql.NVarChar(50), name)
    .input("Api_Key", sql.NVarChar(150), apiKey)
    .input("description", sql.NVarChar(255), description)
    .query(`
      UPDATE Models 
      SET 
        Name = @Name,
        Api_Key = @Api_Key,
        description = @description
      WHERE ModelID = @ModelID
    `);
};

/**
 * 🧩 Xóa model
 */
module.exports.deleteModel = async (modelId) => {
  const pool = await database.connect();
  await pool
    .request()
    .input("ModelID", sql.BigInt, modelId)
    .query(`
      DELETE FROM Models 
      WHERE ModelID = @ModelID
    `);
};
