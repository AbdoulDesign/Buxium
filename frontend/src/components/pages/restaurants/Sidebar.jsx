import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ menuOpen, setMenuOpen, activeLink, setActiveLink }) => {
  const handleLinkClick = (path) => {
    setActiveLink(path);
    setMenuOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-white text-gray-800 flex flex-col p-4 space-y-6 transform ${menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:translate-x-0 lg:static lg:w-1/6 shadow-lg`}
    >

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <Link
          to="/TableauDeBord"
          className={`text-sm font-medium p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/TableauDeBord" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/TableauDeBord")}
        >
          <i className="bi bi-house"></i> <span>Accueil</span>
        </Link>

        <Link
          to="/commandes"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/commandes" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/commandes")}
        >
          <i className="bi bi-cart"></i> <span>Commandes</span>
        </Link>
        <Link
          to="/menu"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/menu" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/menu")}
        >
          <i className="bi bi-cart"></i> <span>Menu</span>
        </Link>
        <Link
          to="/stocks"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/stocks" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/stocks")}
        >
          <i className="bi bi-cart"></i> <span>Stocks</span>
        </Link>
        <Link
          to="/achats"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/achats" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/achats")}
        >
          <i className="bi bi-cart"></i> <span>Vente</span>
        </Link>
        <Link
          to="/fournisseurs"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/fournisseurs" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/fournisseurs")}
        >
          <i className="bi bi-cart"></i> <span>fournisseurs</span>
        </Link>
        <Link
          to="/caisse"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/caisse" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/caisse")}
        >
          <i className="bi bi-cart"></i> <span>caisse</span>
        </Link>
        <Link
          to="/comptabilite"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/comptabilite" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/comptabilite")}
        >
          <i className="bi bi-cart"></i> <span>comptabilite</span>
        </Link>
        <Link
          to="/rapports"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/rapports" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/rapports")}
        >
          <i className="bi bi-cart"></i> <span>Rapport</span>
        </Link>
        <Link
          to="/utilisateurs"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/utilisateurs" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/utilisateurs")}
        >
          <i className="bi bi-cart"></i> <span>Utilisateurs</span>
        </Link>
        <Link
          to="/parametres"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/parametres" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/parametres")}
        >
          <i className="bi bi-cart"></i> <span>Parametres</span>
        </Link>
        <Link
          to="/supports"
          className={`font-medium text-sm p-2 rounded-lg flex items-center gap-2 hover:bg-green-100 ${activeLink === "/supports" ? "bg-green-200" : ""
            }`}
          onClick={() => handleLinkClick("/supports")}
        >
          <i className="bi bi-cart"></i> <span>Support $ Aide</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
