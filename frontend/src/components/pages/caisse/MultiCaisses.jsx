import React from "react";

const MultiCaisses = () => {
  const caisses = [
    { nom: "Caisse 1", statut: "Ouverte", montant: "40,000 FCFA" },
    { nom: "Caisse 2", statut: "Fermée", montant: "0 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion Multi-Caisses</h2>
      <ul>
        {caisses.map((c, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {c.nom} - {c.statut} - {c.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MultiCaisses;
