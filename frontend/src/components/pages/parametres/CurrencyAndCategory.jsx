import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const CurrencyAndCategory = () => {
  const [currency, setCurrency] = useState("FCFA");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' ou 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, nom: "" });

  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;

  const options = ["FCFA", "EUR", "USD", "GNF"];

  // --- Récupération de la devise ---
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // --- Récupération des catégories ---
  const fetchCategories = () => {
    axios
      .get(`http://localhost:8000/api/gestion-stock/categories/?entreprise=${entreprise_id}`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, [entreprise_id]);

  // --- Gestion du changement de devise ---
  const handleChange = (e) => {
    const selected = e.target.value;
    setCurrency(selected);

    axios
      .post(
        "http://localhost:8000/api/accounts/currency/",
        { currency: selected },
        { withCredentials: true }
      )
      .then(() => {
        toast.success(`✅ Devise mise à jour : ${selected}`, {
          position: "top-center",
          style: { borderRadius: "10px", background: "#43AB8A", color: "#fff", fontWeight: "bold" },
        });
      })
      .catch(() => {
        toast.error("❌ Impossible de mettre à jour la devise", { position: "top-center" });
      });
  };

  // --- Ouverture du modal pour ajout ---
  const openAddModal = () => {
    setModalMode("add");
    setCurrentCategory({ id: null, nom: "" });
    setModalOpen(true);
  };

  // --- Ouverture du modal pour modification ---
  const openEditModal = (category) => {
    setModalMode("edit");
    setCurrentCategory(category);
    setModalOpen(true);
  };

  // --- Soumission du formulaire du modal ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCategory.nom.trim()) return toast.error("Le nom de la catégorie est requis");

    if (modalMode === "add") {
      axios
        .post(`http://localhost:8000/api/gestion-stock/categories/`, {
          nom: currentCategory.nom,
          entreprise: entreprise_id,
        })
        .then(() => {
          fetchCategories();
          setModalOpen(false);
          toast.success("Catégorie ajoutée avec succès !");
        })
        .catch(() => toast.error("Impossible d'ajouter la catégorie."));
    } else {
      axios
        .patch(`http://localhost:8000/api/gestion-stock/categories/${currentCategory.id}/`, {
          nom: currentCategory.nom,
        })
        .then(() => {
          fetchCategories();
          setModalOpen(false);
          toast.success("Catégorie modifiée avec succès !");
        })
        .catch(() => toast.error("Impossible de modifier la catégorie."));
    }
  };

  // --- Supprimer une catégorie ---
  const handleDelete = (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    axios
      .delete(`http://localhost:8000/api/gestion-stock/categories/${id}/`)
      .then(() => {
        fetchCategories();
        toast.success("Catégorie supprimée avec succès !");
      })
      .catch(() => toast.error("Impossible de supprimer la catégorie."));
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Tableau des catégories --- */}
        <div className="bg-white shadow-xl rounded-3xl p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📂 Catégories de marchandise</h2>
          <table className="min-w-full table-auto text-gray-700">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 rounded-tl-3xl">ID</th>
                <th className="p-3">Nom</th>
                <th className="p-3 rounded-tr-3xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.nom}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => alert(JSON.stringify(c, null, 2))}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-[#3D3941] transition"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 text-yellow-600 transition"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 text-red-600 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Devise + Bouton ajouter catégorie --- */}
        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-8">
          {/* Sélecteur de devise */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">💱 Sélecteur de devise</h1>
            <p className="mb-4 text-gray-600">
              Devise actuelle : <span className="font-semibold">{currency}</span>
            </p>
            <select
              value={currency}
              onChange={handleChange}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800 font-semibold"
            >
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton Ajouter catégorie */}
          <div className="text-center">
            <button
              onClick={openAddModal}
              className="mt-6 px-6 py-3 bg-[#43AB8A] text-white font-semibold rounded-xl hover:bg-[#369870] transition flex items-center justify-center gap-2 mx-auto"
            >
              <FiPlus /> Ajouter catégorie
            </button>
          </div>
        </div>
      </div>

      {/* --- Modal popup --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl p-8 w-96 relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {modalMode === "add" ? "➕ Ajouter une catégorie" : "✏️ Modifier la catégorie"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={currentCategory.nom}
                onChange={(e) => setCurrentCategory({ ...currentCategory, nom: e.target.value })}
                className="p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition"
              />
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#43AB8A] text-white font-semibold rounded-xl hover:bg-[#369870] transition"
                >
                  {modalMode === "add" ? "Ajouter" : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyAndCategory;
