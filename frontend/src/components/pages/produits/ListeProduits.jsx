import React from "react";
import { motion } from "framer-motion";

const produits = [
  { id: 1, nom: "Ciment 50kg", prix: 5500, stock: 120 },
  { id: 2, nom: "Peinture blanche 10L", prix: 25000, stock: 35 },
  { id: 3, nom: "Clous (1kg)", prix: 1500, stock: 200 },
];

const ListeProduits = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Liste des Produits</h2>
      <table className="w-full border rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="p-3 text-left">Nom</th>
            <th className="p-3">Prix</th>
            <th className="p-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p) => (
            <tr
              key={p.id}
              className="border-t hover:bg-green-50 dark:hover:bg-green-900 transition"
            >
              <td className="p-3">{p.nom}</td>
              <td className="p-3 text-green-600 font-bold">{p.prix.toLocaleString()} FCFA</td>
              <td className="p-3">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ListeProduits;
