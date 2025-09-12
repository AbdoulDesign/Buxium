// src/pages/Login.jsx
import React, { useState } from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { login } from "../Api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError("❌ Échec de connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">
            <span className="font-bold text-[#43AB8A]">
              B<span className="text-gray-800">uxium</span>
            </span>
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Connexion à votre espace de gestion
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Nom utilisateur */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Nom utilisateur
            </label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom utilisateur"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-[#43AB8A] focus:ring-2 focus:ring-[#43AB8A] outline-none transition"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:border-[#43AB8A] focus:ring-2 focus:ring-[#43AB8A] outline-none transition"
                required
              />
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#43AB8A] hover:bg-[#369873] transition text-white font-semibold shadow-md"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Mot de passe oublié ?{" "}
            <span className="text-[#43AB8A] font-medium">
              Contacter au +226 07268541
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
