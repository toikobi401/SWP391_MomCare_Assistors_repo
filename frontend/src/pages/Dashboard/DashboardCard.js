import React, { useEffect, useState } from "react";
import UserManagement from "./components/UserManagement";
import { LuDot, LuLaptopMinimalCheck, LuCircleX } from "react-icons/lu";
import api from "../../libs/api.js";
import toast from "react-hot-toast";

const DashboardCard = ({ type }) => {
  const [userBuffer, setUserBuffer] = useState([]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const data = await api.get("/users");
      setUserBuffer(data.data);
      toast.success("getUser thành công", {
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
    } catch (error) {
      console.error("Lỗi khi getUser", error);
      toast.error("Lỗi khi getUser", {
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

  const renderCard = (type) => {
    switch (type) {
      case "User Management":
        return <UserManagement userList={userBuffer} handleUpdateList={getUser} />;
      case "Setting":
        return <h1>Waiting...</h1>;
      case "Log Out":
        return <h1>Waiting...</h1>;
      default:
        return (
          <div className="default-content">
            <h5 className="card-title">Select an Option</h5>
            <p className="card-text">
              Please select an option from the sidebar
            </p>
          </div>
        );
    }
  };

  console.log(userBuffer);
  return (
    <div>
      <div className="mb-5">
        <h3>{type}</h3>
        <p className="mouse-pointer">
          <a href="/">Home</a>
          <LuDot />
          {type}
        </p>
      </div>
      <div className="card shadow-lg" style={{ height: "max-content" }}>
        <div className="card-body">{renderCard(type)}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
