import React from "react";

const RapportVentes = () => {
  const ventes = [
    { mois: "Janvier", total: "1 500 000 FCFA" },
    { mois: "Février", total: "1 300 000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rapport des Ventes</h2>
      <ul>
        {ventes.map((v, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {v.mois} - {v.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RapportVentes;
