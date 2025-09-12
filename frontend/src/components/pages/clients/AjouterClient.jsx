import React from "react";

const AjouterClient = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajouter un Client</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Nom complet" className="w-full border p-2 rounded" />
        <input type="email" placeholder="Email" className="w-full border p-2 rounded" />
        <input type="tel" placeholder="Téléphone" className="w-full border p-2 rounded" />
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ajouter</button>
      </form>
    </div>
  );
};

export default AjouterClient;
