import React from "react";

const NouvelleVente = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Nouvelle Vente</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-600 mb-1">Client</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Nom du client"
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Produit</label>
          <select className="w-full border rounded p-2">
            <option>Ciment 50kg</option>
            <option>Peinture 10L</option>
            <option>Clous 1kg</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Quantité</label>
          <input type="number" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-gray-600 mb-1">Remise (%)</label>
          <input type="number" className="w-full border rounded p-2" />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Valider la vente
        </button>
      </form>
    </div>
  );
};

export default NouvelleVente;
