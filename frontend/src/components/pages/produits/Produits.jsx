import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ListeProduits from "./ListeProduits";
import AjouterProduit from "./AjouterProduit";
import Categories from "./Categories";
import Variantes from "./Variantes";
import ImportExport from "./ImportExport";

const sousModules = [
  { id: "Liste", label: "Liste Produits" },
  { id: "Ajouter", label: "Ajouter un Produit" },
  { id: "Categories", label: "Catégories" },
  { id: "Variantes", label: "Variantes" },
  { id: "ImportExport", label: "Import/Export" },
];

const Produits = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Liste");

  const renderContent = () => {
    switch (activeTab) {
      case "Liste":
        return <ListeProduits />;
      case "Ajouter":
        return <AjouterProduit />;
      case "Categories":
        return <Categories />;
      case "Variantes":
        return <Variantes />;
      case "ImportExport":
        return <ImportExport />;
      default:
        return <ListeProduits />;
    }
  };

  return (
    <div className={`transition-colors duration-500 ${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Gestion des Produits
      </h1>

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

      {/* Contenu dynamique avec animation */}
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

export default Produits;
