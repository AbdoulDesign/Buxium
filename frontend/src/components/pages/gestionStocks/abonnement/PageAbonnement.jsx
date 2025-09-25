import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../Api";

const PageAbonnement = () => {
  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const navigate = useNavigate();

  // ⚡ Charger les plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get("/accounts/plans/");
        const apiPlans = res.data;

        const mappedPlans = apiPlans.map((plan) => {
          let extra = {};
          if (plan.name === "Gratuit") {
            extra = {
              details: [
                "Tableau de bord basique",
                "Gestion limitée des ventes",
                "Pas de support avancé",
                "Accès aux mises à jour de base",
              ],
              popularite: false,
            };
          } else if (plan.name === "Mensuel") {
            extra = {
              details: [
                "Tableau de bord complet",
                "Gestion des ventes et stocks illimitée",
                "Inventaire en temps réel",
                "Export PDF/Excel",
                "Support prioritaire 24/7",
                "Mises à jour automatiques",
              ],
              popularite: true,
            };
          } else if (plan.name === "Trimestriel") {
            extra = {
              details: [
                "Toutes les fonctionnalités du plan Mensuel",
                "Gestion multi-boutiques",
                "Accès aux rapports financiers avancés",
                "Bonus exclusifs (formations, intégrations futures)",
              ],
              popularite: false,
            };
          }

          return {
            id: plan.id,
            titre: plan.name,
            prix: plan.price === 0 ? "0 FCFA" : `${plan.price} FCFA`,
            duree:
              plan.duration_days === 7
                ? "1 Semaine"
                : plan.duration_days === 30
                  ? "1 Mois"
                  : plan.duration_days === 90
                    ? "3 Mois"
                    : `${plan.duration_days} jours`,
            ...extra,
          };
        });

        setPlans(mappedPlans);
      } catch (err) {
        console.error("❌ Erreur chargement des plans:", err);
      }
    };

    fetchPlans();
  }, []);

  // ⚡ Charger les abonnements actifs
  useEffect(() => {
  const fetchSubscriptions = async () => {
    try {
      const res = await api.get("/accounts/subscriptions/");
      const subs = res.data;

      if (!subs || subs.length === 0) {
        setActiveSub(null);
        return;
      }

      // Trier par id décroissant → le dernier abonnement est en [0]
      const sorted = [...subs].sort((a, b) => b.id - a.id);

      // On prend celui qui a le plus grand id
      const latest = sorted[0];

      setActiveSub(latest);
    } catch (err) {
      console.error("❌ Erreur chargement abonnements:", err);
    }
  };

  fetchSubscriptions();
}, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* --- Abonnement actif --- */}
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        {activeSub ? (
          <>
            <div className="px-5 py-3 bg-white text-gray-800 rounded-xl shadow border">
              <span className="font-semibold">Type :</span>
              <span className="ml-2 bg-gray-100 px-3 py-1 rounded-lg">
                {activeSub.plan_name}
              </span>
            </div>

            <div className="px-5 py-3 bg-white text-gray-800 rounded-xl shadow border">
              <span className="font-semibold">Statut :</span>
              <span
                className={`ml-2 px-3 py-1 rounded-lg font-medium capitalize ${activeSub.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {activeSub.status === "expired" ? "expiré" : activeSub.status}
              </span>
            </div>

            <div className="px-5 py-3 bg-white text-gray-800 rounded-xl shadow border">
              <span className="font-semibold">Fin :</span>
              <span className="ml-2 bg-gray-100 px-3 py-1 rounded-lg">
                {formatDate(activeSub.end_date)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-gray-600 font-medium">
            Aucun abonnement actif pour le moment.
          </p>
        )}
      </div>

      {/* --- Titre --- */}
      <header className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Choisissez votre abonnement
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Commencez gratuitement ou profitez de nos offres premium pour débloquer
          toutes les fonctionnalités de la plateforme.
        </p>
      </header>

      {/* --- Cartes Plans --- */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isFree = plan.prix === "0 FCFA"; // Gratuit = non cliquable

          return (
            <div
              key={plan.id}
              onClick={() => !isFree && navigate(`/dashboard/abonnement/${plan.id}`)}
              className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transform transition ${!isFree ? "hover:scale-105 hover:shadow-2xl cursor-pointer" : "opacity-95 cursor-not-allowed"
                } ${plan.popularite ? "border-4 border-[#43AB8A]" : "border border-gray-200"}`}
            >
              {plan.popularite && (
                <div className="absolute top-0 -translate-y-1/2 bg-[#43AB8A] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
                  Populaire
                </div>
              )}

              <h2 className="text-2xl font-bold mb-2">{plan.titre}</h2>
              <p className="text-gray-500 mb-4">{plan.duree}</p>
              <p className="text-3xl font-extrabold text-gray-800 mb-6">{plan.prix}</p>

              <ul className="text-gray-600 mb-6 space-y-3">
                {plan.details?.map((d, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-base justify-start"
                  >
                    <FaCheck className="text-[#43AB8A]" /> {d}
                  </li>
                ))}
              </ul>

              <button
                disabled={isFree}
                className={`w-full px-6 py-3 rounded-full font-semibold transition ${plan.popularite
                    ? "bg-[#43AB8A] hover:bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  } ${isFree ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isFree ? "Inclus" : "S’abonner"}
              </button>
            </div>
          );
        })}
      </div>

      {/* --- Footer --- */}
      <footer className="mt-20 text-center text-gray-500 text-sm space-y-2">
        <p>🔒 Paiement sécurisé • Abonnement définitif • Support 24/7</p>
        <p className="text-xs text-gray-400">
          Conformément à nos CGU, les paiements ne sont ni remboursables ni annulables.
        </p>
      </footer>
    </div>
  );
};

export default PageAbonnement;
