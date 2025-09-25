import React, { useEffect, useState } from "react";
import { BarChart3, Bell, Menu, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../Api";

const Topbar = ({ setIsOpen, isOpen }) => {
  const { user } = useAuth();
  const [boutique, setBoutique] = useState(null);

  useEffect(() => {
    const fetchBoutique = async () => {
      if (user?.id) {
        try {
          const res = await api.get("accounts/boutiques/", {
            withCredentials: true,
          });
          setBoutique(res.data[0]);
        } catch (err) {
          console.error("Erreur chargement des informations :", err);
        }
      }
    };
    fetchBoutique();
  }, [user]);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="md:text-xl font-semibold flex items-center space-x-2">
        <BarChart3 className="w-7 h-7 text-[#43AB8A]" />
        <span>Tableau de Bord</span>
      </h1>

      <div className="flex items-center space-x-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 block w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {boutique && (
          <>
            <span className="text-gray-600 font-medium">{boutique.name}</span>
            {boutique.logo && (
              <img
                src={boutique.logo}
                alt="logo"
                className="hidden md:block w-10 h-10 rounded-full border border-gray-300"
              />
            )}
          </>
        )}

        {/* Bouton Mobile */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
