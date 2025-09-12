import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const InformationsEntreprise = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const activite_id = userData?.activite?.id;

  const API_URL = `http://localhost:8000/api/accounts/entreprises`;

  const [entreprise, setEntreprise] = useState(null);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/${entreprise_id}/`)
      .then((res) => {
        setEntreprise(res.data);
        setFormData({
          username: res.data.username || "",
          nom: res.data.nom || "",
          email: res.data.email || "",
          telephone: res.data.telephone || "",
          adresse: res.data.adresse || "",
          logo: null,
          activite_id: activite_id,
        });
      })
      .catch(() =>
        toast.error("❌ Erreur de chargement des informations")
      );
  }, [API_URL, activite_id, entreprise_id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Mise à jour des informations générales
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) data.append(key, value);
    });

    try {
      await axios.put(`${API_URL}/${entreprise_id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2️⃣ Mise à jour du mot de passe si checkbox activé
      if (showPassword && password) {
        await axios.post(
          `${API_URL}/${entreprise_id}/set_password/`,
          { new_password: password }
        );
      }

      toast.success("✅ Informations mises à jour !", {
        position: "top-center",
        style: {
          background: "#43AB8A",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px 24px",
          borderRadius: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        },
      });
      setPassword(""); // reset champ mot de passe
      setShowPassword(false);
    } catch (error) {
      toast.error("❌ Échec de la mise à jour", {
        position: "top-center",
      });
    }
  };

  if (!entreprise) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        ⏳ Chargement des informations...
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-lg p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-[#43AB8A] flex items-center gap-3">
          🏢 Profil de l’entreprise
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Ligne 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              type="text"
              name="nom"
              placeholder="Nom de l’entreprise"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.nom}
              onChange={handleChange}
            />
          </div>

          {/* Ligne 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="telephone"
              placeholder="Téléphone"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.telephone}
              onChange={handleChange}
            />
          </div>

          {/* Adresse */}
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
            value={formData.adresse}
            onChange={handleChange}
          />

          {/* Logo */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Logo</label>
            {entreprise.logo && !formData.logo && (
              <img
                src={entreprise.logo}
                alt="Logo entreprise"
                className="w-28 h-28 object-cover rounded-xl mb-3 border border-gray-300"
              />
            )}
            <input
              type="file"
              name="logo"
              onChange={handleChange}
              className="text-gray-800"
            />
          </div>

          {/* Checkbox pour afficher le mot de passe */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="changePassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="changePassword" className="text-gray-700">
              Modifier le mot de passe
            </label>
          </div>

          {/* Champ nouveau mot de passe */}
          {showPassword && (
            <input
              type="password"
              name="password"
              placeholder="Nouveau mot de passe"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={password}
              onChange={handlePasswordChange}
            />
          )}

          {/* Bouton Sauvegarder */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#43AB8A] hover:bg-[#37a07a] px-6 py-3 rounded-xl font-semibold transition text-white"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>

      {/* Toaster pour notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

export default InformationsEntreprise;
