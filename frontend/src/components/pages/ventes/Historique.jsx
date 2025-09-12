import React, { useState } from "react";
import { motion } from "framer-motion";

const ventesHistorique = [
  { id: 1, client: "Ali", total: 15000, date: "23/07/2025" },
  { id: 2, client: "Marie", total: 25000, date: "23/07/2025" },
  { id: 3, client: "Paul", total: 18000, date: "22/07/2025" },
  { id: 4, client: "Jeanne", total: 10000, date: "21/07/2025" },
];

const Historique = () => {
  const [filtreDate, setFiltreDate] = useState("");

  const ventesFiltrees = ventesHistorique.filter((v) =>
    filtreDate ? v.date === filtreDate : true
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Historique des Ventes</h2>

      {/* Filtre */}
      <div className="mb-4 flex gap-4">
        <input
          type="date"
          className="border rounded p-2"
          onChange={(e) => setFiltreDate(e.target.value.split("-").reverse().join("/"))}
        />
      </div>

      {/* Tableau */}
      <table className="w-full border rounded overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Client</th>
            <th className="p-3">Total</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {ventesFiltrees.length > 0 ? (
            ventesFiltrees.map((v) => (
              <tr
                key={v.id}
                className="border-t hover:bg-green-50 transition"
              >
                <td className="p-3">{v.client}</td>
                <td className="p-3 text-green-600 font-bold">{v.total.toLocaleString()} FCFA</td>
                <td className="p-3">{v.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-3 text-gray-500">
                Aucune vente trouvée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
};

export default Historique;
