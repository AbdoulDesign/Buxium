import React from "react";

const Entrees = () => {
  const entrees = [
    {
      numero: "ENT-001",
      reference: "ING-001",
      designation: "Tomates fraîches",
      date: "2025-08-01",
      categorie: "Légumes",
      unite: "Kg",
      coutAchat: 500,
      quantite: 20,
      total: 10000,
    },
    {
      numero: "ENT-002",
      reference: "ING-002",
      designation: "Poulet entier",
      date: "2025-08-02",
      categorie: "Viande",
      unite: "Pièce",
      coutAchat: 3000,
      quantite: 10,
      total: 30000,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Liste des Entrées</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th>Numéro</th>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Unité</th>
            <th>Coût d'achat</th>
            <th>Quantité</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {entrees.map((e, index) => (
            <tr key={index} className="border-t text-center">
              <td>{e.numero}</td>
              <td>{e.reference}</td>
              <td>{e.designation}</td>
              <td>{e.date}</td>
              <td>{e.categorie}</td>
              <td>{e.unite}</td>
              <td>{e.coutAchat} FCFA</td>
              <td>{e.quantite}</td>
              <td>{e.total} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Entrees;
