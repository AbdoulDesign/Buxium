import React from "react";

const EcrituresComptables = () => {
  const ecritures = [
    { date: "21/07/2025", libelle: "Vente", montant: "+150,000 FCFA" },
    { date: "20/07/2025", libelle: "Achat", montant: "-50,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Écritures Comptables</h2>
      <ul>
        {ecritures.map((e, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {e.date} - {e.libelle} - {e.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EcrituresComptables;
