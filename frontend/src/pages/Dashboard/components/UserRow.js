import React from "react";
import {
  LuBan,
  LuDot,
  LuLockKeyholeOpen,
  LuPen,
  LuTrash2,
} from "react-icons/lu";
import { useAuth } from "../../../hooks/useAuth";

const UserRow = ({
  user,
  returnIsActive,
  handleEditing,
  handleActiveChange,
  handleDeleteUser,
  userEditing,
  handleRoleChange,
  roleReturn,
}) => {
  const { infoUser } = useAuth();

  return (
    <tr key={user.UserID} className="hover-actions-trigger">
      <td className="align-middle text-nowrap">
        <div className="d-flex align-items-center">
          <div className="avatar avatar-xl">
            <img
              className="avatar-dashboard rounded-circle me-2"
              src={user.Avatar}
              alt={user.Username}
            />
          </div>
          <div className="ms-2 lh-1">
            <h6 style={{ margin: "0px", padding: "0px" }}>{user.Username}</h6>
            <p className="m-0 font-size-12px">Id: {user.UserID}</p>
            <p className="m-0">
              {user.FullName}
              <LuDot />
              {user.Email}
            </p>
          </div>
        </div>
      </td>
      <td className="align-middle text-nowrap">
        {returnIsActive(user.IsActive)}
      </td>
      <td className="align-middle text-nowrap " style={{ width: "120px" }}>
        {userEditing === user.UserID ? (
          <select
            className="form-select form-select-sm w-100"
            defaultValue={user.RoleID}
            onChange={(e) => handleRoleChange(user.UserID, e.target.value)}
          >
            <option value="1">Mom</option>
            <option value="2">Expert</option>
            <option value="3">Admin</option>
          </select>
        ) : (
          roleReturn(user.RoleID)
        )}
      </td>
      <td className="align-middle" style={{ width: "100px" }}>
        <div className="btn-group btn-group hover-actions end-0">
          {/* Nút chỉnh sửa thông tin user */}

          <button
            className={`btn btn-tertiary p-2 rounded-circle me-2 ${
              infoUser?.UserID === user.UserID ? "disabled" : ""
            }`}
            type="button"
            id={`edit-btn-${user.UserID}`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Edit Role"
            onClick={() => {
              handleEditing(user.UserID);
            }}
          >
            <LuPen
              style={{
                fontSize: "1.2rem",
                color: userEditing === user.UserID ? "#007bff" : "black",
                opacity: "75%",
                strokeWidth: "3",
              }}
            />
          </button>

          {/* Nút ban người dùng */}
          {user.IsActive ? (
            <button
              className={`btn btn-tertiary p-2 rounded-circle me-2 ${
                infoUser?.UserID === user.UserID ? "disabled" : ""
              }`}
              type="button"
              id={`ban-btn-${user.UserID}`}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Ban"
              onClick={() => handleActiveChange(user)}
            >
              <LuBan
                style={{
                  fontSize: "1.2rem",
                  color: "red",
                  opacity: "75%",
                  strokeWidth: "3",
                }}
              />
            </button>
          ) : (
            <button
              className={`btn btn-tertiary p-2 rounded-circle me-2 ${
                infoUser?.UserID === user.UserID ? "disabled" : ""
              }`}
              type="button"
              id={`ban-btn-${user.UserID}`}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Ban"
              onClick={() => handleActiveChange(user)}
            >
              <LuLockKeyholeOpen
                style={{
                  fontSize: "1.2rem",
                  color: "green",
                  opacity: "75%",
                  strokeWidth: "3",
                }}
              />
            </button>
          )}

          {/* Nút xóa người dùng */}
          <button
            className={`btn btn-tertiary p-2 rounded-circle ${
              infoUser?.UserID === user.UserID ? "disabled" : ""
            }`}
            type="button"
            id={`delete-btn-${user.UserID}`}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Delete"
            onClick={() => {
              handleDeleteUser(user);
            }}
          >
            <LuTrash2 style={{ fontSize: "1.2rem", color: "black" }} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
