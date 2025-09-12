import React from "react";
import { motion } from "framer-motion";
import { Package, Warehouse, AlertTriangle } from "lucide-react";

const ApercuStock = () => {
  const cards = [
    {
      label: "Produits",
      value: 320,
      icon: <Package size={28} className="text-green-600 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-900",
    },
    {
      label: "Stock Total",
      value: "12,500",
      icon: <Warehouse size={28} className="text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900",
    },
    {
      label: "Alertes",
      value: 8,
      icon: <AlertTriangle size={28} className="text-red-600 dark:text-red-400" />,
      bg: "bg-red-50 dark:bg-red-900",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">📦 Aperçu du Stock</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`${card.bg} p-6 rounded-xl shadow-sm border dark:border-gray-700 transition hover:shadow-md`}
          >
            <div className="flex items-center justify-center mb-4">
              {card.icon}
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm">{card.label}</p>
            <p className="text-center text-3xl font-extrabold text-gray-800 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ApercuStock;
