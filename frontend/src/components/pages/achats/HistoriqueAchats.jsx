import React from "react";

const HistoriqueAchats = () => {
  const historiques = [
    { date: "20/07/2025", commande: "CMD001", montant: "150,000 FCFA" },
    { date: "18/07/2025", commande: "CMD002", montant: "80,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Historique des Achats</h2>
      <ul>
        {historiques.map((h, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {h.date} - {h.commande} - {h.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoriqueAchats;
