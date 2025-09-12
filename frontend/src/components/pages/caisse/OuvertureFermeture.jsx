import React from "react";

const OuvertureFermeture = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ouverture / Fermeture de Caisse</h2>
      <p className="mb-4">Déclarez le montant initial à l'ouverture et validez la fermeture en fin de journée.</p>
      <form className="space-y-4">
        <input type="number" placeholder="Montant d'ouverture" className="w-full border p-2 rounded" />
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ouvrir la caisse</button>
      </form>
    </div>
  );
};

export default OuvertureFermeture;
