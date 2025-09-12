import React from "react";

const CommandesFournisseurs = () => {
  const commandes = [
    { id: "CMD001", fournisseur: "Fournisseur A", statut: "En attente", montant: "150,000 FCFA" },
    { id: "CMD002", fournisseur: "Fournisseur B", statut: "Livré", montant: "80,000 FCFA" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Commandes Fournisseurs</h2>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">N° Commande</th>
            <th className="p-2">Fournisseur</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Montant</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map((c, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.fournisseur}</td>
              <td className="p-2">{c.statut}</td>
              <td className="p-2">{c.montant}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommandesFournisseurs;
