import React, { useState, useEffect } from "react";
import axios from "axios";
import JustValidate from "just-validate";
import { useAuth } from "../../hooks/useAuth";

export const ProfilePage = () => {
  const { infoUser } = useAuth();
  let userID;
  if (infoUser) {
    userID = infoUser.UserID;
  }

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    Username: "",
    Email: "",
    Phone: "",
    FullName: "",
    DateOfBirth: "",
    Address: "",
    Avatar: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  //  Lấy thông tin user khi vào trang
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/users/detail/${userID}`)
      .then((res) => {
        if (res.data.code === 200) {
          const d = res.data.data;
          setUser(d);
          setFormData({
            Username: d.Username || "",
            Email: d.Email || "",
            Phone: d.Phone || "",
            FullName: d.FullName || "",
            DateOfBirth: d.DateOfBirth ? d.DateOfBirth.split("T")[0] : "",
            Address: d.Address || "",
            Avatar: d.Avatar || "",
          });
        }
      })
      .catch((err) => console.error("Lỗi khi lấy thông tin user:", err));
  }, [userID]);

  const handleChangeFile = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/upload`, {
      method: "POST",
      body: uploadData,
    });

    const data = await response.json();

    const dataFinal = {
      ...user,
      ...formData,
      Avatar: `${data.location}`
    }

    axios
      .put(`${process.env.REACT_APP_API_URL}/users/updateinfor/${userID}`, dataFinal)
      .then((res) => {
        if (res.data.code === 200) {
          alert(res.data.message);
          setEditing(false);
          setUser({ ...user, ...formData, ...dataFinal });
        } else {
          alert(res.data.message);
        }
      })
      .catch((err) => console.error("Lỗi khi cập nhật:", err));
  };

  useEffect(() => {
    if (changePassword) {
      const validator = new JustValidate("#changePasswordForm");

      validator
        .addField('#old-password', [
          {
            rule: 'required',
            errorMessage: 'Vui lòng nhập mật khẩu!',
          },
          {
            validator: (value) => value.length >= 8,
            errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
          },
        ])
        .addField('#password', [
          {
            rule: 'required',
            errorMessage: 'Vui lòng nhập mật khẩu!',
          },
          {
            validator: (value) => value.length >= 8,
            errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!',
          },
        ])
        .addField('#confirm-password', [
          {
            rule: 'required',
            errorMessage: 'Vui lòng xác nhận mật khẩu!',
          },
          {
            validator: (value, fields) => {
              if (
                fields['#password'] &&
                fields['#password'].elem
              ) {
                const repeatPasswordValue = fields['#password'].elem.value;

                return value === repeatPasswordValue;
              }

              return true;
            },
            errorMessage: 'Mật khẩu không trùng lặp',
          },
        ])
        .onSuccess((event) => {
          event.preventDefault();

          const dataFinal = {
            Email: event.target.Email.value,
            OldPassword: event.target.OldPassword.value,
            NewPassword: event.target.Password.value
          };

          fetch(`${process.env.REACT_APP_API_URL}/users/password/change`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataFinal)
          })
            .then(res => res.json())
            .then((data) => {

              if (data.code === "error") {
                alert(data.message);
              }

              if (data.code === "success") {
                setChangePassword(false);
              }
            })

        });
    }
  }, [changePassword])

  if (!user) return <p className="loading">Đang tải thông tin...</p>;

  return (
    <section className="profile-page">
      <div className="container">
        {!changePassword ? (<>
          <h1 className="profile-title">Thông tin cá nhân</h1>

          <div className="inner-content">

            {/* Ảnh đại diện */}
            <div className="profile-field">
              {editing ? (
                <>
                  {/* Preview */}
                  {preview ? (
                    <div className="profile-avatar" style={{ textAlign: "center", marginBottom: "20px" }}>
                      <img
                        src={preview}
                        alt="preview"
                        style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className="profile-avatar" style={{ textAlign: "center", marginBottom: "20px" }}>
                      {user.Avatar ? (
                        <img
                          src={user.Avatar}
                          alt="Avatar"
                          style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <p>Chưa có ảnh đại diện</p>
                      )}
                    </div>
                  )}

                  <form className="row g-3">
                    <div className="mb-3">
                      <label htmlFor="formFile" className="form-label">Ảnh đại diện</label>
                      <input className="form-control" type="file" accept="image/*" onChange={handleChangeFile} />
                    </div>
                  </form>
                </>
              ) : (
                <div className="profile-avatar" style={{ textAlign: "center", marginBottom: "20px" }}>
                  {user.Avatar ? (
                    <img
                      src={`${user.Avatar}`}
                      alt="Avatar"
                      style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <p>Chưa có ảnh đại diện</p>
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="profile-field">
              <label>Email</label>
              {editing ? (
                <input
                  name="Email"
                  defaultValue={formData.Email}
                  disabled
                  className="profile-input"
                />
              ) : (
                <p>{user.Email}</p>
              )}
            </div>

            {/* Tên đăng nhập */}
            <div className="profile-field">
              <label>Tên đăng nhập</label>
              {editing ? (
                <input
                  name="Username"
                  defaultValue={formData.Username}
                  onChange={handleChange}
                  className="profile-input"
                />
              ) : (
                <p>{user.Username}</p>
              )}
            </div>

            {/* Họ tên */}
            <div className="profile-field">
              <label>Họ và tên</label>
              {editing ? (
                <input
                  name="FullName"
                  defaultValue={formData.FullName}
                  onChange={handleChange}
                  className="profile-input"
                />
              ) : (
                <p>{user.FullName || "Chưa cập nhật"}</p>
              )}
            </div>

            {/* Ngày sinh */}
            <div className="profile-field">
              <label>Ngày sinh</label>
              {editing ? (
                <input
                  type="date"
                  name="DateOfBirth"
                  defaultValue={formData.DateOfBirth}
                  onChange={handleChange}
                  className="profile-input"
                />
              ) : (
                <p>{user.DateOfBirth ? user.DateOfBirth.split("T")[0] : "Chưa cập nhật"}</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="profile-field">
              <label>Địa chỉ</label>
              {editing ? (
                <input
                  name="Address"
                  defaultValue={formData.Address}
                  onChange={handleChange}
                  className="profile-input"
                />
              ) : (
                <p>{user.Address || "Chưa cập nhật"}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="profile-field">
              <label>Số điện thoại</label>
              {editing ? (
                <input
                  name="Phone"
                  defaultValue={formData.Phone}
                  onChange={handleChange}
                  className="profile-input"
                />
              ) : (
                <p>{user.Phone}</p>
              )}
            </div>

            {/* Các nút hành động */}
            <div className="profile-actions" style={{ display: "flex", gap: "10px" }}>
              {editing ? (
                <>
                  <button className="btn btn-save" onClick={handleSave}>
                    Lưu thay đổi
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => { setEditing(false); setPreview(null); }}
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-edit" onClick={() => setEditing(true)}>
                    Chỉnh sửa
                  </button>
                  {/*   đổi mật khẩu  */}
                  <button className="btn btn-password" onClick={() => setChangePassword(true)}>
                    Đổi mật khẩu
                  </button>
                </>
              )}
            </div>

          </div>
        </>) : (<>
          <h1 className="profile-title">Đổi mật khẩu</h1>
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className="appointment-form form-wraper" style={{ overflow: "hidden" }}>
                <div className="tab-content" id="myTabContent">

                  <form id="changePasswordForm">
                    <div className="form-group">
                      <input type="text" className="form-control" placeholder="Email" name="Email" id="email" defaultValue={formData.Email} disabled />
                    </div>
                    <div className="form-group">
                      <input type="password" className="form-control" placeholder="Old Password" name="OldPassword" id="old-password" />
                    </div>
                    <div className="form-group">
                      <input type="password" className="form-control" placeholder="New Password" name="Password" id="password" />
                    </div>
                    <div className="form-group">
                      <input type="password" className="form-control" placeholder="Confirm New Password" name="Confirm-password" id="confirm-password" />
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-save">Đổi mật khẩu</button>
                      <button className="btn btn-cancel" onClick={() => setChangePassword(false)} > Hủy </button>
                    </div>
                    <div className="text-center mt-30">
                      <p className="mt-0">Don't remember password?<a href="/forgot-password" data-toggle="tab" style={{ marginLeft: "10px" }}>Reset password</a></p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>)}

      </div>
    </section>
  );
};
