import React, { useEffect, useState } from "react";
import { LuCircleX, LuLaptopMinimalCheck } from "react-icons/lu";
import api from "../../../libs/api";
import toast from "react-hot-toast";

import Swal from "sweetalert2";

import SearchAndFilter from "./SearchAndFilter";
import UserRow from "./UserRow";
import EmptyList from "./EmptyList";
import UserPagination from "./UserPagination";

const UserManagement = ({ userList, handleUpdateList }) => {
  const [userEditing, setUserEditing] = useState(0);
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const visibleUserLimimt = 10;

  useEffect(() => {
    setPage(1);
  }, []);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEditing = (UserID) => {
    setUserEditing(UserID === userEditing ? null : UserID);
  };

  // Sửa role người dùng
  const handleRoleChange = async (userId, newRole) => {
    try {
      const data = await api.put(`/users/updaterole/${userId}`, {
        RoleID: newRole,
      });

      if (data.code === 200) {
        toast.success("Cập nhật thành công!", {
          icon: (
            <LuLaptopMinimalCheck
              style={{ marginLeft: "20px", fontSize: "1.3rem" }}
            />
          ),
          style: {
            width: "300px",
            height: "60px",
            backgroundColor: "#5bb844ff",
            color: "white",
          },
        });

        handleUpdateList();
        setUserEditing(null);
        // window.location.reload();
      }
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật không thành công!", {
        icon: <LuCircleX style={{ marginLeft: "20px", fontSize: "1.3rem" }} />,
        style: {
          width: "300px",
          height: "60px",
          backgroundColor: "#ff4b4b",
          color: "white",
        },
      });
    }
  };

  // Ban người dùng
  const handleActiveChange = async (user) => {
    try {
      let data = null;
      if (user.IsActive === true) {
        data = await api.put(`/users/updateinfor/${user.UserID}`, {
          UserName: user.Username,
          Password: user.Password,
          Email: user.Email,
          IsActive: false,
        });
      } else if (user.IsActive === false) {
        data = await api.put(`/users/updateinfor/${user.UserID}`, {
          UserName: user.Username,
          Password: user.Password,
          Email: user.Email,
          IsActive: true,
        });
      }
      if (data && data.code === 200) {
        toast.success("Cập nhật thành công!", {
          icon: (
            <LuLaptopMinimalCheck
              style={{ marginLeft: "20px", fontSize: "1.3rem" }}
            />
          ),
          style: {
            width: "300px",
            height: "60px",
            backgroundColor: "#5bb844ff",
            color: "white",
          },
        });

        handleUpdateList();
        // window.location.reload();
      }
    } catch (error) {
      console.log("Lỗi khi sửa trạng thái người dùng: ", error);
      toast.error("Cập nhật không thành công!", {
        icon: <LuCircleX style={{ marginLeft: "20px", fontSize: "1.3rem" }} />,
        style: {
          width: "300px",
          height: "60px",
          backgroundColor: "#ff4b4b",
          color: "white",
        },
      });
    }
  };

  //Xóa người dùng
  const deleteUser = async (userId) => {
    try {
      const data = await api.delete(`/users/delete/${userId}`);
      if (data.code === 200) {
        toast.success("Cập nhật thành công!", {
          icon: (
            <LuLaptopMinimalCheck
              style={{ marginLeft: "20px", fontSize: "1.3rem" }}
            />
          ),
          style: {
            width: "300px",
            height: "60px",
            backgroundColor: "#5bb844ff",
            color: "white",
          },
        });
      }
      handleUpdateList();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast.error("Cập nhật không thành công!", {
        icon: <LuCircleX style={{ marginLeft: "20px", fontSize: "1.3rem" }} />,
        style: {
          width: "300px",
          height: "60px",
          backgroundColor: "#ff4b4b",
          color: "white",
        },
      });
    }
  };

  // Hiện popup trước khi xóa
  const handleDeleteUser = (user) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa người dùng ${user.Username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      confirmButtonColor: "#565acf",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(user.UserID);
      }
    });
  };
  // Thêm cách render theo giá trị roleid
  const roleReturn = (roleid) => {
    if (roleid === 3)
      return (
        <button className="bg-danger-25 px-2 border rounded-pill border-danger text-center text-danger role">
          Admin
        </button>
      );
    else if (roleid === 2)
      return (
        <button className="bg-success-25 px-2 border rounded-pill border-success text-center text-success role">
          Expert
        </button>
      );
    else
      return (
        <button className="bg-primary-25 text-primary border-primary px-2 border rounded-pill border text-center role">
          Mom
        </button>
      );
  };

  // Thêm cách render theo giá trị isActive
  const returnIsActive = (isActive) => {
    if (isActive)
      return (
        <button className="bg-success-25 px-2 border rounded-pill border-success text-center text-success role fw-medium">
          Active
        </button>
      );
    else
      return (
        <button className="bg-danger-25 px-2 border rounded-pill border-danger text-center text-danger role fw-medium">
          Banned
        </button>
      );
  };

  const filteredUsers = userList.filter((user) => {
    // Search filter
    const username = user?.Username?.toLowerCase() || "";
    const email = user?.Email?.toLowerCase() || "";
    const fullName = user?.FullName?.toLowerCase() || "";
    const search = searchKeyword.trim();

    const matchSearch =
      username.includes(search) ||
      email.includes(search) ||
      fullName.includes(search);

    // Role filter
    const matchRole =
      filterRole === "All" ||
      (filterRole === "Admin" && user.RoleID === 3) ||
      (filterRole === "Mom" && user.RoleID === 1) ||
      (filterRole === "Expert" && user.RoleID === 2);

    // Status filter (Active / Banned / All)
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && user.IsActive) ||
      (filterStatus === "Banned" && !user.IsActive);

    return matchSearch && matchRole && matchStatus;
  });

  const filterBtn = [
    {
      type: "role",
      name: "Role",
      list: ["All", "Mom", "Expert", "Admin"],
    },
    {
      type: "status",
      name: "Status",
      list: ["All", "Active", "Banned"],
    },
  ];

  // Lấy filter label
  const getFilterLabel = (filter) => {
    if (filter.type === "role") {
      return filterRole === "All" ? "Role: All" : `Role: ${filterRole}`;
    }
    if (filter.type === "status") {
      return filterStatus === "All" ? "Status: All" : `Status: ${filterStatus}`;
    }
  };

  const visibleUser = filteredUsers.slice(
    (page - 1) * visibleUserLimimt,
    page * visibleUserLimimt
  );

  if (visibleUser === 0) {
    handlePrev();
  }

  const totalPages = Math.ceil(filteredUsers.length / visibleUserLimimt);

  return (
    <div className="table-responsive scrollbar">
      <SearchAndFilter
        filterBtn={filterBtn}
        setFilterRole={setFilterRole}
        setFilterStatus={setFilterStatus}
        getFilterLabel={getFilterLabel}
        setSearchKeyword={setSearchKeyword}
        setPage={setPage}
      />

      {/* Main table content */}
      <table className="table table-hover mt-3">
        <thead>
          <tr className="bg-gray-5">
            <th scope="col" className="fw-bold">
              Người dùng
            </th>
            <th scope="col" className="fw-bold">
              Trạng thái
            </th>
            <th scope="col" className="fw-bold">
              Vai trò
            </th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody style={{ height: "100px" }}>
          {!filteredUsers || filteredUsers.length === 0 ? (
            <EmptyList />
          ) : (
            visibleUser.map((user) => (
              <UserRow
                key={user.UserID}
                user={user}
                filteredUsers={visibleUser}
                returnIsActive={returnIsActive}
                handleEditing={handleEditing}
                handleActiveChange={handleActiveChange}
                handleDeleteUser={handleDeleteUser}
                handleRoleChange={handleRoleChange}
                userEditing={userEditing}
                roleReturn={roleReturn}
              />
            ))
          )}
        </tbody>
      </table>
      <div className="d-flex justify-content-end mt-3">
        <UserPagination
          handleNext={handleNext}
          handlePrev={handlePrev}
          handlePageChange={handlePageChange}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default UserManagement;
