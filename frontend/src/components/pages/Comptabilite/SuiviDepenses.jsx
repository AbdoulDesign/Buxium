import React from "react";

const SuiviDepenses = () => {
  const depenses = [
    { categorie: "Achat matières", montant: "50,000 FCFA" },
    { categorie: "Frais transport", montant: "10,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Suivi des Dépenses</h2>
      <ul>
        {depenses.map((d, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {d.categorie} - {d.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuiviDepenses;
