import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OuvertureFermeture from "./OuvertureFermeture";
import Encaissements from "./Encaissements";
import RapportCaisse from "./RapportCaisse";
import EcartsAjustements from "./EcartsAjustements";
import MultiCaisses from "./MultiCaisses";

const sousModules = [
  { id: "Ouverture", label: "Ouverture / Fermeture" },
  { id: "Encaissements", label: "Encaissements" },
  { id: "Rapport", label: "Rapport de Caisse" },
  { id: "Ecarts", label: "Écarts & Ajustements" },
  { id: "Multi", label: "Gestion Multi-Caisses" },
];

const Caisse = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Ouverture");

  const renderContent = () => {
    switch (activeTab) {
      case "Ouverture": return <OuvertureFermeture />;
      case "Encaissements": return <Encaissements />;
      case "Rapport": return <RapportCaisse />;
      case "Ecarts": return <EcartsAjustements />;
      case "Multi": return <MultiCaisses />;
      default: return <OuvertureFermeture />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Module Caisse</h1>

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

export default Caisse;
