import React, { useState } from "react";
import Sidebar from "../components/pages/gestionStocks/Sidebar";
import Topbar from "../components/pages/gestionStocks/Topbar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false); // 👈 état pour mobile

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        <Topbar setIsOpen={setIsOpen} isOpen={isOpen} />
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
