import { useState } from "react";
import DashboardCard from "./DashboardCard";
import SideBar from "./SideBar";
import { Toaster } from "react-hot-toast";

export const DashboardPage = () => {
  const [selectedType, setSelectedType] = useState("User Management");

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="dashboard-container d-flex">
        <div className="side-wrapper">
          <SideBar
            onSelectedType={handleTypeSelect}
            selectedType={selectedType}
          />
        </div>
        <div className="card-wrapper px-5">
          <DashboardCard type={selectedType} />
        </div>
      </div>
    </div>
  );
};
