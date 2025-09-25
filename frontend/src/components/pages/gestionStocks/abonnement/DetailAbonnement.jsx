import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCheck } from "react-icons/fa";
import api from "../../../Api";
import CountryModal from "./CountryModal";

const DetailAbonnement = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boutiqueId, setBoutiqueId] = useState(null);

  // ⚡ Charger le plan, les pays et boutique
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Plan ---
        const resPlan = await api.get(`/accounts/plans/${id}/`);
        const data = resPlan.data;

        let extra = {};
        if (data.name === "Gratuit") {
          extra = {
            details: ["Accès limité aux fonctionnalités", "Support par email"],
            popularite: false,
            duree: "1 Semaine",
          };
        } else if (data.name === "Mensuel") {
          extra = {
            details: [
              "Accès complet aux fonctionnalités",
              "Support prioritaire",
              "Mises à jour automatiques",
            ],
            popularite: true,
            duree: "1 Mois",
          };
        } else if (data.name === "Trimestriel") {
          extra = {
            details: [
              "Accès complet aux fonctionnalités",
              "Support prioritaire",
              "Mises à jour automatiques",
              "Bonus exclusifs",
            ],
            popularite: false,
            duree: "3 Mois",
          };
        }

        setPlan({
          id: data.id,
          titre: data.name,
          prix: data.price === 0 ? "0 FCFA" : `${data.price} FCFA`,
          ...extra,
        });

        // --- Pays ---
        const resCountries = await api.get(`/pawapay/`);
        setCountries(resCountries.data.countries || []);

        // --- Boutique ---
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data.boutique) setBoutiqueId(meRes.data.boutique.id);
      } catch (err) {
        console.error("❌ Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20"></div>
        <style>{`
          .loader {
            border-top-color: #43AB8A;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!plan) return <p className="text-center p-8 text-gray-500">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
        {/* Carte plan */}
        <div className="bg-white rounded-3xl shadow-xl p-10 flex flex-col justify-between max-h-[600px] overflow-y-auto">
          {plan.popularite && (
            <div className="mb-4 inline-block bg-[#43AB8A] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
              Populaire
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
            {plan.titre}
          </h1>
          <p className="text-gray-500 mb-4 text-lg">{plan.duree}</p>
          <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            {plan.prix}
          </p>

          <ul className="text-gray-700 mb-6 space-y-2">
            {plan.details?.map((d, idx) => (
              <li key={idx} className="flex items-center gap-3 text-base md:text-lg">
                <FaCheck className="text-[#43AB8A]" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Liste des pays */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col max-h-[600px] overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
            Choisissez votre pays
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {countries.map((country) => (
              <div
                key={country.country}
                onClick={() => handleCountryClick(country)}
                className="cursor-pointer flex items-center gap-3 p-4 border border-gray-200 rounded-2xl hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-b from-white to-gray-50"
              >
                <img
                  src={country.flag}
                  alt={country.displayName.fr}
                  className="w-10 h-6 object-cover rounded-sm"
                />
                <span className="font-medium text-gray-700">
                  {country.displayName.fr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <CountryModal
          country={selectedCountry}
          plan={plan}
          boutiqueId={boutiqueId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DetailAbonnement;
