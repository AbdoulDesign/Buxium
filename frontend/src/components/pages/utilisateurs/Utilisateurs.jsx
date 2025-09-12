import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import UtilisateurModal from "./UtilisateurModal";

const API_URL = "http://localhost:8000/api/accounts/utilisateurs/";
const ROLES_URL = "http://localhost:8000/api/accounts/roles/";

const Utilisateurs = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    nom: "",
    role: "",
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Charger rôles et utilisateurs
  useEffect(() => {
    fetchRoles();
    fetchUtilisateurs();
  }, []);

  // Appliquer les filtres à chaque changement
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedRole, utilisateurs]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(ROLES_URL);
      setRoles(res.data);
    } catch (err) {
      console.error("Erreur chargement rôles :", err);
    }
  };

  const fetchUtilisateurs = async () => {
  try {
    const res = await axios.get(API_URL);
    // Filtrer uniquement les utilisateurs de l’entreprise connectée
    const filtered = res.data.filter((u) => u.entreprise === entreprise_id);

    setUtilisateurs(filtered);
    setFilteredUtilisateurs(filtered);
  } catch (err) {
    console.error("Erreur chargement utilisateurs :", err);
  }
};

  // Filtres
  const applyFilters = () => {
    let data = [...utilisateurs];

    if (searchTerm) {
      data = data.filter((u) =>
        u.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      data = data.filter((u) => u.role?.id === parseInt(selectedRole));
    }

    setFilteredUtilisateurs(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, showPassword, password) => {
    e.preventDefault();
    setErrorMessage("");

    const newUser = {
      nom: formData.nom,
      role_id: formData.role,
      username: formData.username,
      is_active: true,
      entreprise: entreprise_id,
    };

    try {
      if (isEditMode) {
        const res = await axios.put(`${API_URL}${formData.id}/`, newUser);
        setUtilisateurs(
          utilisateurs.map((u) => (u.id === formData.id ? res.data : u))
        );

        if (showPassword && password) {
          await axios.post(`${API_URL}${formData.id}/set_password/`, {
            new_password: password,
          });
        }

        toast.success("✅ Utilisateur mis à jour !");
      } else {
        const res = await axios.post(API_URL, {
          ...newUser,
          password: formData.password,
        });
        setUtilisateurs([...utilisateurs, res.data]);
        toast.success("✅ Utilisateur créé !");
      }

      setFormData({ id: null, nom: "", role: "", username: "", password: "" });
      setIsModalOpen(false);
      setIsEditMode(false);
    } catch (err) {
      console.error("Erreur :", err.response?.data || err);
      if (err.response?.data?.username) {
        setErrorMessage("❌ Nom d’utilisateur déjà existant !");
      } else {
        setErrorMessage("❌ Une erreur est survenue.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      await axios.delete(`${API_URL}${id}/`);
      setUtilisateurs(utilisateurs.filter((u) => u.id !== id));
      toast.success("🗑️ Utilisateur supprimé !");
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      id: user.id,
      nom: user.nom,
      role: user.role?.id,
      username: user.username,
      password: "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-screen bg-gray-50 rounded-t-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Gestion des Utilisateurs</h1>
        <button
          onClick={() => {
            setIsEditMode(false);
            setFormData({ id: null, nom: "", role: "", username: "", password: "" });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#368C6F] text-white px-4 py-2 rounded-lg shadow transition"
        >
          <FiPlus /> Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-4">
        {/* Recherche par nom */}
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-1/2">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            className="flex-1 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtrer par rôle */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-[#43AB8A]"
        >
          <option value="">-- Tous les rôles --</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#43AB8A] text-white text-sm">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Rôle</th>
              <th className="p-3 text-left">Nom d’utilisateur</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUtilisateurs.length > 0 ? (
              filteredUtilisateurs.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-semibold text-[#43AB8A]">{u.id}</td>
                  <td className="p-3">{u.nom}</td>
                  <td className="p-3">{u.role?.label}</td>
                  <td className="p-3 font-medium">{u.username}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => alert(JSON.stringify(u, null, 2))}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-[#3D3941] transition"
                    >
                      <FiEye />
                    </button>
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
                  colSpan="11"
                  className="p-4 text-center text-gray-500 italic"
                >
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <UtilisateurModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        formData={formData}
        roles={roles}
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
