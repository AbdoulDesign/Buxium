import React from "react";

const EvaluationFournisseurs = () => {
  const evaluations = [
    { fournisseur: "Fournisseur A", note: 4.5, commentaire: "Fiable et rapide" },
    { fournisseur: "Fournisseur B", note: 4.0, commentaire: "Bon service" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Évaluation des Fournisseurs</h2>
      <ul>
        {evaluations.map((e, i) => (
          <li key={i} className="p-3 border rounded mb-2">
            {e.fournisseur} - ⭐ {e.note} - "{e.commentaire}"
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvaluationFournisseurs;
