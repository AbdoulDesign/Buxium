import React, { useState } from "react";

const produits = [
  { id: 1, nom: "Ciment 50kg", prix: 5500 },
  { id: 2, nom: "Peinture blanche 10L", prix: 25000 },
  { id: 3, nom: "Clous (1kg)", prix: 1500 },
  { id: 4, nom: "Tuyau PVC 1m", prix: 800 },
];

const POS = () => {
  const [panier, setPanier] = useState([]);

  const ajouterAuPanier = (produit) => {
    setPanier([...panier, produit]);
  };

  const total = panier.reduce((acc, p) => acc + p.prix, 0);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Point de Vente (POS)</h2>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {produits.map((p) => (
          <div
            key={p.id}
            className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{p.nom}</h3>
            <p className="text-green-600 font-bold">{p.prix.toLocaleString()} FCFA</p>
            <button
              onClick={() => ajouterAuPanier(p)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter
            </button>
          </div>
        ))}
      </div>

      {/* Panier */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Panier</h3>
        {panier.length === 0 ? (
          <p>Aucun produit ajouté.</p>
        ) : (
          <ul className="mb-2">
            {panier.map((p, index) => (
              <li key={index} className="flex justify-between border-b py-1">
                {p.nom} <span>{p.prix.toLocaleString()} FCFA</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xl font-bold text-right">Total : {total.toLocaleString()} FCFA</p>
      </div>
    </div>
  );
};

export default POS;
