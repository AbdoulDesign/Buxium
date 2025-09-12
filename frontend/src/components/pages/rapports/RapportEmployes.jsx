import React from "react";

const RapportEmployes = () => {
  const employes = [
    { nom: "Ali", ventes: 300000 },
    { nom: "Moussa", ventes: 250000 },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Performance des Employés</h2>
      <ul>
        {employes.map((e, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {e.nom} - {e.ventes} FCFA
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RapportEmployes;
