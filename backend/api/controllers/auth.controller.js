const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const RoleModel = require("../models/roleModel");

module.exports.check = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      })
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
    
    const { id, email } = decoded;

    const existAccount = await UserModel.getUserByEmail(email);
    
    if (!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      })
      return;
    }

    const roleDetail = await RoleModel.getRoleById(existAccount.RoleID);
    
    const infoUser = {
      UserID: existAccount.UserID,
      Username: existAccount.Username,
      Email: existAccount.Email,
      RoleName: roleDetail.RoleName,
      // Thông tin cá nhân bổ sung
      FullName: existAccount.FullName,
      Phone: existAccount.Phone,
      DateOfBirth: existAccount.DateOfBirth,
      Address: existAccount.Address,
      Avatar: existAccount.Avatar,
      // Thông tin trạng thái
      IsActive: existAccount.IsActive,
      RoleID: existAccount.RoleID
    };

    res.json({
      code: "success",
      message: "Token hợp lệ!",
      infoUser: infoUser
    })
  } catch (error) {
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Token không hợp lệ!"
    })
    return;
  }

};

module.exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({
    code: "success",
    message: "Đã đăng xuất!"
  })
};