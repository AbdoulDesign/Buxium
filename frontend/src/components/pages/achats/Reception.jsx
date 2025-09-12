import React from "react";

const Reception = () => {
  const receptions = [
    { id: "CMD001", produit: "Ciment 50kg", quantite: 100, statut: "Réceptionné" },
    { id: "CMD002", produit: "Peinture 10L", quantite: 50, statut: "En attente" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Réception Marchandises</h2>
      <ul>
        {receptions.map((r, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {r.produit} - {r.quantite} unités ({r.statut})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reception;
