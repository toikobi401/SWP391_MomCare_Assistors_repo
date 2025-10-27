const RoleModel = require("../models/roleModel");

// [GET] /api/role/
module.exports.index = async (req, res) => {
  try {
    const roles = await RoleModel.getAllRoles();
    return res.json({
      code: 200,
      message: "Thành công!",
      data: roles,
    });
  } catch (error) {
    console.error(error);
    return res.json({ code: 400, message: "Thất bại!" });
  }
};

// [GET] /api/role/detail/:RoleID
module.exports.detail = async (req, res) => {
  try {
    const role = await RoleModel.getRoleById(req.params.RoleID);
    if (!role) {
      return res.json({ code: 404, message: "Không tìm thấy!" });
    }
    return res.json({ code: 200, message: "Thành công!", data: role });
  } catch (error) {
    console.error(error);
    return res.json({ code: 400, message: "Thất bại!" });
  }
};

// [POST] /api/role/create
module.exports.create = async (req, res) => {
  try {
    if (!req.body.RoleName) {
      return res.json({ code: 400, message: "RoleName là bắt buộc!" });
    }
    await RoleModel.createRole(req.body);
    return res.json({ code: 200, message: "Thêm thành công!" });
  } catch (error) {
    console.error(error);
    return res.json({ code: 400, message: "Thêm thất bại!" });
  }
};

// [PUT] /api/role/update/:RoleID
module.exports.update = async (req, res) => {
  try {
    await RoleModel.updateRole(req.params.RoleID, req.body);
    return res.json({ code: 200, message: "Cập nhật thành công!" });
  } catch (error) {
    console.error(error);
    return res.json({ code: 400, message: "Cập nhật thất bại!" });
  }
};

// [DELETE] /api/role/delete/:RoleID
module.exports.delete = async (req, res) => {
  try {
    await RoleModel.deleteRole(req.params.RoleID);
    return res.json({ code: 200, message: "Xóa thành công!" });
  } catch (error) {
    console.error(error);
    return res.json({ code: 400, message: "Xóa thất bại!" });
  }
};
