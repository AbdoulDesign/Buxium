import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Informationsboutique from "./ParametreBoutique";
import CurrencySelector from "./CurrencyAndCategory";
import api from "../../../Api";
import { FiSettings } from "react-icons/fi";

const sousModules = [
  { id: "Boutique", label: "Informations Boutique" },
  { id: "Configuration", label: "Configuration" },
];

const Parametres = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState("Boutique");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data) {
          setUser(meRes.data);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement :", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const isGerantPersonnel =
    user?.role === "personnel" && user?.profil?.label === "Gerant";

  const isStockistePersonnel =
    user?.role === "personnel" && user?.profil?.label === "Stockiste";

  const renderContent = () => {
    switch (activeTab) {
      case "Boutique":
        // 🚫 Bloquer si Gerant ou Stockiste
        if (isGerantPersonnel || isStockistePersonnel) {
          return (
            <div className="p-6 text-center text-red-500 font-semibold">
              ❌ Accès refusé : Vous n’avez pas la permission de voir cette section.
            </div>
          );
        }
        return <Informationsboutique />;

      case "Configuration":
        return <CurrencySelector />;

      default:
        return <Informationsboutique />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        ⏳ Chargement...
      </div>
    );
  }

  return (
    <div
      className={`${darkMode ? "dark" : ""
        } min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
    >
      {/* Titre */}

      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <FiSettings className="w-8 h-8 text-[#43AB8A]" />
        Paramètres
      </h1>

      {/* Navigation onglets */}
      <div className="flex flex-wrap gap-3 mb-6">
        {sousModules.map((item) => {
          // 🚫 Empêcher le clic sur "Boutique" si Gerant ou Stockiste
          const disabled =
            (isGerantPersonnel || isStockistePersonnel) && item.id === "Boutique";

          return (
            <motion.button
              key={item.id}
              onClick={() => !disabled && setActiveTab(item.id)}
              className={`px-5 py-2 rounded-2xl font-semibold text-md transition-all duration-300 focus:outline-none ${activeTab === item.id
                  ? "bg-gradient-to-r from-[#43AB8A] to-teal-500 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 hover:bg-green-100 dark:hover:bg-[#5ea38d]"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              disabled={disabled}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>

      {/* Contenu dynamique */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-2 transition-all duration-300">
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
