import React from "react";

const Sorties = () => {
  const sorties = [
    {
      numero: "SRT-001",
      reference: "CMD-001",
      designation: "Pizza viande",
      date: "2025-08-01",
      categorie: "Plat principal",
      unite: "Pièce",
      coutUnitaire: 3000,
      quantite: 5,
      total: 15000,
    },
    {
      numero: "SRT-002",
      reference: "CMD-002",
      designation: "Frites + Omelette",
      date: "2025-08-02",
      categorie: "Plat rapide",
      unite: "Assiette",
      coutUnitaire: 1500,
      quantite: 8,
      total: 12000,
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Liste des Sorties</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th>Numéro</th>
            <th>Référence</th>
            <th>Désignation</th>
            <th>Date</th>
            <th>Catégorie</th>
            <th>Unité</th>
            <th>Coût unitaire</th>
            <th>Quantité</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sorties.map((s, index) => (
            <tr key={index} className="border-t text-center">
              <td>{s.numero}</td>
              <td>{s.reference}</td>
              <td>{s.designation}</td>
              <td>{s.date}</td>
              <td>{s.categorie}</td>
              <td>{s.unite}</td>
              <td>{s.coutUnitaire} FCFA</td>
              <td>{s.quantite}</td>
              <td>{s.total} FCFA</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Sorties;
