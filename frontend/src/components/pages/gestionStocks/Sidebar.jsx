import React, { useState } from "react";
import {
  BiHome,
  BiPackage,
  BiPlusCircle,
  BiMinusCircle,
  BiBarChart,
  BiUser,
  BiCreditCard,
  BiFile,
  BiCog,
  BiSupport,
  BiLogOut,
} from "react-icons/bi";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [filter, setFilter] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = () => {
    // Supprimer les infos de session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    setShowLogoutPopup(false);
    navigate("/auth/login"); // redirection vers login
  };

  // Vérifie si un lien est actif
  const isActive = (path) => {
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      // 🚀 Par défaut => Accueil sélectionné
      return path === "/dashboard/tableau-de-bord";
    }
    return location.pathname.startsWith(path);
  };

  const links = [
    { path: "/dashboard/tableau-de-bord", label: "Accueil", icon: <BiHome /> },
    { path: "/dashboard/marchandises", label: "Marchandise", icon: <BiPackage /> },
    { path: "/dashboard/sorties", label: "Sorties", icon: <BiMinusCircle /> },
    { path: "/dashboard/entrees", label: "Entrées", icon: <BiPlusCircle /> },
    { path: "/dashboard/inventaires", label: "Inventaires", icon: <BiBarChart /> },
    { path: "/dashboard/fournisseurs", label: "Fournisseurs", icon: <BiUser /> },
    { path: "/dashboard/finance", label: "Finance", icon: <BiCreditCard /> },
    { path: "/dashboard/rapports", label: "Rapports", icon: <BiFile /> },
    { path: "/dashboard/utilisateurs", label: "Utilisateurs", icon: <BiUser /> },
    { path: "/dashboard/abonnement", label: "Abonnement", icon: <BiCreditCard /> },
    { path: "/dashboard/parametres", label: "Paramètres", icon: <BiCog /> },
    { path: "/dashboard/aides", label: "Aide", icon: <BiSupport /> },
  ];

  const filteredLinks = links.filter((link) =>
    link.label.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 text-2xl font-bold border-b border-white flex items-center gap-2">
        🎓{" "}
        <span className="text-[#43AB8A]">
          B<span className="text-white">uxium</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 mt-6 space-y-1">
        {filteredLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`font-medium text-sm p-2 rounded-lg flex items-center gap-3 transition ${
              isActive(link.path)
                ? "bg-[#43AB8A] text-white"
                : "hover:bg-gray-700 hover:text-white"
            }`}
          >
            {link.icon} <span>{link.label}</span>
          </Link>
        ))}

        {/* 🔴 Déconnexion */}
        <button
          onClick={() => setShowLogoutPopup(true)}
          className="w-full text-left font-medium text-sm p-2 rounded-lg flex items-center gap-3 transition hover:bg-red-600 mt-4"
        >
          <BiLogOut /> <span>Déconnexion</span>
        </button>
      </nav>

      {/* 🔔 Popup confirmation */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">
              Voulez-vous vraiment vous déconnecter ?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Oui, déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
