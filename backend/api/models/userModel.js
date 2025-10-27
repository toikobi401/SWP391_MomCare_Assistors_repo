const sql = require("mssql");
const bcrypt = require("bcryptjs");
const database = require("../config/database");

// Lấy tất cả User
module.exports.getAllUsers = async () => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .query("SELECT * FROM [User] WHERE IsDelete = 0");
  return result.recordset;
};

module.exports.getAllActiveUsers = async () => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .query("SELECT * FROM [User] WHERE IsActive = 1 AND  IsDelete = 0");
  return result.recordset;
};

// Lấy chi tiết User theo ID
module.exports.getUserById = async (UserID) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID", sql.Int, parseInt(UserID))
    .query("SELECT * FROM [User] WHERE UserID = @UserID AND IsDelete = 0");
  return result.recordset[0];
};

// Lấy chi tiết User theo Email
module.exports.getUserByEmail = async (Email) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("Email", sql.NVarChar(255), Email)
    .query("SELECT * FROM [User] WHERE Email = @Email AND IsDelete = 0");
  return result.recordset[0] || null;
};

// Lấy chi tiết User theo Username
module.exports.getUserByUsername = async (Username) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("Username", sql.NVarChar(255), Username)
    .query("SELECT * FROM [User] WHERE Username = @Username AND IsDelete = 0");
  return result.recordset[0] || null;
};

// Lấy Users theo Role
module.exports.getUsersByRole = async (roleName) => {
  const pool = await database.connect();
  const result = await pool.request()
    .input("RoleName", sql.NVarChar(100), roleName)
    .query(`
      SELECT u.*, r.RoleName 
      FROM [User] u 
      INNER JOIN [Role] r ON u.RoleID = r.RoleID 
      WHERE r.RoleName = @RoleName AND u.IsActive = 1 AND u.IsDelete = 0
    `);
  return result.recordset;
};

// Tạo mới User
module.exports.createUser = async (data) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("RoleID", sql.Int, data.RoleID || 1)
    .input("Username", sql.NVarChar(255), data.Username)
    .input("Password", sql.NVarChar(255), data.Password)
    .input("Email", sql.NVarChar(255), data.Email)
    .input("FullName", sql.NVarChar(255), data.FullName || null)
    .input("Phone", sql.NVarChar(20), data.Phone || null)
    .input("DateOfBirth", sql.Date, data.DateOfBirth || null)
    .input("Address", sql.NVarChar(500), data.Address || null)
    .input("Avatar", sql.NVarChar(500), data.Avatar || null)
    .input("IsActive", sql.Bit, 1) // default 1
    .input("IsDelete", sql.Bit, 0) // default 0
    .query(`INSERT INTO [User] 
      (RoleID, Username, Password, Email, FullName, Phone, DateOfBirth, Address, Avatar, IsActive, IsDelete) 
      VALUES (@RoleID, @Username, @Password, @Email, @FullName, @Phone, @DateOfBirth, @Address, @Avatar, @IsActive, @IsDelete)`);
  return result.rowsAffected;
};

// Cập nhật thông tin User (không bao gồm Role)
module.exports.updateUserInfor = async (UserID, data) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID", sql.Int, parseInt(UserID))
    .input("Username", sql.NVarChar(255), data.Username ?? null)
    .input("Password", sql.NVarChar(255), data.Password ?? null)
    .input("Email", sql.NVarChar(255), data.Email ?? null)
    .input("FullName", sql.NVarChar(255), data.FullName ?? null)
    .input("Phone", sql.NVarChar(20), data.Phone ?? null)
    .input("DateOfBirth", sql.Date, data.DateOfBirth ?? null)
    .input("Address", sql.NVarChar(500), data.Address ?? null)
    .input("Avatar", sql.NVarChar(500), data.Avatar ?? null)
    .input("IsActive", sql.Bit, data.IsActive ?? 1).query(`UPDATE [User] 
      SET Username=@Username, Password=@Password, Email=@Email, FullName=@FullName, Phone=@Phone, 
          DateOfBirth=@DateOfBirth, Address=@Address, Avatar=@Avatar, IsActive=@IsActive
      WHERE UserID=@UserID AND IsDelete=0`);
  return result.rowsAffected;
};

// Cập nhật Role của User
module.exports.updateUserRole = async (UserID, RoleID) => {
  const pool = await database.connect();

  const roleCheck = await pool
    .request()
    .input("RoleID", sql.Int, RoleID)
    .query("SELECT RoleID FROM [Role] WHERE RoleID=@RoleID AND IsDelete=0");

  if (!roleCheck.recordset || roleCheck.recordset.length === 0) {
    return { success: false, message: "RoleID không tồn tại" };
  }

  const result = await pool
    .request()
    .input("UserID", sql.Int, UserID)
    .input("RoleID", sql.Int, RoleID)
    .query(
      "UPDATE [User] SET RoleID=@RoleID WHERE UserID=@UserID and IsDelete=0"
    );
  return result.rowsAffected[0] > 0;
};

// Xóa User (chuyển IsDelete = 1)
module.exports.deleteUser = async (UserID) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID", sql.Int, UserID)
    .query("UPDATE [User] SET IsDelete = 1 WHERE UserID=@UserID");
  return result.rowsAffected;
};

// Lưu OTP và DB
module.exports.saveOTP = async (data) => {
  const pool = await database.connect();
  const result = await pool
    .request()
    .input("UserID", sql.Int, data.UserID)
    .input("Code", sql.NVarChar(10), data.Code).query(`
      INSERT INTO OTP (UserID, Code) VALUES (@UserID, @Code)
    `);
  return result.rowsAffected;
};

// Check OTP
module.exports.checkOTP = async (email, otpCode) => {
  const pool = await database.connect();

  const result = await pool
    .request()
    .input("Email", sql.NVarChar(255), email)
    .input("OTPCode", sql.NVarChar(10), otpCode).query(`
      SELECT * FROM OTP WHERE UserID = (SELECT UserID FROM [User] WHERE Email = @Email) AND Code = @OTPCode AND IsUsed = 0 AND ExpiredAt > GETDATE()
    `);

  // Nếu có ít nhất 1 bản ghi => OTP hợp lệ
  return result.recordset.length > 0;
};

// Reset Password sau khi nhập đúng OTP
module.exports.resetPassword = async (Email, Password) => {
  const pool = await database.connect();

  const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
  const hashedPassword = await bcrypt.hash(Password, salt); // Mã hóa mật khẩu

  const result = await pool
    .request()
    .input("Email", sql.NVarChar(255), Email)
    .input("Password", sql.NVarChar(255), hashedPassword).query(`
        UPDATE [User]
        SET Password = @Password
        WHERE Email = @Email
      `);

  // Nếu có ít nhất 1 bản ghi => OTP hợp lệ
  return result.recordset;
};
