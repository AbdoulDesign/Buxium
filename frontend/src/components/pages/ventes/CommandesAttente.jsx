import React from "react";

const commandes = [
  { id: 1, client: "Ali", total: 15000, date: "24/07/2025" },
  { id: 2, client: "Marie", total: 7500, date: "24/07/2025" },
];

const CommandesAttente = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Commandes en Attente</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Client</th>
            <th className="p-2">Total</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.client}</td>
              <td className="p-2">{c.total.toLocaleString()} FCFA</td>
              <td className="p-2">{c.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommandesAttente;
