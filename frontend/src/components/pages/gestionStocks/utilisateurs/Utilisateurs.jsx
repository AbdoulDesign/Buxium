import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import UtilisateurModal from "./UtilisateurModal";
import api from "../../../Api";

const Utilisateurs = ({ boutique_id }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profils, setProfils] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfil, setSelectedProfil] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    profil: "",
    username: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // Charger profils et utilisateurs
  useEffect(() => {
    fetchProfils();
    fetchUtilisateurs();
  }, []);

  // Appliquer filtres
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedProfil, utilisateurs]);


  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get("/accounts/subscriptions/");
        const subs = res.data;

        if (!subs || subs.length === 0) {
          setActiveSub(null);
          return;
        }

        // Trier par id décroissant → le dernier abonnement est en [0]
        const sorted = [...subs].sort((a, b) => b.id - a.id);

        // On prend celui qui a le plus grand id
        const latest = sorted[0];

        setActiveSub(latest);
      } catch (err) {
        console.error("❌ Erreur chargement abonnements:", err);
      }
    };

    fetchSubscriptions();
  }, []);

  // Bloquer actions si abonnement inactif
  const checkSubscription = () => {
    if (!activeSub || (activeSub.status === "active" && activeSub.is_expired === false)) {
      // ✅ Abonnement valide → autoriser
      return true;
    }

    // 🚫 Abonnement expiré ou inexistant
    toast.error("🚫 Vous devez prendre un abonnement pour effectuer cette action !");
    return false;
  };

  const fetchProfils = async () => {
    try {
      const res = await api.get("/accounts/profil/");
      setProfils(res.data);
    } catch (err) {
      console.error("Erreur chargement rôles :", err);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const res = await api.get("/accounts/personnels/");
      setUtilisateurs(res.data);
      setFilteredUtilisateurs(res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
    }
  };

  const applyFilters = () => {
    let data = [...utilisateurs];

    if (searchTerm) {
      data = data.filter((u) =>
        u.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProfil) {
      data = data.filter(
        (u) => u.profil === parseInt(selectedProfil)
      );
    }

    setFilteredUtilisateurs(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, showPassword, password) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      name: formData.name,
      profil: formData.profil,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      boutique: boutique_id,
    };

    try {
      if (isEditMode) {
        const res = await api.put(
          `/accounts/personnels/${formData.id}/`,
          payload
        );

        setUtilisateurs(
          utilisateurs.map((u) => (u.id === formData.id ? res.data : u))
        );

        if (showPassword && password) {
          await api.post(
            `/accounts/personnels/${formData.id}/set_password/`,
            { new_password: password }
          );
        }

        toast.success("✅ Utilisateur mis à jour !");
      } else {
        const res = await api.post("/accounts/personnels/", payload);
        setUtilisateurs([...utilisateurs, res.data]);
        toast.success("✅ Utilisateur créé !");
      }

      setFormData({ id: null, name: "", profil: "", username: "", email: "", password: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
    } catch (err) {
      console.error("Erreur :", err.response?.data || err);
      if (err.response?.data?.username) {
        setErrorMessage("❌ Nom d’utilisateur déjà existant !");
      } else if (err.response?.data?.email) {
        setErrorMessage("❌ Cet email est déjà utilisé !");
      } else {
        setErrorMessage("❌ Vous n'etes pas autorisé.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!checkSubscription()) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?"))
      return;

    try {
      await api.delete(`/accounts/personnels/${id}/`);
      setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
      toast.success("🗑️ Utilisateur supprimé !");
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEdit = (user) => {
    if (!checkSubscription()) return;
    setFormData({
      id: user.id,
      name: user.name || "",
      profil: user.profil,
      username: user.user?.username || "",
      email: user.user?.email || "",
      password: "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    if (!checkSubscription()) return;
    setIsEditMode(false);
    setFormData({
      id: null,
      name: "",
      profil: "",
      username: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const getProfilLabel = (id) => {
    const profil = profils.find((p) => p.id === id);
    return profil ? profil.label : "—";
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 rounded-t-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          👥 Gestion des Utilisateurs
        </h1>
        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 bg-[#43AB8A] hover:bg-[#368C6F] text-white px-4 py-2 rounded-lg shadow transition"
        >
          <FiPlus /> Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm flex-1">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par nom d’utilisateur..."
            className="flex-1 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedProfil}
          onChange={(e) => setSelectedProfil(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#43AB8A]"
        >
          <option value="">-- Tous les profils --</option>
          {profils.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table desktop */}
      <div className="hidden md:block overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#43AB8A] text-white text-sm">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">Nom d’utilisateur</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUtilisateurs.length > 0 ? (
              filteredUtilisateurs.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-semibold text-[#43AB8A]">{u.id}</td>
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{getProfilLabel(u.profil)}</td>
                  <td className="p-3 font-medium">{u.user?.username}</td>
                  <td className="p-3 font-medium">{u.user?.email}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 text-yellow-600 transition"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 text-red-600 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-4 text-center text-gray-500 italic"
                >
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vue cartes (mobile) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredUtilisateurs.length > 0 ? (
          filteredUtilisateurs.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
            >
              {/* Ligne du haut */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#43AB8A]">#{u.id}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {getProfilLabel(u.profil)}
                </span>
              </div>

              {/* Infos */}
              <p className="text-gray-800 font-medium">
                {u.name || "—"} ({u.user?.username})
              </p>
              <p className="text-gray-500 text-sm">{u.user?.email}</p>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 text-yellow-600 transition"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="p-2 bg-red-100 rounded-lg hover:bg-red-200 text-red-600 transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            Aucun enregistrement trouvé.
          </p>
        )}
      </div>

      {/* Modal */}
      <UtilisateurModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        profils={profils}
        errorMessage={errorMessage}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
};

export default Utilisateurs;
