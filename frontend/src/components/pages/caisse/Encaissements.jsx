import React from "react";

const Encaissements = () => {
  const encaissements = [
    { mode: "Espèces", montant: "50,000 FCFA" },
    { mode: "Mobile Money", montant: "30,000 FCFA" },
    { mode: "Carte bancaire", montant: "20,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Encaissements</h2>
      <ul>
        {encaissements.map((e, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {e.mode} : {e.montant}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Encaissements;
