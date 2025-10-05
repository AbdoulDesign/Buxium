import React, { useState, useEffect } from "react";
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
  BiX,
} from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../Api";
import logo_transparent from "../../../assets/logo_transparent.png";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { signout } = useAuth();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Vérifie si un lien est actif
  const isActive = (path) => {
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      return path === "/dashboard/tableau-de-bord";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data) {
          setUser(meRes.data);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement :", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const links = [
    { path: "/dashboard/tableau-de-bord", label: "Accueil", icon: <BiHome /> },
    { path: "/dashboard/marchandises", label: "Marchandises", icon: <BiPackage /> },
    { path: "/dashboard/sorties", label: "Sorties", icon: <BiMinusCircle /> },
    { path: "/dashboard/entrees", label: "Entrées", icon: <BiPlusCircle /> },
    { path: "/dashboard/inventaires", label: "Inventaires", icon: <BiBarChart /> },
    { path: "/dashboard/fournisseurs", label: "Fournisseurs", icon: <BiUser /> },
    { path: "/dashboard/finance", label: "Finance", icon: <BiCreditCard /> },
    { path: "/dashboard/rapports", label: "Rapports", icon: <BiFile /> },
    { path: "/dashboard/utilisateurs", label: "Utilisateurs", icon: <BiUser /> },
    { path: "/dashboard/boutiques", label: "Boutiques", icon: <BiSupport /> },
    { path: "/dashboard/souscriptions", label: "Souscriptions", icon: <BiSupport /> },
    { path: "/dashboard/plans", label: "Plans", icon: <BiSupport /> },
    { path: "/dashboard/abonnement", label: "Abonnement", icon: <BiCreditCard /> },
    { path: "/dashboard/parametres", label: "Paramètres", icon: <BiCog /> },
    { path: "/dashboard/aides", label: "Aide", icon: <BiSupport /> },
  ];

  // 🎯 Appliquer les règles de visibilité selon le rôle

  let visibleLinks = [...links];

// Admin : cacher "Paramètres"
if (user?.role === "admin") {
  visibleLinks = visibleLinks.filter((l) => l.label !== "Paramètres");
}

// Boutique ou Personnel : cacher certains liens
if (["boutique", "personnel"].includes(user?.role)) {
  visibleLinks = visibleLinks.filter(
    (l) => !["Souscriptions", "Plans", "Boutiques"].includes(l.label)
  );
}

// Personnel : filtrage selon profil
if (user?.role === "personnel" && user?.profil?.label === "Gerant") {
  visibleLinks = visibleLinks.filter((l) => l.label !== "Utilisateurs");
}

if (user?.role === "personnel" && user?.profil?.label === "Stockiste") {
  visibleLinks = visibleLinks.filter((l) =>
    ["Marchandises", "Sorties", "Entrées", "Inventaires", "Paramètres"].includes(l.label)
  );
}

// Filtrer par recherche
const filteredLinks = visibleLinks.filter((link) =>
  link.label.toLowerCase().includes(filter.toLowerCase())
);

  return (
    <>
      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 h-screen bg-gray-900 text-white flex-col">
        {/* Logo */}
        <div className="p-4 text-2xl font-bold border-b border-white flex items-center gap-2">
          <img src={logo_transparent} alt="Buxium Logo" className="h-8 w-8 object-contain" />
          <span>Buxium</span>
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

          {/* Déconnexion */}
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full text-left font-medium text-sm p-2 rounded-lg flex items-center gap-3 transition hover:bg-red-600 mt-4"
          >
            <BiLogOut /> <span>Déconnexion</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Mobile (Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="relative w-64 h-full bg-gray-900 text-white flex flex-col z-50">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setIsOpen(false)}
            >
              <BiX size={28} />
            </button>

            {/* Logo */}
            <div className="p-4 text-2xl font-bold border-b border-white flex items-center gap-2">
              <img src={logo_transparent} alt="Buxium Logo" className="h-8 w-8 object-contain" />
              <span>Buxium</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2 mt-6 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)} // ferme après clic
                  className={`font-medium text-sm p-2 rounded-lg flex items-center gap-3 transition ${
                    isActive(link.path)
                      ? "bg-[#43AB8A] text-white"
                      : "hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {link.icon} <span>{link.label}</span>
                </Link>
              ))}

              {/* Déconnexion */}
              <button
                onClick={() => {
                  setShowLogoutPopup(true);
                  setIsOpen(false);
                }}
                className="w-full text-left font-medium text-sm p-2 rounded-lg flex items-center gap-3 transition hover:bg-red-600 mt-4"
              >
                <BiLogOut /> <span>Déconnexion</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Popup confirmation Déconnexion */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <h2 className="text-md text-black/80 font-semibold mb-4">
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
                onClick={() => {
                  setShowLogoutPopup(false);
                  signout();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                Oui, déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
