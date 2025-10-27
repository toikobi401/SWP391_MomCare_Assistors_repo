const sql = require("mssql");
const database = require("../config/database");

// Lấy tất cả Role
module.exports.getAllRoles = async () => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .query("SELECT * FROM [Role] WHERE IsActive = 1 AND IsDelete = 0");
  return result.recordset;
};

// Lấy chi tiết Role theo ID
module.exports.getRoleById = async (RoleID) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("RoleID", sql.Int, RoleID)
    .query("SELECT * FROM [Role] WHERE RoleID = @RoleID AND IsDelete = 0");
  return result.recordset[0];
};

// Tạo mới Role
module.exports.createRole = async (data) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("RoleName", sql.NVarChar(255), data.RoleName) // NOT NULL
    .input(
      "RoleDescription",
      sql.NVarChar(sql.MAX),
      data.RoleDescription || null
    )
    .input("IsActive", sql.Bit, data.IsActive ?? 1) // mặc định = 1
    .input("IsDelete", sql.Bit, 0) // mặc định = 0
    .query(`INSERT INTO [Role] 
      (RoleName, RoleDescription, IsActive, IsDelete) 
      VALUES (@RoleName, @RoleDescription, @IsActive, @IsDelete)`);
  return result.rowsAffected;
};

// Cập nhật Role
module.exports.updateRole = async (RoleID, data) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("RoleID", sql.Int, RoleID)
    .input("RoleName", sql.NVarChar(255), data.RoleName)
    .input(
      "RoleDescription",
      sql.NVarChar(sql.MAX),
      data.RoleDescription || null
    )
    .input("IsActive", sql.Bit, data.IsActive ?? 1).query(`UPDATE [Role] 
      SET RoleName=@RoleName, RoleDescription=@RoleDescription, IsActive=@IsActive
      WHERE RoleID=@RoleID AND IsDelete=0`);
  return result.rowsAffected;
};

// Xóa Role (IsDelete = 1)
module.exports.deleteRole = async (RoleID) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("RoleID", sql.Int, RoleID)
    .query("UPDATE [Role] SET IsDelete = 1 WHERE RoleID=@RoleID");
  return result.rowsAffected;
};
