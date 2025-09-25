import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../../Api";

const ParametreBoutique = () => {
  const [boutique, setBoutique] = useState(null);
  const [activites, setActivites] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    telephone: "",
    adresse: "",
    logo: null,
    activite: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [userId, setUserId] = useState(null);

  // 1️⃣ Charger l’utilisateur connecté et son id de boutique
  useEffect(() => {
    const loadMe = async () => {
      try {
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data.boutique) {
          setBoutiqueId(meRes.data.boutique.id);
          setUserId(meRes.data.id); // id du User
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Erreur lors du chargement");
      }
    };
    loadMe();
  }, []);

  // 2️⃣ Charger les infos de la boutique
  useEffect(() => {
    const fetchBoutique = async () => {
      try {
        const res = await api.get(`/accounts/boutiques/`);
        const b = res.data[0];

        setBoutique(b);
        setFormData({
          username: b.user?.username || "",
          name: b.name || "",
          telephone: b.telephone || "",
          adresse: b.adresse || "",
          email: b.user?.email || "",
          logo: null,
          activite: b.activite || "",
          is_active: true,
        });
      } catch (err) {
        console.error(err);
        toast.error("❌ Erreur de chargement des informations");
      }
    };
    fetchBoutique();
  }, []);

  // 3️⃣ Charger les activités
  useEffect(() => {
    const fetchActivites = async () => {
      try {
        const res = await api.get("/accounts/activites/");
        setActivites(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Erreur de chargement des activités");
      }
    };
    fetchActivites();
  }, []);

  // 🖊️ Gestion des changements input
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


  // 4️⃣ Envoi des données
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mise à jour de la boutique
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== "email" && key !== "username") {
          data.append(key, value);
        }
      });

      await api.put(`/accounts/boutiques/${boutiqueId}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Mise à jour du user (username + email)
      if (userId) {
        await api.put(`/accounts/users/${userId}/`, {
          username: formData.username,
          email: formData.email,
        });
      }

      // Mise à jour du mot de passe
      if (showPassword && password && userId) {
        await api.put(`/accounts/users/${userId}/`, {
          username: formData.username,
          password: password,
        });
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

      setPassword("");
      setShowPassword(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Échec de la mise à jour");
    }
  };

  if (!boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        ⏳ Chargement des informations...
        <Toaster position="top-right" />
      </div>
    );
  }

  // ✅ Interface
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full bg-white rounded-3xl shadow-lg p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-[#43AB8A] flex items-center gap-3">
          🏢 Profil de la boutique
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Ligne 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.username || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Nom de la boutique"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </div>

          {/* Ligne 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="email"
              name="email"
              placeholder="Email utilisateur"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.email || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="telephone"
              placeholder="Téléphone"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={formData.telephone || ""}
              onChange={handleChange}
            />
          </div>

          {/* Adresse */}
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
            value={formData.adresse || ""}
            onChange={handleChange}
          />

          {/* Logo */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Logo</label>
            {boutique.logo && !formData.logo && (
              <img
                src={boutique.logo}
                alt="Logo boutique"
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

          {/* Checkbox mot de passe */}
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

          {/* Nouveau mot de passe */}
          {showPassword && (
            <input
              type="password"
              name="password"
              placeholder="Nouveau mot de passe"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800"
              value={password || ""}
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

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

export default ParametreBoutique;
