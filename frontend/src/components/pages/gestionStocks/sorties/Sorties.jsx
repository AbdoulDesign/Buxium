import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, Download } from "lucide-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import ModalSortie from "./ModalSortie";
import api from "../../../Api"; // <-- utilisation de ton api centralisé

const Sorties = () => {
  const [sorties, setSorties] = useState([]);
  const [marchandises, setMarchandises] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSortie, setEditingSortie] = useState(null);
  const [currency, setCurrency] = useState("FCFA");
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  // Filtres
  const [search, setSearch] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Tri
  const [sortColumn, setSortColumn] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Export
  const [exportType, setExportType] = useState("pdf");

  // chargement / erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await api.get("/accounts/currency/");
        setCurrency(res.data.currency);
      } catch (err) {
        console.error("Erreur devise :", err);
      }
    };

    fetchCurrency();
    fetchSorties();
    fetchMarchandises();
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

  const fetchSorties = async () => {
    setLoading(true);
    try {
      const res = await api.get("/gestion_stock/sorties/");
      setSorties(res.data || []);
    } catch (err) {
      console.error("Erreur chargement sorties:", err);
      setError("Erreur lors du chargement des sorties.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarchandises = async () => {
    try {
      const res = await api.get("/gestion_stock/marchandises/");
      setMarchandises(res.data || []);
    } catch (err) {
      console.error("Erreur chargement marchandises:", err);
    }
  };

  const handleExport = async () => {
    try {
      const url = `/gestion_stock/sorties/export_${exportType}/`;
      const res = await api.get(url, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      const ext = exportType === "excel" ? "xlsx" : exportType;
      link.setAttribute("download", `sorties.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur lors de l'export :", err);
      alert("Impossible d'exporter le fichier !");
    }
  };

  const openAddModal = () => {
    if (!checkSubscription()) return;
    setEditingSortie(null);
    setModalOpen(true);
  };

  const openEditModal = (sortie) => {
    if (!checkSubscription()) return;
    setEditingSortie(sortie);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    if (!checkSubscription()) return;
    try {
      if (editingSortie) {
        await api.put(`/gestion_stock/sorties/${editingSortie.id}/`, form);
      } else {
        await api.post(`/gestion_stock/sorties/`, form);
      }
      await fetchSorties();
      setModalOpen(false);
      setEditingSortie(null);
    } catch (err) {
      console.error("Erreur sauvegarde sortie:", err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!checkSubscription()) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cette sortie ?")) return;
    try {
      await api.delete(`/gestion_stock/sorties/${id}/`);
      setSorties((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Erreur suppression sortie:", err);
      alert("Impossible de supprimer la sortie.");
    }
  };

  // catégories disponibles (depuis marchandises)
  const categories = useMemo(() => {
    const s = new Set();
    marchandises.forEach((m) => {
      if (m.categorie_nom) s.add(m.categorie_nom);
    });
    return Array.from(s).sort();
  }, [marchandises]);


  // filtered list (search + category + date range)
  const filtered = useMemo(() => {
    return sorties.filter((s) => {
      const name = s.marchandise?.name?.toLowerCase() || "";
      const reference = s.marchandise?.reference?.toLowerCase() || "";
      const categorieNom = (s.marchandise?.categorie_nom || "").toLowerCase();

      const q = search.trim().toLowerCase();
      const okSearch = q
        ? name.includes(q) || reference.includes(q)
        : true;

      const okCat = filterCategorie
        ? categorieNom === filterCategorie.toLowerCase()
        : true;

      // compare ISO date strings safely
      const dateVal = s.date ? s.date.slice(0, 10) : "";
      const okStart = filterStartDate ? dateVal >= filterStartDate : true;
      const okEnd = filterEndDate ? dateVal <= filterEndDate : true;

      return okSearch && okCat && okStart && okEnd;
    });
  }, [sorties, search, filterCategorie, filterStartDate, filterEndDate]);


  // sorting
  const sortedData = useMemo(() => {
    const arr = [...filtered];
    if (!sortColumn) return arr;
    arr.sort((a, b) => {
      const getVal = (item, col) => {
        switch (col) {
          case "name":
            return (item.marchandise?.name || "")
              .toString()
              .toLowerCase();
          case "reference":
            return (item.marchandise?.reference || "")
              .toString()
              .toLowerCase();
          case "categorie":
            return (item.marchandise?.categorie?.nom || "")
              .toString()
              .toLowerCase();
          case "quantite":
          case "seuil":
          case "stock":
          case "prix":
          case "total":
            return Number(item[col] ?? item.marchandise?.[col] ?? 0);
          case "date":
          default:
            return (item.date || "").toString();
        }
      };

      const A = getVal(a, sortColumn);
      const B = getVal(b, sortColumn);

      if (typeof A === "string") {
        return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
      } else {
        return sortOrder === "asc" ? A - B : B - A;
      }
    });
    return arr;
  }, [filtered, sortColumn, sortOrder]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirst, indexOfLast);

  // helper to toggle sort
  const toggleSort = (col) => {
    if (sortColumn === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  if (loading)
    return <div className="p-8 text-center">⏳ Chargement...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 rounded-t-2xl p-4 shadow-lg">
      <Toaster position="top-center" autoClose={3000} />
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6">📤 Gestion des Sorties</h2>

      {/* Header / filtres */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Zone recherche + filtres */}
        <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-2">
          <input
            type="text"
            placeholder="🔍 Rechercher ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded-xl w-full md:w-46 border border-gray-200 shadow-sm"
          />

          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="p-2 rounded-xl w-full md:w-auto border border-gray-200 shadow-sm"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="p-2 rounded-xl w-full md:w-auto border border-gray-200 shadow-sm"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="p-2 rounded-xl w-full md:w-auto border border-gray-200 shadow-sm"
          />
        </div>

        {/* Zone export + bouton ajout */}
        <div className="flex flex-col sm:flex-row gap-2 md:justify-end">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow w-full sm:w-auto"
          >
            <Download size={16} /> Exporter
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-[#43AB8A] hover:bg-[#64aa94] text-white px-4 py-2 rounded-xl shadow w-full sm:w-auto"
          >
            <PlusCircle size={16} /> Nouvelle sortie
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#43AB8A] text-white text-sm">
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("date")}>Date {sortColumn === "date" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("reference")}>Référence {sortColumn === "reference" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("name")}>Désignation {sortColumn === "name" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("categorie")}>Catégorie {sortColumn === "categorie" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("quantite")}>Quantité {sortColumn === "quantite" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3">Prix Unitaire</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("total")}>Total {sortColumn === "total" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">
                    {s.marchandise?.image ? (
                      <img src={s.marchandise.image} alt={s.marchandise.name} className="w-12 h-12 object-cover rounded" />
                    ) : "—"}
                  </td>
                  <td className="p-2">
                    {new Date(s.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-2">{s.marchandise?.reference || "—"}</td>
                  <td className="p-2">{s.marchandise?.name || "—"}</td>
                  <td className="p-2">{s.marchandise?.categorie_nom || "—"}</td>
                  <td className="p-2">{s.quantite}</td>
                  <td className="p-2">{(s.marchandise?.prix_vente ?? 0).toLocaleString()} {currency}</td>
                  <td className="p-2 font-semibold">{(s.total ?? 0).toLocaleString()} {currency}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button onClick={() => openEditModal(s)} className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                      <FiEdit size={16} className="text-yellow-600" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                      <FiTrash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-4 text-center text-gray-500">Aucun enregistrement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vue cartes (mobile) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {currentData.length > 0 ? (
          currentData.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow p-4 flex gap-4 items-start"
            >
              {/* Image */}
              <div className="w-16 h-16 flex-shrink-0">
                {s.marchandise?.image ? (
                  <img
                    src={s.marchandise.image}
                    alt={s.marchandise.name}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                    —
                  </div>
                )}
              </div>

              {/* Infos principales */}
              <div className="flex-1">
                <h2 className="font-bold text-gray-800">{s.marchandise?.name || "—"}</h2>
                <p className="text-sm text-gray-500">{s.marchandise?.categorie_nom || "—"}</p>
                <p className="text-sm">Réf: {s.marchandise?.reference || "—"}</p>
                <p
                  className={`text-sm font-semibold ${s.quantite <= (s.marchandise?.seuil ?? 0) ? "text-red-500" : "text-[#43AB8A]"
                    }`}
                >
                  Quantité: {s.quantite}
                </p>
                <p className="text-sm">
                  Prix unitaire: {(s.marchandise?.prix_vente ?? 0).toLocaleString()} {currency}
                </p>
                <p className="text-sm font-semibold">
                  Total: {(s.total ?? 0).toLocaleString()} {currency}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(s.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  <FiEdit className="text-yellow-600" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 bg-red-100 rounded hover:bg-red-200"
                >
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">Aucune sortie trouvée.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>Page {currentPage} sur {totalPages} ({sortedData.length} sorties)</span>
        <div className="flex gap-2">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Préc.</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Suiv.</button>
        </div>
      </div>

      {/* Modal */}
      <ModalSortie
        show={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSortie(null); }}
        onSave={handleSave}
        sortie={editingSortie}
        marchandises={marchandises}
        boutique_id={boutiqueId}
      />
    </div>
  );
};

export default Sorties;
