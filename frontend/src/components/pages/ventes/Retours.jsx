import React from "react";
import { motion } from "framer-motion";

const retours = [
  { id: 1, client: "Ali", produit: "Ciment 50kg", montant: 5500, status: "En attente" },
  { id: 2, client: "Marie", produit: "Peinture 10L", montant: 25000, status: "Validé" },
];

const Retours = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Retours & Échanges</h2>

      <table className="w-full border rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3">Client</th>
            <th className="p-3">Produit</th>
            <th className="p-3">Montant</th>
            <th className="p-3">Statut</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {retours.map((r) => (
            <tr key={r.id} className="border-t hover:bg-green-50 transition">
              <td className="p-3">{r.client}</td>
              <td className="p-3">{r.produit}</td>
              <td className="p-3 text-red-500 font-bold">{r.montant.toLocaleString()} FCFA</td>
              <td className="p-3">{r.status}</td>
              <td className="p-3">
                <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Valider
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default Retours;
