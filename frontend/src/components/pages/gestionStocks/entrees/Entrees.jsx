// 📂 src/components/Entrees.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { PlusCircle} from "lucide-react";
import NouvelleEntree from "./NouvelleEntree";

const API_BASE = "http://localhost:8000/api/gestion-stock";

const Entrees = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [entrees, setEntrees] = useState([]);
  const [marchandisesById, setMarchandisesById] = useState({});
  const [search, setSearch] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [currency, setCurrency] = useState("FCFA");

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
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    axios
      .get(`${API_BASE}/entrees/?entreprise=${entreprise_id}`)
      .then((res) => mounted && setEntrees(res.data || []))
      .catch(() => mounted && setError("Erreur lors du chargement des entrées ❌"))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, []);

  // Charger les marchandises liées
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    const ids = Array.from(
      new Set(
        (entrees || [])
          .map(getMarchandiseId)
          .filter((id) => typeof id === "number" || typeof id === "string")
      )
    );
    const missing = ids.filter((id) => !marchandisesById[id]);
    if (missing.length === 0) return;
    setLoadingDetails(false);
  });

  // Catégories uniques
  const categories = useMemo(() => {
    const set = new Set();
    (entrees || []).forEach((e) => {
      const m = getMarchandiseObj(e);
      const catName = m?.categorie_nom || m?.categorie?.nom;
      if (catName) set.add(catName);
    });
    return Array.from(set);
  }, [entrees, marchandisesById]);

  // Filtrage
  const filtered = useMemo(() => {
    return (entrees || []).filter((e) => {
      const m = getMarchandiseObj(e) || {};
      const designation = (m.designation || "").toLowerCase();
      const reference = (m.reference || "").toLowerCase();
      const categorieNom = (m.categorie_nom || m?.categorie?.nom || "").toLowerCase();

      const okSearch =
        designation.includes(search.toLowerCase()) ||
        reference.includes(search.toLowerCase());

      const okCat = filterCategorie ? categorieNom === filterCategorie.toLowerCase() : true;
      const okStartDate = filterStartDate ? e.date >= filterStartDate : true;
      const okEndDate = filterEndDate ? e.date <= filterEndDate : true;

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
    if (!window.confirm("Voulez-vous vraiment supprimer cette entrée ?")) return;
    try {
      await axios.delete(`${API_BASE}/entrees/${id}/`);
      setEntrees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression !");
    }
  };

  // Export
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/entrees/export_${exportType}/`, {
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

  // Ajout
  const handleAdded = (newEntry) => {
    setEntrees((prev) => [newEntry, ...prev]);
  };

  // Affichage
  if (loading) return <div className="p-6 text-center">⏳ Chargement des entrées…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-2xl shadow-xl text-gray-800">
      <h1 className="text-3xl font-extrabold mb-6">📥 Liste des Entrées</h1>

      {/* Filtres & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
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
          className="p-2 rounded-xl shadow border border-gray-300"
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
          className="p-2 rounded-xl shadow border border-gray-300"
        />
        <input
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          className="p-2 rounded-xl shadow border border-gray-300"
        />

        <div className="flex gap-2 items-center">
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
            onClick={() => setShowModal(true)}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-inner bg-white">
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
                  <tr
                    key={e.id}
                    className="border-t border-gray-200 hover:bg-green-50/50"
                  >
                    <td className="p-2">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>
                    <td className="p-2">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.designation}
                          className="w-12 h-12 object-cover rounded mx-auto"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2">
                    {new Date(m.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                    <td className="p-2">{m.reference || "-"}</td>
                    <td className="p-2">{m.designation || "-"}</td>
                    <td className="p-2">{m.categorie_nom || m?.categorie?.nom || "-"}</td>
                    <td className="p-2">{m.unite || "-"}</td>
                    <td className="p-2">{e.quantite}</td>
                    <td className="p-2">{(prix_achat ?? 0).toLocaleString()} {currency}</td>
                    <td className="p-2 font-semibold">{(total ?? 0).toLocaleString()} {currency}</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => alert("Edition en cours de dev")}
                        className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                      >
                        <FiEdit className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 bg-red-100 rounded hover:bg-red-200"
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
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
                className={`px-3 py-1 border rounded-lg ${
                  currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""
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

      {/* Modal d'ajout */}
      {showModal && (
        <NouvelleEntree
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
};

export default Entrees;
