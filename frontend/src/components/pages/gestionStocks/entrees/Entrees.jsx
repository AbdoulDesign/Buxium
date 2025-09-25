import React, { useEffect, useMemo, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { PlusCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import NouvelleEntree from "./NouvelleEntree";
import api from "../../../Api";

const Entrees = () => {
  const [entrees, setEntrees] = useState([]);
  const [marchandisesById, setMarchandisesById] = useState({});
  const [search, setSearch] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [currency, setCurrency] = useState("FCFA");
  const [editingEntree, setEditingEntree] = useState(null);
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Utils
  const getMarchandiseId = (entry) =>
    entry?.marchandise && typeof entry.marchandise === "object"
      ? entry.marchandise.id
      : entry?.marchandise;

  const getMarchandiseObj = (entry) => {
    const m = entry?.marchandise;
    if (m && typeof m === "object") return m;
    const id = getMarchandiseId(entry);
    return id ? marchandisesById[id] : undefined;
  };

  // Charger les entrées
  const fetchEntrees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/gestion_stock/entrees/");
      setEntrees(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des entrées ❌");
    } finally {
      setLoading(false);
    }
  };

  // Charger la devise
  const fetchCurrency = async () => {
    try {
      const res = await api.get("/accounts/currency/");
      setCurrency(res.data.currency);
    } catch (err) {
      console.error("Erreur devise :", err);
    }
  };

  useEffect(() => {
    fetchCurrency();
    fetchEntrees();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // ⚡ Récupérer l’ID boutique depuis /accounts/auth/me
        const meRes = await api.get("/accounts/auth/me/");
        if (meRes.data.boutique) {
          setBoutiqueId(meRes.data.boutique.id);
        }
      } catch (err) {
        console.error(err);
        setError("❌ Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Vérification de l'abonnement
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



  // Catégories uniques
  const categories = useMemo(() => {
    const set = new Set();
    (entrees || []).forEach((e) => {
      const m = getMarchandiseObj(e);
      if (m?.categorie_nom) set.add(m.categorie_nom);
    });
    return Array.from(set).sort();
  }, [entrees, marchandisesById]);


  // Filtrage
  const filtered = useMemo(() => {
    return (entrees || []).filter((e) => {
      const m = getMarchandiseObj(e) || {};
      const name = (m.name || "").toLowerCase();
      const reference = (m.reference || "").toLowerCase();
      const categorieNom = (m.categorie_nom || "").toLowerCase();

      const okSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        reference.includes(search.toLowerCase());

      const okCat = filterCategorie
        ? categorieNom === filterCategorie.toLowerCase()
        : true;

      const okStartDate = filterStartDate ? e.created_at >= filterStartDate : true;
      const okEndDate = filterEndDate ? e.created_at <= filterEndDate : true;

      return okSearch && okCat && okStartDate && okEndDate;
    });
  }, [entrees, marchandisesById, search, filterCategorie, filterStartDate, filterEndDate]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Suppression
  const handleDelete = async (id) => {
    if (!checkSubscription()) return; // 🚫 bloquer si abonnement inactif
    if (!window.confirm("Voulez-vous vraiment supprimer cette entrée ?")) return;
    try {
      await api.delete(`/gestion_stock/entrees/${id}/`);
      setEntrees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression !");
    }
  };

  const openEditModal = (entree) => {
    if (!checkSubscription()) return; // 🚫 bloquer si abonnement inactif
    setEditingEntree(entree);
    setShowModal(true);
  };

  const openNewModal = () => {
    if (!checkSubscription()) return;
    setShowModal(true);
  };


  // Export
  const handleExport = async () => {
    try {
      const res = await api.get(`/gestion_stock/entrees/export_${exportType}/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `entrees.${exportType === "excel" ? "xlsx" : exportType}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur lors de l'export :", err);
      alert("Impossible d'exporter le fichier !");
    }
  };


  // Quand une entrée est ajoutée ou modifiée
  const handleAdded = (newEntree) => {
    setEntrees((prev) => {
      // Vérifier si c'est une modification
      const exists = prev.find((e) => e.id === newEntree.id);
      if (exists) {
        // Remplacer l'ancienne entrée par la nouvelle
        return prev.map((e) => (e.id === newEntree.id ? newEntree : e));
      } else {
        // Sinon, on ajoute en début de liste
        return [newEntree, ...prev];
      }
    });

    // Fermer le modal et reset édition
    setShowModal(false);
    setEditingEntree(null);
  };


  // Mise à jour d'une entrée
  const handleUpdated = (updatedEntry) => {
    setEntrees((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  if (loading) return <div className="p-6 text-center">⏳ Chargement des entrées…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl text-gray-800">
      <Toaster position="top-center" autoClose={3000} />
      <h1 className="text-3xl font-extrabold mb-6">📥 Liste des Entrées</h1>

      {/* Filtres & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 rounded-xl w-full md:w-36 shadow border border-gray-300"
        />
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="p-2 rounded-xl w-full md:w-40 shadow border border-gray-300"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          className="p-2 rounded-xl w-full md:w-40 shadow border border-gray-300"
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          className="p-2 rounded-xl w-full md:w-40 shadow border border-gray-300"
        />

        <div className="flex flex-col md:flex-row gap-2 items-center">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="text-sm p-2 rounded-xl border border-gray-300"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Exporter
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#64aa94] text-white px-4 py-2 rounded-xl shadow"
          >
            <PlusCircle size={16} /> Nouvelle entrée
          </button>
        </div>
      </div>

      {loadingDetails && (
        <div className="text-sm text-gray-500 mb-2">
          ⏳ Chargement des détails des marchandises…
        </div>
      )}

      {/* Table Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-inner bg-white">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#43AB8A] text-white text-sm">
              <th className="p-3">#</th>
              <th className="p-3">Image</th>
              <th className="p-3">Date</th>
              <th className="p-3">Réf.</th>
              <th className="p-3">Désignation</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Unité</th>
              <th className="p-3">Qté</th>
              <th className="p-3">Prix d'achat</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.length > 0 ? (
              displayedItems.map((e, i) => {
                const m = getMarchandiseObj(e) || {};
                const prix_achat = Number(m.prix_achat || 0);
                const total = prix_achat * Number(e.quantite || 0);

                return (
                  <tr key={e.id} className="border-t border-gray-200 hover:bg-green-50/50">
                    <td className="p-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="p-2">
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-12 h-12 object-cover rounded mx-auto" />
                      ) : "—"}
                    </td>
                    <td className="p-2">
                      {new Date(e.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-2">{m.reference || "-"}</td>
                    <td className="p-2">{m.name || "-"}</td>
                    <td className="p-2">{m.categorie_nom || "-"}</td>
                    <td className="p-2">{m.unite || "-"}</td>
                    <td className="p-2">{e.quantite}</td>
                    <td className="p-2">{(prix_achat ?? 0).toLocaleString()} {currency}</td>
                    <td className="p-2 font-semibold">{(total ?? 0).toLocaleString()} {currency}</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button onClick={() => openEditModal(e)} className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                        <FiEdit className="text-yellow-600" />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="p-4 text-center text-gray-500 italic">Aucun enregistrement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vue cartes (mobile) */}
      <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
        {displayedItems.length > 0 ? (
          displayedItems.map((e) => {
            const m = getMarchandiseObj(e) || {};
            const prix_achat = Number(m.prix_achat || 0);
            const total = prix_achat * Number(e.quantite || 0);

            return (
              <div key={e.id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-start">
                {/* Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">—</div>
                  )}
                </div>

                {/* Infos principales */}
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800">{m.name || "—"}</h2>
                  <p className="text-sm text-gray-500">{m.categorie_nom || "—"}</p>
                  <p className="text-sm">Réf: {m.reference || "—"}</p>
                  <p className="text-sm">Quantité: {e.quantite}</p>
                  <p className="text-sm">Prix unitaire: {(prix_achat ?? 0).toLocaleString()} {currency}</p>
                  <p className="text-sm font-semibold">Total: {(total ?? 0).toLocaleString()} {currency}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEditModal(e)} className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                    <FiEdit className="text-yellow-600" />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                    <FiTrash2 className="text-red-600" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">Aucune entrée trouvée.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <span>
            Page {currentPage} sur {totalPages} ({filtered.length} entrées)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Préc.
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suiv.
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NouvelleEntree
          onClose={() => { setShowModal(false); setEditingEntree(null); }}
          onAdded={handleAdded}
          onUpdated={handleUpdated}
          entree={editingEntree}
          marchandisesById={marchandisesById}
          boutique_id={boutiqueId}
        />
      )}
    </div>);
};

export default Entrees;
