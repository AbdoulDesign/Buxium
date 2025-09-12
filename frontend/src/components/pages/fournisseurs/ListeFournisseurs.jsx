import React from "react";

const ListeFournisseurs = () => {
  const fournisseurs = [
    { nom: "Fournisseur A", tel: "+226 70 00 00 00", produits: "Ciment, Peinture" },
    { nom: "Fournisseur B", tel: "+226 75 00 00 00", produits: "Outils, Accessoires" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Liste des Fournisseurs</h2>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">Nom</th>
            <th className="p-2">Téléphone</th>
            <th className="p-2">Produits</th>
          </tr>
        </thead>
        <tbody>
          {fournisseurs.map((f, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{f.nom}</td>
              <td className="p-2">{f.tel}</td>
              <td className="p-2">{f.produits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListeFournisseurs;
