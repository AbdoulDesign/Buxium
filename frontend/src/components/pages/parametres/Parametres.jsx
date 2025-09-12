import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InformationsEntreprise from "./InformationsEntreprise";
import CurrencySelector from "./CurrencyAndCategory";

const sousModules = [
  { id: "Entreprise", label: "Informations Entreprise" },
  { id: "Configuration", label: "Configuration" },
];

const Parametres = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Entreprise");

  const renderContent = () => {
    switch (activeTab) {
      case "Entreprise":
        return <InformationsEntreprise />;
      case "Configuration":
        return <CurrencySelector />;
      default:
        return <InformationsEntreprise />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Titre */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
        ⚙️ Paramètres
      </h1>

      {/* Navigation onglets */}
      <div className="flex flex-wrap gap-3 mb-6">
        {sousModules.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-5 py-2 rounded-2xl font-semibold text-md transition-all duration-300 focus:outline-none ${
              activeTab === item.id
                ? "bg-gradient-to-r from-[#43AB8A] to-teal-500 text-white shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 hover:bg-green-100 dark:hover:bg-[#5ea38d]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Contenu dynamique */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Parametres;
