import React from "react";

const RapportAchats = () => {
  const achats = [
    { mois: "Janvier", montant: "800 000 FCFA" },
    { mois: "Février", montant: "600 000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rapport des Achats</h2>
      <ul>
        {achats.map((a, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {a.mois} - {a.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RapportAchats;
