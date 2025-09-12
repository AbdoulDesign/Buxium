import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { PlusCircle, Download } from "lucide-react";
import ModalSortie from "./ModalSortie";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const API_BASE = "http://localhost:8000/api/gestion-stock";

const Sorties = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [sorties, setSorties] = useState([]);
  const [marchandises, setMarchandises] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSortie, setEditingSortie] = useState(null);
  const [currency, setCurrency] = useState("FCFA");

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
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    fetchSorties();
    fetchMarchandises();
  }, []);

  const fetchSorties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/sorties/?entreprise=${entreprise_id}`);
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
      const res = await axios.get(`${API_BASE}/marchandises/?entreprise=${entreprise_id}`);
      setMarchandises(res.data || []);
    } catch (err) {
      console.error("Erreur chargement marchandises:", err);
    }
  };

  const handleExport = async () => {
    try {
      const url = `${API_BASE}/sorties/export_${exportType}/`;
      const res = await axios.get(url, { responseType: "blob" });
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
    setEditingSortie(null);
    setModalOpen(true);
  };

  const openEditModal = (sortie) => {
    setEditingSortie(sortie);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      if (editingSortie) {
        await axios.put(`${API_BASE}/sorties/${editingSortie.id}/`, form);
      } else {
        await axios.post(`${API_BASE}/sorties/`, form);
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
    if (!window.confirm("Voulez-vous vraiment supprimer cette sortie ?")) return;
    try {
      await axios.delete(`${API_BASE}/sorties/${id}/`);
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
      if (m.categorie?.nom) s.add(m.categorie.nom);
    });
    return Array.from(s).sort();
  }, [marchandises]);

  // filtered list (search + category + date range)
  const filtered = useMemo(() => {
    return sorties.filter((s) => {
      const designation = s.marchandise?.designation?.toLowerCase() || "";
      const reference = s.marchandise?.reference?.toLowerCase() || "";
      const categorieNom = (s.marchandise?.categorie?.nom || "").toLowerCase();

      const q = search.trim().toLowerCase();
      const okSearch = q ? (designation.includes(q) || reference.includes(q)) : true;

      const okCat = filterCategorie ? categorieNom === filterCategorie.toLowerCase() : true;

      // compare ISO date strings safely (backend should return YYYY-MM-DD or ISO)
      const dateVal = s.date ? s.date.slice(0, 10) : ""; // keep YYYY-MM-DD
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
          case "designation":
            return (item.marchandise?.designation || "").toString().toLowerCase();
          case "reference":
            return (item.marchandise?.reference || "").toString().toLowerCase();
          case "categorie":
            return (item.marchandise?.categorie?.nom || "").toString().toLowerCase();
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

  if (loading) return <div className="p-8 text-center">⏳ Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 rounded-t-2xl p-6 shadow-lg">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6">📤 Gestion des Sorties</h2>

      {/* Header / filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="text"
            placeholder="🔍 Rechercher ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded-xl w-full md:w-32 border border-gray-200 shadow-sm"
          />

          <select
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 shadow-sm"
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
            className="p-2 rounded-xl border border-gray-200 shadow-sm"
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 shadow-sm"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 shadow-sm"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl shadow"
          >
            <Download size={16} /> Exporter
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#64aa94] text-white px-4 py-2 rounded-xl shadow"
          >
            <PlusCircle size={16} /> Nouvelle sortie
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#43AB8A] text-white text-sm">
              <th className="p-3">ID</th>
              <th className="p-3">Image</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("date")}>Date {sortColumn === "date" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("reference")}>Référence {sortColumn === "reference" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort("designation")}>Désignation {sortColumn === "designation" ? (sortOrder === "asc" ? "🔼" : "🔽") : ""}</th>
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
                      <img src={s.marchandise.image} alt={s.marchandise.designation} className="w-12 h-12 object-cover rounded" />
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
                  <td className="p-2">{s.marchandise?.designation || "—"}</td>
                  <td className="p-2">{s.marchandise?.categorie?.nom || "—"}</td>
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
      />
    </div>
  );
};

export default Sorties;
