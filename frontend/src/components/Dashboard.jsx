import React, { useState } from "react";
import Sidebar from "../components/pages/gestionStocks/Sidebar";
import Topbar from "../components/pages/gestionStocks/Topbar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex flex-col flex-1">
        <Topbar/>
        <main className="flex-1 overflow-y-auto p-4">
          <div className="bg-white dark:bg-gray-50 rounded-t-2xl border border-gray-300 dark:border-gray-200 shadow-md p-4 transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
