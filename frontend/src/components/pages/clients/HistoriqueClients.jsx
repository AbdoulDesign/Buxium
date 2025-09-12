import React from "react";

const HistoriqueClients = () => {
  const historiques = [
    { client: "Jean Dupont", achat: "Ciment 50kg", date: "21/07/2025", montant: "12,000 FCFA" },
    { client: "Awa Koné", achat: "Peinture 10L", date: "20/07/2025", montant: "8,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Historique des Achats</h2>
      <ul>
        {historiques.map((h, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {h.client} - {h.achat} - {h.date} ({h.montant})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoriqueClients;
