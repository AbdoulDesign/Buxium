import React from "react";

const FAQ = () => {
  const questions = [
    { q: "Comment ajouter un produit ?", r: "Allez dans Produits > Ajouter un Produit." },
    { q: "Comment activer le mode sombre ?", r: "Cliquez sur l'icône de lune en haut à droite." },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">FAQ</h2>
      {questions.map((faq, i) => (
        <div key={i} className="p-4 border rounded mb-3">
          <p className="font-semibold">{faq.q}</p>
          <p className="text-gray-600 dark:text-gray-300">{faq.r}</p>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
