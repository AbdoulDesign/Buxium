import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ menuOpen, setMenuOpen, activeLink, setActiveLink }) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    setActiveLink(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    // Supprimer les infos de session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    setShowLogoutPopup(false);
    navigate("/auth/login"); // redirection vers login
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white text-gray-800 flex flex-col p-4 space-y-6 transform ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 lg:translate-x-0 lg:static lg:w-1/6 shadow-lg`}
    >
      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-grow">
        <Link
          to="/TableauDeBord"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/TableauDeBord" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/TableauDeBord")}
        >
          <i className="bi bi-house text-xl"></i> <span>Tableau de bord</span>
        </Link>

        <Link
          to="/ventes"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/ventes" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/ventes")}
        >
          <i className="bi bi-cart text-xl"></i> <span>Ventes</span>
        </Link>

        <Link
          to="/produits"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/produits" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/produits")}
        >
          <i className="bi bi-box-seam text-xl"></i> <span>Produits</span>
        </Link>

        <Link
          to="/stocks"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/stocks" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/stocks")}
        >
          <i className="bi bi-stack text-xl"></i> <span>Stocks</span>
        </Link>

        <Link
          to="/achats"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/achats" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/achats")}
        >
          <i className="bi bi-bag text-xl"></i> <span>Achats</span>
        </Link>

        <Link
          to="/clients"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/clients" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/clients")}
        >
          <i className="bi bi-people text-xl"></i> <span>Clients</span>
        </Link>

        <Link
          to="/fournisseurs"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/fournisseurs" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/fournisseurs")}
        >
          <i className="bi bi-truck text-xl"></i> <span>Fournisseurs</span>
        </Link>

        <Link
          to="/caisse"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/caisse" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/caisse")}
        >
          <i className="bi bi-cash-stack text-xl"></i> <span>Caisse</span>
        </Link>

        <Link
          to="/comptabilite"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/comptabilite" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/comptabilite")}
        >
          <i className="bi bi-bar-chart text-xl"></i> <span>Comptabilité</span>
        </Link>

        <Link
          to="/rapports"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/rapports" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/rapports")}
        >
          <i className="bi bi-file-earmark-text text-xl"></i> <span>Rapports</span>
        </Link>

        <Link
          to="/utilisateurs"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/utilisateurs" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/utilisateurs")}
        >
          <i className="bi bi-person-badge text-xl"></i> <span>Utilisateurs</span>
        </Link>

        <Link
          to="/parametres"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/parametres" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/parametres")}
        >
          <i className="bi bi-gear text-xl"></i> <span>Paramètres</span>
        </Link>

        <Link
          to="/supports"
          className={`text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${
            activeLink === "/supports" ? "bg-green-200" : ""
          }`}
          onClick={() => handleLinkClick("/supports")}
        >
          <i className="bi bi-question-circle text-xl"></i> <span>Support & Aide</span>
        </Link>
      </nav>

      {/* 🔴 Bouton Déconnexion */}
      <div className="mt-auto border-t pt-4">
        <button
          onClick={() => setShowLogoutPopup(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow"
        >
          <i className="bi bi-box-arrow-right text-lg"></i> Déconnexion
        </button>
      </div>

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
    </aside>
  );
};

export default Sidebar;
