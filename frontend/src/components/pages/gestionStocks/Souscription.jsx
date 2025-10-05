import React, { useState, useEffect } from "react";
import { PlusCircle, Clock, Trash2 } from "lucide-react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import api from "../../Api";

const Souscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [boutiques, setBoutiques] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ boutique: "", plan: "" });
  const [search, setSearch] = useState("");

  // Charger toutes les données
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [subRes, boutRes, planRes] = await Promise.all([
        api.get("/accounts/subscriptions/"),
        api.get("/accounts/boutiques/"),
        api.get("/accounts/plans/"),
      ]);
      setSubscriptions(subRes.data || []);
      setFilteredSubs(subRes.data || []);
      setBoutiques(boutRes.data || []);
      setPlans(planRes.data || []);
    } catch (err) {
      console.error("❌ Erreur:", err);
      toast.error("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage par nom de boutique
  useEffect(() => {
    const filtered = subscriptions.filter((s) =>
      (s.boutique_name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSubs(filtered);
  }, [search, subscriptions]);

  // ✅ Supprimer une souscription
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette souscription ?")) {
      return;
    }

    try {
      await api.delete(`/accounts/subscriptions/${id}/`);
      toast.success("🗑️ Souscription supprimée avec succès !");
      fetchAll();
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("❌ Erreur lors de la suppression !");
    }
  };

  // ✅ Formulaire de création
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.boutique || !form.plan) {
      toast.error("Veuillez choisir une boutique et un plan !");
      return;
    }

    try {
      await api.post("/accounts/subscriptions/", {
        boutique: form.boutique,
        plan: form.plan,
      });
      toast.success("✅ Nouvelle souscription créée !");
      setModalOpen(false);
      setForm({ boutique: "", plan: "" });
      fetchAll();
    } catch (err) {
      console.error("Erreur création souscription:", err);
      toast.error("❌ Erreur lors de la création !");
    }
  };

  // ✅ Format date lisible
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Toaster position="top-center" />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Clock className="text-[#43AB8A]" /> Souscriptions
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher par boutique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-64 focus:ring focus:ring-[#43AB8A]"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#64aa94] text-white px-4 py-2 rounded-lg shadow"
          >
            <PlusCircle size={16} /> Nouvelle
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">⏳ Chargement...</p>
      ) : filteredSubs.length === 0 ? (
        <p className="text-center text-gray-500">Aucune souscription trouvée.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-[#43AB8A] text-white">
              <tr>
                <th className="p-3 text-left">Boutique</th>
                <th className="p-3 text-left">Plan</th>
                <th className="p-3 text-left">Début</th>
                <th className="p-3 text-left">Fin</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Transaction</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.boutique_name || "—"}</td>
                  <td className="p-3">{s.plan_name || "—"}</td>
                  <td className="p-3">{formatDate(s.start_date)}</td>
                  <td className="p-3">{formatDate(s.end_date)}</td>
                  <td className="p-3 text-center">
                    {s.status === "active" ? (
                      <span className="flex justify-center items-center text-green-600 font-semibold">
                        <FiCheckCircle className="mr-1" /> Actif
                      </span>
                    ) : (
                      <span className="flex justify-center items-center text-red-600 font-semibold">
                        <FiXCircle className="mr-1" /> Expiré
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">{s.transaction_id || "—"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-800 transition"
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

      {/* ✅ MODAL AJOUT SOUSCRIPTION */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Nouvelle Souscription
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1">Boutique</label>
                <select
                  value={form.boutique}
                  onChange={(e) =>
                    setForm({ ...form, boutique: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
                >
                  <option value="">-- Choisir une boutique --</option>
                  {boutiques.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
                >
                  <option value="">-- Choisir un plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price} FCFA)
                    </option>
                  ))}
                </select>
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Souscription;
