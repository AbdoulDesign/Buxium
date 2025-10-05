import React, { useState, useEffect } from "react";
import { FiEdit } from "react-icons/fi";
import { PlusCircle, Layers, Edit3, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../Api";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", duration_days: "" });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts/plans/");
      setPlans(res.data || []);
    } catch (err) {
      console.error("❌ Erreur chargement plans:", err);
      toast.error("Erreur lors du chargement des plans.");
    } finally {
      setLoading(false);
    }
  };

  // Créer ou modifier un plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration_days) {
      toast.error("Veuillez remplir tous les champs !");
      return;
    }

    try {
      if (isEditing && currentId) {
        await api.put(`/accounts/plans/${currentId}/`, {
          name: form.name,
          price: parseInt(form.price),
          duration_days: parseInt(form.duration_days),
        });
        toast.success("✅ Plan modifié avec succès !");
      } else {
        await api.post("/accounts/plans/", {
          name: form.name,
          price: parseInt(form.price),
          duration_days: parseInt(form.duration_days),
        });
        toast.success("✅ Plan ajouté avec succès !");
      }

      setModalOpen(false);
      setForm({ name: "", price: "", duration_days: "" });
      setIsEditing(false);
      setCurrentId(null);
      fetchPlans();
    } catch (err) {
      console.error("Erreur plan:", err);
      toast.error("❌ Erreur lors de l’enregistrement !");
    }
  };

  // Ouvrir le modal en mode édition
  const handleEdit = (plan) => {
    setIsEditing(true);
    setCurrentId(plan.id);
    setForm({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
    });
    setModalOpen(true);
  };

  // Supprimer un plan
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce plan ?")) return;
    try {
      await api.delete(`/accounts/plans/${id}/`);
      toast.success("🗑️ Plan supprimé !");
      fetchPlans();
    } catch (err) {
      console.error("Erreur suppression plan:", err);
      toast.error("❌ Erreur lors de la suppression !");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Layers className="text-[#43AB8A]" /> Plans d’abonnement
        </h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setForm({ name: "", price: "", duration_days: "" });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#64aa94] text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle size={16} /> Nouveau Plan
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">⏳ Chargement...</p>
      ) : plans.length === 0 ? (
        <p className="text-center text-gray-500">
          Aucun plan enregistré pour le moment.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-[#43AB8A] text-white">
              <tr>
                <th className="p-3 text-left">Nom du plan</th>
                <th className="p-3 text-left">Prix (FCFA)</th>
                <th className="p-3 text-left">Durée (jours)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-800">{p.name}</td>
                  <td className="p-3">{p.price.toLocaleString()}</td>
                  <td className="p-3">{p.duration_days}</td>
                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL AJOUT / MODIF PLAN */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditing ? "Modifier le Plan" : "Nouveau Plan d’abonnement"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1">Nom du plan</label>
                <input
                  type="text"
                  placeholder="Ex: Mensuel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Prix (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex: 1000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Durée (en jours)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 30"
                  value={form.duration_days}
                  onChange={(e) =>
                    setForm({ ...form, duration_days: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#43AB8A] text-white rounded-lg hover:bg-[#64aa94]"
                >
                  {isEditing ? "Modifier" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
