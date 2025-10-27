const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');

const generateHelper = require("../helpers/generate.helper");
const sendMailHelper = require("../helpers/send-mail.helper");

const client_id = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(client_id);

// [GET] /api/users/
module.exports.index = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    return res.json({
      code: 200,
      message: "Thành công!",
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.json({ code: 404, message: "Thất bại!" });
  }
};

// [GET] /api/users/detail/:UserID
module.exports.detail = async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.UserID);
    if (!user) {
      return res.json({ code: 404, message: "Không tìm thấy!" });
    }
    return res.json({ code: 200, message: "Thành công!", data: user });
  } catch (error) {
    console.error(error);
    return res.json({ code: 404, message: "Thất bại!" });
  }
};

// [GET] /api/users/role/:roleName
module.exports.getUsersByRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    const users = await UserModel.getUsersByRole(roleName);
    return res.json({
      code: 200,
      message: "Thành công!",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.json({ 
      code: 500, 
      message: "Thất bại!",
      error: error.message 
    });
  }
};

// [POST] /api/users/register
module.exports.register = async (req, res) => {
  try {
    const { Email, Username, Password } = req.body;

    const existEmail = await UserModel.getUserByEmail(Email);
    const existUsername = await UserModel.getUserByUsername(Username);

    if (existEmail) {
      return res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!"
      });
    }

    if (existUsername) {
      return res.json({
        code: "error",
        message: "Username đã tồn tại trong hệ thống!"
      });
    }

    // Mã hóa mật khẩu với bcrypt
    const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
    const hashedPassword = await bcrypt.hash(Password, salt); // Mã hóa mật khẩu

    const dataFinal = {
      ...req.body,
      Password: hashedPassword
    };

    await UserModel.createUser(dataFinal);

    return res.json({
      code: "success",
      message: "Đăng ký thành công!"
    });
  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi đăng ký!"
    });
  }
};

// [POST] /api/users/login
module.exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const existAccount = await UserModel.getUserByEmail(Email);

    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!"
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(Password, `${existAccount.Password}`);
    if (!isPasswordValid) {
      res.json({
        code: "error",
        message: "Mật khẩu không đúng!"
      });
      return;
    }

    // Tạo JWT
    const token = jwt.sign(
      {
        id: existAccount.UserID,
        email: existAccount.Email,
      },
      `${process.env.JWT_SECRET}`,
      { expiresIn: '1d' } // Token có thời hạn 1 ngày
    );

    // Lưu token vào cookie
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // Token có hiệu lực trong 1 ngày
      httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server, không thể bị truy cập hoặc thay đổi thông qua JavaScript phía client
      sameSite: "lax", // Cho phép gửi cookie giữa các tên miền
      secure: process.env.NODE_ENV === "production" // true: web có https, false: web không có https -> true thì cookie sẽ chỉ được gửi qua HTTPS (bảo mật hơn)
    });

    return res.json({
      code: "success",
      message: "Đăng nhập thành công!"
    });

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi đăng nhập!"
    });
  }
};

// [POST] /api/users/google-login 
module.exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({
        code: "error",
        message: "Thiếu token Google!"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
    });

    const payload = ticket.getPayload();

    const { email, name, picture } = payload;
    const username = email.slice(0, email.indexOf("@")) + "_" + payload.sub.slice(-5);

    const dataFinal = {
      Email: email,
      Username: username,
      Password: "",
      FullName: name,
      Avatar: picture
    }

    const existAccount = await UserModel.getUserByEmail(email);

    if (!existAccount) {
      await UserModel.createUser(dataFinal);

      const newAccount = await UserModel.getUserByEmail(dataFinal.Email);

      // Tạo JWT
      const token = jwt.sign(
        {
          id: newAccount.UserID,
          email: newAccount.Email,
        },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1d' } // Token có thời hạn 1 ngày
      );

      // Lưu token vào cookie
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // Token có hiệu lực trong 1 ngày
        httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server, không thể bị truy cập hoặc thay đổi thông qua JavaScript phía client
        sameSite: "lax", // Cho phép gửi cookie giữa các tên miền
        secure: process.env.NODE_ENV === "production" // true: web có https, false: web không có https -> true thì cookie sẽ chỉ được gửi qua HTTPS (bảo mật hơn)
      });

      return res.json({
        code: "success",
        message: "Đăng ký thành công!"
      });
    } else {
      // Tạo JWT
      const token = jwt.sign(
        {
          id: existAccount.UserID,
          email: existAccount.Email,
        },
        `${process.env.JWT_SECRET}`,
        { expiresIn: '1d' } // Token có thời hạn 1 ngày
      );

      // Lưu token vào cookie
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // Token có hiệu lực trong 1 ngày
        httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server, không thể bị truy cập hoặc thay đổi thông qua JavaScript phía client
        sameSite: "lax", // Cho phép gửi cookie giữa các tên miền
        secure: process.env.NODE_ENV === "production" // true: web có https, false: web không có https -> true thì cookie sẽ chỉ được gửi qua HTTPS (bảo mật hơn)
      });

      return res.json({
        code: "success",
        message: "Đăng nhập thành công!"
      });
    }

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra với Google!"
    });
  }
};

// [POST] /api/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    const existAccount = await UserModel.getUserByEmail(Email);

    if (!existAccount) {
      return res.json({
        code: "error",
        message: "Email không tồn tại trong hệ thống!"
      });
    }

    const otp = generateHelper.generateRandomNumber(5);

    // Lưu thông tin vào database
    const dataFinal = {
      UserID: existAccount.UserID,
      Code: otp
    }
    await UserModel.saveOTP(dataFinal);

    // Gửi mã OTP qua email
    const subject = `Mã OTP lấy lại lại mật khẩu`;
    const content = `Mã OTP của bạn là: <br> <h1><b>${otp}</b></h1> Tuyệt đối không chia sẻ OTP này cho bất kỳ ai với bất kỳ hình thức nào (có hiệu lực 5 phút).`;

    sendMailHelper.sendMail(Email, subject, content);

    return res.json({
      code: "success",
      message: "Gửi OTP thành công!"
    });

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi gửi OTP!"
    });
  }
};

// [POST] /api/users/password/otp
module.exports.otpPassword = async (req, res) => {
  try {
    const { Email, OTP } = req.body;

    const result = await UserModel.checkOTP(Email, OTP);

    if (!result) {
      return res.json({
        code: "error",
        message: "OTP không hợp lệ!"
      });
    }

    return res.json({
      code: "success",
      message: "Kiểm tra OTP thành công!"
    });

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi kiểm OTP!"
    });
  }
};

// [POST] /api/users/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    await UserModel.resetPassword(Email, Password);

    return res.json({
      code: "success",
      message: "Thay đổi mật khẩu thành công!"
    });

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi Thay đổi mật khẩu!"
    });
  }
};

// [POST] /api/users/password/change
module.exports.changePassword = async (req, res) => {
  try {
    const { Email, OldPassword, NewPassword } = req.body;

    const existAccount = await UserModel.getUserByEmail(Email);

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(OldPassword, `${existAccount.Password}`);
    if (!isPasswordValid) {
      res.json({
        code: "error",
        message: "Mật khẩu cũ không đúng!"
      });
      return;
    }

    await UserModel.resetPassword(Email, NewPassword);

    return res.json({
      code: "success",
      message: "Thay đổi mật khẩu thành công!"
    });

  } catch (error) {
    return res.json({
      code: "error",
      message: "Có lỗi xảy ra khi Thay đổi mật khẩu!"
    });
  }
};

// [PUT] /api/users/updateinfor/:UserID
module.exports.updateinfor = async (req, res) => {
  try {
    console.log(req.body);

    const oldUser = await UserModel.getUserById(req.params.UserID);
    if (!oldUser) {
      return res.json({ code: 404, message: "User không tồn tại!" });
    }
    

    const newData = {
      Username: req.body.Username ?? oldUser.Username,
      Password: req.body.Password ?? oldUser.Password,
      Email: req.body.Email ?? oldUser.Email,
      FullName: req.body.FullName ?? oldUser.FullName,
      Phone: req.body.Phone ?? oldUser.Phone,
      DateOfBirth: req.body.DateOfBirth ?? oldUser.DateOfBirth,
      Address: req.body.Address ?? oldUser.Address,
      Avatar: req.body.Avatar ?? oldUser.Avatar,
      IsActive: req.body.IsActive ?? oldUser.IsActive
    };

    
    await UserModel.updateUserInfor(req.params.UserID, newData);
    return res.json({ code: 200, message: "Cập nhật thành công!" });
  } catch (error) {
    console.error(error);
    return res.json({ code: 404, message: "Cập nhật thất bại!" });
  }
};

// [PUT] /api/users/updaterole/:UserID
module.exports.updaterole = async (req, res) => {
  try {
    if (!req.body.RoleID) {
      return res.json({ code: 400, message: "RoleID là bắt buộc!" });
    }

    const result = await UserModel.updateUserRole(
      req.params.UserID,
      req.body.RoleID
    );

    if (result && result.success === false) {
      return res.status(400).json({ code: 400, message: result.message });
    }

    if (result === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy User để cập nhật" });
    }

    return res.status(200).json({ code: 200, message: "Cập nhật thành công!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500, message: "Lỗi server!" });
  }
};

// [DELETE] /api/users/delete/:UserID
module.exports.delete = async (req, res) => {
  try {
    await UserModel.deleteUser(req.params.UserID);
    return res.json({ code: 200, message: "Xóa thành công!" });
  } catch (error) {
    console.error(error);
    return res.json({ code: 404, message: "Xóa thất bại!" });
  }
};