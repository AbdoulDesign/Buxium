import React from "react";
import { Utensils, Coffee, IceCream, Drumstick } from "lucide-react";

const categories = [
  { label: "Plats africains", icon: <Drumstick size={24} /> },
  { label: "Snacks", icon: <Utensils size={24} /> },
  { label: "Boissons", icon: <Coffee size={24} /> },
  { label: "Desserts", icon: <IceCream size={24} /> },
];

const Categories = () => (
  <div className="max-w-5xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">🗂️ Catégories de Plats</h2>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {categories.map((cat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col items-center justify-center p-6 text-center border border-gray-200 dark:border-gray-700"
        >
          <div className="text-green-600 dark:text-green-400 mb-2">{cat.icon}</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">{cat.label}</h3>
        </div>
      ))}
    </div>
  </div>
);

export default Categories;
