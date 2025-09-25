import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../../Api";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const CurrencyAndCategory = () => {
  const [currency, setCurrency] = useState("FCFA");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentCategory, setCurrentCategory] = useState({ id: null, label: "" });
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [user, setUser] = useState(null);

  const options = ["FCFA", "EUR", "USD", "GNF"];

  // --- Charger user + boutique ---
  useEffect(() => {
    const loadMe = async () => {
      try {
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data) {
          setUser(meRes.data);
          if (meRes.data?.boutique?.id) {
            setBoutiqueId(meRes.data.boutique.id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Erreur lors du chargement de l'utilisateur");
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, []);

  // --- Charger devise ---
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await api.get("/accounts/currency/");
        if (res.data?.currency) {
          setCurrency(res.data.currency);
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Impossible de charger la devise");
      }
    };
    fetchCurrency();
  }, []);

  // --- Charger catégories (attendre boutiqueId) ---
  useEffect(() => {
    if (!boutiqueId) return;
    const fetchCategories = async () => {
      try {
        const res = await api.get("/gestion_stock/categories/");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Impossible de charger les catégories");
      }
    };
    fetchCategories();
  }, [boutiqueId]);

  // --- Changement de devise ---
  const handleChangeCurrency = async (e) => {
    const selected = e.target.value;
    setCurrency(selected);
    try {
      await api.post("/accounts/currency/", { currency: selected });
      toast.success(`✅ Devise mise à jour : ${selected}`, { position: "top-center" });
    } catch {
      toast.error("❌ Impossible de mettre à jour la devise", { position: "top-center" });
    }
  };

  // --- Modal ajout/édition ---
  const openAddModal = () => {
    setModalMode("add");
    setCurrentCategory({ id: null, label: "" });
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setCurrentCategory(category);
    setModalOpen(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!currentCategory.label.trim()) return toast.error("Le label de la catégorie est requis");

    try {
      if (modalMode === "add") {
        await api.post("/gestion_stock/categories/", {
          label: currentCategory.label,
          boutique: boutiqueId,
        });
        toast.success("Catégorie ajoutée avec succès !");
      } else {
        await api.patch(`/gestion_stock/categories/${currentCategory.id}/`, {
          label: currentCategory.label,
        });
        toast.success("Catégorie modifiée avec succès !");
      }
      setModalOpen(false);
      // Recharger
      const res = await api.get("/gestion_stock/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Une erreur est survenue");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;
    try {
      await api.delete(`/gestion_stock/categories/${id}/`);
      toast.success("Catégorie supprimée avec succès !");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Impossible de supprimer la catégorie");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  const isStockiste = user?.role === "personnel" && user?.profil?.label === "Stockiste";

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Tableau des catégories --- */}
        {!isStockiste && (
          <div className="bg-white shadow-xl rounded-3xl p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📂 Catégories de marchandise</h2>
            <table className="min-w-full table-auto text-gray-700">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3 rounded-tl-3xl">ID</th>
                  <th className="p-3">Label</th>
                  <th className="p-3 rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{c.id}</td>
                    <td className="p-3">{c.label}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 text-yellow-600 transition"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
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
        )}

        {/* --- Devise + Bouton ajouter catégorie --- */}
        <div className="bg-white rounded-3xl shadow-xl p-10 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">💱 Sélecteur de devise</h1>
            <p className="mb-4 text-gray-600">
              Devise actuelle : <span className="font-semibold">{currency}</span>
            </p>
            <select
              value={currency}
              onChange={handleChangeCurrency}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none transition text-gray-800 font-semibold"
            >
              {options.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {!isStockiste && (
            <div className="text-center">
              <button
                onClick={openAddModal}
                className="mt-6 px-6 py-3 bg-[#43AB8A] text-white font-semibold rounded-xl hover:bg-[#369870] transition flex items-center justify-center gap-2 mx-auto"
              >
                <FiPlus /> Ajouter catégorie
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Modal popup --- */}
      {modalOpen && !isStockiste && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl p-8 w-96 relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {modalMode === "add" ? "➕ Ajouter une catégorie" : "✏️ Modifier la catégorie"}
            </h2>
            <form onSubmit={handleSubmitCategory} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Label de la catégorie"
                name="label"
                value={currentCategory.label}
                onChange={(e) => setCurrentCategory({ ...currentCategory, label: e.target.value })}
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
