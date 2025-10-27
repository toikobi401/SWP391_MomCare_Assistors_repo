import React from "react";
import { LuLogOut, LuSettings, LuUser } from "react-icons/lu";

const SideBar = ({ onSelectedType, selectedType }) => {
  const handleClick = (type) => {
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Call the original handler
    onSelectedType(type);
  };

  return (
    <div className="d-flex justify-content-center align-items-start h-100 bg-light position-relative">
      <div className="bg-white p-4 rounded shadow sidebar">
        <button
          onClick={() => {
            handleClick("User Management");
          }}
          className={`sidebar-item d-flex align-items-center py-2 px-3 rounded-pill hover-bg ${
            selectedType === "User Management" ? "active bg-primary-50" : ""
          }`}
        >
          <LuUser className="me-2" />
          User Management
        </button>
        <button
          onClick={() => {
            handleClick("Setting");
          }}
          className={`sidebar-item d-flex align-items-center py-2 px-3 rounded-pill hover-bg mt-3 ${
            selectedType === "Setting" ? "active bg-primary-50" : ""
          }`}
        >
          <LuSettings className="me-2" />
          Settings
        </button>
        <button
          onClick={() => {
            handleClick("Log Out");
          }}
          className={`sidebar-item d-flex align-items-center py-2 px-3 rounded-pill hover-bg mt-3 ${
            selectedType === "Log Out" ? "active bg-primary-50" : ""
          }`}
        >
          <LuLogOut className="me-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
