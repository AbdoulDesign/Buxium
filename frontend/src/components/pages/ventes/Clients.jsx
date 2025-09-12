import React from "react";
import { motion } from "framer-motion";

const clients = [
  { id: 1, nom: "Ali", achats: 12, total: 150000 },
  { id: 2, nom: "Marie", achats: 8, total: 120000 },
];

const Clients = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-bold mb-4">Clients (CRM)</h2>

      <table className="w-full border rounded shadow overflow-hidden mb-6">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3">Nom</th>
            <th className="p-3">Achats</th>
            <th className="p-3">Total Dépensé</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t hover:bg-green-50 transition">
              <td className="p-3">{c.nom}</td>
              <td className="p-3">{c.achats}</td>
              <td className="p-3 text-blue-600 font-bold">{c.total.toLocaleString()} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="bg-white p-4 rounded shadow text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-600">Clients actifs</p>
          <h3 className="text-2xl font-bold text-green-500">52</h3>
        </motion.div>
        <motion.div
          className="bg-white p-4 rounded shadow text-center"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-600">Valeur client moyenne</p>
          <h3 className="text-2xl font-bold text-blue-500">25 000 FCFA</h3>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Clients;
