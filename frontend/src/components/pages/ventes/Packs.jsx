import React from "react";
import { motion } from "framer-motion";

const packs = [
  { id: 1, nom: "Pack Rénovation", contenu: "Ciment, peinture, clous", prix: 50000 },
  { id: 2, nom: "Pack Éco", contenu: "Ciment x3, Clous", prix: 35000 },
];

const Packs = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Packs Promotionnels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packs.map((p) => (
          <motion.div
            key={p.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-xl transition"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-lg font-semibold">{p.nom}</h3>
            <p className="text-gray-600">{p.contenu}</p>
            <p className="text-green-600 font-bold text-xl">{p.prix.toLocaleString()} FCFA</p>
            <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Acheter
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Packs;
