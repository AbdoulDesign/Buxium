// src/components/auth/Login.jsx
import React, { useState } from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo_transparent from "../../assets/logo_transparent.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signin, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signin(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Échec de connexion. Vérifiez vos identifiants."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-4xl font-extrabold tracking-tight flex items-center justify-center gap-2">
                    <img
                            src={logo_transparent}
                            alt="Buxium Logo"
                            className="h-10 w-10 object-contain"
                          />
                    <span className="text-black/70">Buxium</span>
                  </div>
          <p className="text-gray-600 text-sm mt-2">Connexion à votre espace de gestion</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Nom utilisateur</label>
            <div className="relative">
              <FiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom utilisateur"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Mot de passe</label>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#43AB8A] hover:bg-[#369873] text-white font-semibold"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
