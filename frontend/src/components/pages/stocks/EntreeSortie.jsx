import React, { useState } from "react";
import { motion } from "framer-motion";

const EntreeSortie = () => {
  const [formData, setFormData] = useState({
    type: "Entrée",
    produit: "",
    quantite: "",
    motif: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de sauvegarde à implémenter
    console.log("Données enregistrées :", formData);
  };

  return (
    <motion.div
      className="max-w-lg mx-auto bg-white dark:bg-gray-900 shadow rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        📥 Entrée / ➖ Sortie de Stock
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Type de mouvement
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800"
          >
            <option>Entrée</option>
            <option>Sortie</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom du produit
          </label>
          <input
            name="produit"
            type="text"
            placeholder="Ex: Huile, Riz, Poisson"
            value={formData.produit}
            onChange={handleChange}
            className="w-full border dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantité (kg, L, unités)
          </label>
          <input
            name="quantite"
            type="number"
            placeholder="Ex: 10"
            value={formData.quantite}
            onChange={handleChange}
            className="w-full border dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Motif / Source (fournisseur ou perte)
          </label>
          <input
            name="motif"
            type="text"
            placeholder="Ex: Achat marché, Perte, Expiré..."
            value={formData.motif}
            onChange={handleChange}
            className="w-full border dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Enregistrer le Mouvement
        </button>
      </form>
    </motion.div>
  );
};

export default EntreeSortie;
