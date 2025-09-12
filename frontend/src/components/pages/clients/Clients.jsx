import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ListeClients from "./ListeClients";
import AjouterClient from "./AjouterClient";
import HistoriqueClients from "./HistoriqueClients";
import Fidelite from "./Fidelite";
import Promotions from "./Promotions";

const sousModules = [
  { id: "Liste", label: "Liste Clients" },
  { id: "Ajouter", label: "Ajouter Client" },
  { id: "Historique", label: "Historique Achats" },
  { id: "Fidelite", label: "Cartes de Fidélité" },
  { id: "Promotions", label: "Promotions Personnalisées" },
];

const Clients = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Liste");

  const renderContent = () => {
    switch (activeTab) {
      case "Liste": return <ListeClients />;
      case "Ajouter": return <AjouterClient />;
      case "Historique": return <HistoriqueClients />;
      case "Fidelite": return <Fidelite />;
      case "Promotions": return <Promotions />;
      default: return <ListeClients />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Module Clients (CRM)</h1>

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

export default Clients;
