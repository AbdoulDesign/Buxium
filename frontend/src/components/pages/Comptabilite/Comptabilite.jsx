import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RapportsVente from "./RapportsVente";
import RapportTVA from "./RapportTVA";
import SuiviDepenses from "./SuiviDepenses";
import EcrituresComptables from "./EcrituresComptables";
import ExportComptable from "./ExportComptable";

const sousModules = [
  { id: "Rapports", label: "Rapports de Vente" },
  { id: "TVA", label: "Rapport TVA / Taxes" },
  { id: "Depenses", label: "Suivi des Dépenses" },
  { id: "Ecritures", label: "Écritures Comptables" },
  { id: "Export", label: "Export Comptable" },
];

const Comptabilite = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Rapports");

  const renderContent = () => {
    switch (activeTab) {
      case "Rapports": return <RapportsVente />;
      case "TVA": return <RapportTVA />;
      case "Depenses": return <SuiviDepenses />;
      case "Ecritures": return <EcrituresComptables />;
      case "Export": return <ExportComptable />;
      default: return <RapportsVente />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Module Comptabilité</h1>

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

export default Comptabilite;
