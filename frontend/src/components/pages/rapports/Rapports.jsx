import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RapportVentes from "./RapportVentes";
import RapportStock from "./RapportStock";
import RapportAchats from "./RapportAchats";
import RapportEmployes from "./RapportEmployes";
import RapportBenefices from "./RapportBenefices";

const sousModules = [
  { id: "Ventes", label: "Rapport Ventes" },
  { id: "Stock", label: "Rapport Stock" },
  { id: "Achats", label: "Rapport Achats" },
  { id: "Employes", label: "Performance Employés" },
  { id: "Benefices", label: "Rapport Bénéfices" },
];

const Rapports = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Ventes");

  const renderContent = () => {
    switch (activeTab) {
      case "Ventes": return <RapportVentes />;
      case "Stock": return <RapportStock />;
      case "Achats": return <RapportAchats />;
      case "Employes": return <RapportEmployes />;
      case "Benefices": return <RapportBenefices />;
      default: return <RapportVentes />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Module Rapports</h1>

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

export default Rapports;
