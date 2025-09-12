// src/components/Topbar.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, Bell } from "lucide-react"; // 👈 import icônes

const Topbar = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;

  const API_URL = `http://localhost:8000/api/accounts/entreprises/${entreprise_id}/`;

  const [entreprise, setEntreprise] = useState(null);

  useEffect(() => {
    if (entreprise_id) {
      axios
        .get(API_URL)
        .then((res) => {
          setEntreprise(res.data);
        })
        .catch((err) => {
          console.error("Erreur chargement des informations :", err);
        });
    }
  }, [API_URL, entreprise_id]);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold flex items-center space-x-2">
        <BarChart3 className="w-7 h-7 text-[#43AB8A]" />
        <span>Tableau de Bord</span>
      </h1>

      <div className="flex items-center space-x-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {entreprise && (
          <>
            <span className="text-gray-600 font-medium">{entreprise.nom}</span>
            {entreprise.logo && (
              <img
                src={entreprise.logo}
                alt="logo entreprise"
                className="w-10 h-10 rounded-full border border-gray-300"
              />
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Topbar;
