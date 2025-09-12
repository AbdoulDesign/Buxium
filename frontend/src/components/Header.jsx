import React from "react";
import { Link } from "react-router-dom";

const Header = ({ setMenuOpen, menuOpen }) => {
  return (
    <header className="h-14 bg-gray-100 flex items-center justify-between px-4 shadow-md">
      {/* Burger menu for mobile */}
      <button
        className="text-black text-2xl p-2 lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      {/* Title for desktop */}
      <h2 className="hidden lg:block text-gray-600 text-2xl font-serif">
        GestioPro
      </h2>

      {/* Logo for mobile */}
      <div className="lg:hidden">
        <Link to="/tableau-de-bord">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" className="w-10 h-10 rounded-full" alt="Logo" />
        </Link>
      </div>

      {/* User avatar */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            alt="User Avatar"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
