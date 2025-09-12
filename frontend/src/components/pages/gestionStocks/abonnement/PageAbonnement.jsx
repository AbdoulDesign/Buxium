import React from "react";
import { FaCheck } from "react-icons/fa";

const abonnements = [
  {
    titre: "Essai Gratuit",
    prix: "0 FCFA",
    duree: "1 Semaine",
    details: ["Accès limité aux fonctionnalités", "Support par email"],
    popularite: false,
  },
  {
    titre: "Mensuel",
    prix: "500 FCFA",
    duree: "1 Mois",
    details: ["Accès complet aux fonctionnalités", "Support prioritaire", "Mises à jour automatiques"],
    popularite: true, // On met en avant ce plan
  },
  {
    titre: "Trimestriel",
    prix: "1000 FCFA",
    duree: "3 Mois",
    details: ["Accès complet aux fonctionnalités", "Support prioritaire", "Mises à jour automatiques", "Bonus exclusifs"],
    popularite: false,
  },
];

const PageAbonnement = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-50 p-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Choisissez votre abonnement</h1>
        <p className="text-gray-600 text-lg">
          Commencez gratuitement ou profitez de nos offres mensuelles et trimestrielles pour débloquer toutes les fonctionnalités.
        </p>
      </header>

      {/* Cartes d'abonnement */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {abonnements.map((plan, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transform transition hover:scale-105 ${
              plan.popularite ? "border-4 border-[#43AB8A]" : ""
            }`}
          >
            {plan.popularite && (
              <div className="absolute top-0 -translate-y-1/2 bg-[#43AB8A] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Populaire
              </div>
            )}

            <h2 className="text-2xl font-bold mb-2">{plan.titre}</h2>
            <p className="text-gray-500 mb-4">{plan.duree}</p>
            <p className="text-3xl font-extrabold text-gray-800 mb-6">{plan.prix}</p>

            <ul className="text-gray-600 mb-6 space-y-2">
              {plan.details.map((d, idx) => (
                <li key={idx} className="flex items-center justify-center gap-2">
                  <FaCheck className="text-[#43AB8A]" /> {d}
                </li>
              ))}
            </ul>

            <button
              className={`px-6 py-2 rounded-full font-semibold transition ${
                plan.popularite
                  ? "bg-[#43AB8A] hover:bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              S’abonner
            </button>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <footer className="mt-16 text-center text-gray-600">
        🔒 Paiement sécurisé • Annulation à tout moment • Assistance 24/7
      </footer>
    </div>
  );
};

export default PageAbonnement;
