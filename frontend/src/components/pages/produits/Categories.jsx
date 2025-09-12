import React from "react";
import { motion } from "framer-motion";

const categories = ["Matériaux", "Peintures", "Accessoires"];

const Categories = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Catégories & Sous-Catégories</h2>
      <ul className="space-y-2">
        {categories.map((cat, index) => (
          <motion.li
            key={index}
            className="p-3 bg-gray-100 dark:bg-gray-800 rounded shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            {cat}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
