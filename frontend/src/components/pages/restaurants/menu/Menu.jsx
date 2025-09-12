import React, { useState } from "react";
import Categories from "./Categories";
import Recipes from "./Recipes";
import Plats from "./Plats";
import PlatJour from "./PlatJour";

const tabs = [
  { id: "all", label: "Tous les plats 🍛" },
  { id: "daily", label: "Plats du jour 📅" },
  { id: "categories", label: "Catégories 🗂️" },
  { id: "recipes", label: "Recettes 🍽️" },
];

const Menu = () => {
  const [activeTab, setActiveTab] = useState("all");

  const renderTab = () => {
    switch (activeTab) {
      case "all":
        return <Plats/>;
      case "daily":
        return <PlatJour/>;
      case "categories":
        return <Categories />;
      case "recipes":
        return <Recipes />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              activeTab === tab.id
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="">{renderTab()}</div>
    </div>
  );
};

export default Menu;
