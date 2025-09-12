import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const Alertes = () => {
  const alertes = [
    { produit: "Clous 1kg", quantite: 3, type: "produit" },
    { produit: "Ciment 50kg", quantite: 5, type: "produit" },
    { produit: "Poulet DG", quantite: 0, type: "plat" },
  ];

  const handleReapprovisionnement = (produit) => {
    alert(`Réapprovisionnement rapide pour : ${produit}`);
    // Ici tu peux rediriger vers une page de stock ou formulaire.
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-red-600 flex items-center">
        <AlertCircle className="mr-2 text-red-600" />
        Alertes de Rupture de Stock
      </h2>
      {alertes.length === 0 ? (
        <p className="text-gray-500">✅ Aucun produit/plat en rupture.</p>
      ) : (
        <ul className="space-y-4">
          {alertes.map((a, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-red-100 dark:bg-red-900/40 p-4 rounded-lg shadow-sm"
            >
              <div>
                <p className="text-lg font-semibold text-red-800 dark:text-red-300">
                  {a.type === "plat" ? "🍽️" : "🧱"} {a.produit}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Stock restant : {a.quantite === 0 ? "rupture totale" : a.quantite}
                </p>
              </div>
              <button
                onClick={() => handleReapprovisionnement(a.produit)}
                className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Réapprovisionner
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Alertes;
