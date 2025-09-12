import React, { useState } from "react";

const Variantes = () => {
  const [variantes, setVariantes] = useState([{ taille: "", couleur: "" }]);

  const ajouterVariante = () => {
    setVariantes([...variantes, { taille: "", couleur: "" }]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des Variantes</h2>
      {variantes.map((v, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input type="text" placeholder="Taille" className="border p-2 rounded" />
          <input type="text" placeholder="Couleur" className="border p-2 rounded" />
        </div>
      ))}
      <button onClick={ajouterVariante} className="bg-green-500 text-white px-4 py-2 rounded">
        Ajouter une variante
      </button>
    </div>
  );
};

export default Variantes;
