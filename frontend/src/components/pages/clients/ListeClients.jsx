import React from "react";

const ListeClients = () => {
  const clients = [
    { nom: "Jean Dupont", email: "jean@mail.com", tel: "+226 70 00 00 00" },
    { nom: "Awa Koné", email: "awa@mail.com", tel: "+226 75 00 00 00" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Liste des Clients</h2>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{c.nom}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">{c.tel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListeClients;
