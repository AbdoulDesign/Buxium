import React from "react";

const RapportStock = () => {
  const stocks = [
    { produit: "Ciment", quantite: 120 },
    { produit: "Peinture", quantite: 50 },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Rapport du Stock</h2>
      <ul>
        {stocks.map((s, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {s.produit} - {s.quantite} unités
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RapportStock;
