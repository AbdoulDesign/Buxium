import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CommandesFournisseurs from "./CommandesFournisseurs";
import AjouterCommande from "./AjouterCommande";
import Reception from "./Reception";
import HistoriqueAchats from "./HistoriqueAchats";
import GestionFournisseurs from "./GestionFournisseurs";

const sousModules = [
  { id: "Commandes", label: "Commandes Fournisseurs" },
  { id: "Ajouter", label: "Ajouter Commande" },
  { id: "Reception", label: "Réception Marchandises" },
  { id: "Historique", label: "Historique Achats" },
  { id: "Fournisseurs", label: "Gestion Fournisseurs" },
];

const Achats = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Commandes");

  const renderContent = () => {
    switch (activeTab) {
      case "Commandes": return <CommandesFournisseurs />;
      case "Ajouter": return <AjouterCommande />;
      case "Reception": return <Reception />;
      case "Historique": return <HistoriqueAchats />;
      case "Fournisseurs": return <GestionFournisseurs />;
      default: return <CommandesFournisseurs />;
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Module Achats</h1>

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

export default Achats;
