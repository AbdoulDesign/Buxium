import React from "react";

const EcartsAjustements = () => {
  const ecarts = [
    { type: "Manque", montant: "2,000 FCFA" },
    { type: "Excédent", montant: "500 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Écarts & Ajustements</h2>
      <ul>
        {ecarts.map((e, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {e.type} : {e.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EcartsAjustements;
