import React from "react";

const Fidelite = () => {
  const cartes = [
    { client: "Jean Dupont", points: 120, statut: "Actif" },
    { client: "Awa Koné", points: 90, statut: "Actif" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Cartes de Fidélité</h2>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">Client</th>
            <th className="p-2">Points</th>
            <th className="p-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {cartes.map((c, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{c.client}</td>
              <td className="p-2">{c.points}</td>
              <td className="p-2">{c.statut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Fidelite;
