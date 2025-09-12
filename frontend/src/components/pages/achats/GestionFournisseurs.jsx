import React from "react";

const GestionFournisseurs = () => {
  const fournisseurs = [
    { nom: "Fournisseur A", tel: "+226 70 00 00 00" },
    { nom: "Fournisseur B", tel: "+226 75 00 00 00" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des Fournisseurs</h2>
      <ul>
        {fournisseurs.map((f, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {f.nom} - {f.tel}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GestionFournisseurs;
