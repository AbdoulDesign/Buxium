import React from "react";

const AjouterFournisseur = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajouter un Fournisseur</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Nom du fournisseur" className="w-full border p-2 rounded" />
        <input type="tel" placeholder="Téléphone" className="w-full border p-2 rounded" />
        <textarea placeholder="Produits fournis" className="w-full border p-2 rounded"></textarea>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ajouter</button>
      </form>
    </div>
  );
};

export default AjouterFournisseur;
