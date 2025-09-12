import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApercuStock from "./ApercuStock";
import Inventaire from "./Inventaire";
import Alertes from "./Alertes";
import Entrees from "./Entrees";
import Sorties from "./Sorties";

const sousModules = [
  { id: "Apercu", label: "Aperçu Stock" },
  { id: "Entree", label: "Entrée" },
  { id: "Sortie", label: "Sortie" },
  { id: "Inventaire", label: "Inventaire" },
  { id: "Alertes", label: "Alertes Rupture" },
];

const Stock = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Apercu");

  const renderContent = () => {
    switch (activeTab) {
      case "Apercu": return <ApercuStock />;
      case "Entree": return <Entrees/>;
      case "Sortie": return <Sorties/>;
      case "Inventaire": return <Inventaire />;
      case "Alertes": return <Alertes />;
      default: return <ApercuStock />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>

      {/* Navigation horizontale */}
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow mb-4">
        {sousModules.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === item.id
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Contenu dynamique */}
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

export default Stock;
