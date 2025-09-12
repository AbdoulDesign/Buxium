import React from "react";

const AjouterCommande = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajouter une Commande</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Nom du fournisseur" className="w-full border p-2 rounded" />
        <input type="text" placeholder="Produit" className="w-full border p-2 rounded" />
        <input type="number" placeholder="Quantité" className="w-full border p-2 rounded" />
        <input type="number" placeholder="Prix Unitaire" className="w-full border p-2 rounded" />
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Créer Commande</button>
      </form>
    </div>
  );
};

export default AjouterCommande;
