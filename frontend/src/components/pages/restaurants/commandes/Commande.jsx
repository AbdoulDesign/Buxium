import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NewOrder from "../commandes/NewOrder";
import OrderList from "../commandes/OrderList";

const sousModules = [
  { id: "commande", label: "Commande" },
  { id: "list_commade", label: "Liste des commandes" },
];

const Commande = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("commande");

  const renderContent = () => {
    switch (activeTab) {
      case "commande":
        return <NewOrder/>;
      case "list_commade":
        return <OrderList/>;
      default:
        return <commande />;
    }
  };

  return (
    <div className={`transition-colors duration-500 ${darkMode ? "dark" : ""}`}>

      {/* Navigation horizontale */}
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow mb-4">
        {sousModules.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === item.id
                ? "bg-green-50 border border-green-500"
                : "bg-gray-50 border border-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Contenu dynamique avec transition */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Commande;
