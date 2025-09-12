import React from "react";

const RapportsVente = () => {
  const ventes = [
    { jour: "21/07/2025", total: "150,000 FCFA" },
    { jour: "20/07/2025", total: "130,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rapports de Vente</h2>
      <ul>
        {ventes.map((v, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {v.jour} - {v.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RapportsVente;
