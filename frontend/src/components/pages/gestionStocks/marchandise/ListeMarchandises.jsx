import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import NouvelleMarchandise from "./NouvelleMarchandise";
import { PlusCircle } from "lucide-react";

const API_BASE = "http://localhost:8000/api/gestion-stock";

const ListeMarchandises = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [marchandises, setMarchandises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("FCFA");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMarchandise, setSelectedMarchandise] = useState(null);


  // Fetch marchandises
  const fetchMarchandises = async () => {
    try {
      const res = await axios.get(`${API_BASE}/marchandises/?entreprise=${entreprise_id}`);
      setMarchandises(res.data);
    } catch (err) {
      setError("❌ Erreur lors du chargement des marchandises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await axios.get(`${API_BASE}/categories/`);
        setCategories(catRes.data);

        const marchRes = await axios.get(`${API_BASE}/marchandises/?entreprise=${entreprise_id}`);
        const data = marchRes.data.map((m) => {
          const cat = catRes.data.find((c) => c.id === m.categorie);
          return { ...m, categorieNom: cat ? cat.nom : "—" };
        });
        setMarchandises(data);
      } catch (err) {
        setError("❌ Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/accounts/currency/", { withCredentials: true })
      .then((res) => {
        setCurrency(res.data.currency);
      })
      .catch((err) => {
        console.error(err);
      });
    fetchMarchandises();
  }, []);

  // Filtrage
  const filteredData = marchandises
    .filter(
      (m) =>
        m.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categorie?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((m) =>
      categorieFilter === "all" ? true : m.categorie?.nom === categorieFilter
    )
    .filter((m) => {
      if (stockFilter === "faible") return m.stock <= m.seuil;
      if (stockFilter === "normal") return m.stock > m.seuil;
      return true;
    });

  // Tri
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = a[sortColumn] ?? "";
    const valB = b[sortColumn] ?? "";
    return typeof valA === "string"
      ? (sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA))
      : (sortOrder === "asc" ? valA - valB : valB - valA);
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const currentData = sortedData.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ?")) return;
    try {
      await axios.delete(`${API_BASE}/marchandises/${id}/`);
      setMarchandises(marchandises.filter((m) => m.id !== id));
    } catch (err) {
      alert("Erreur suppression ❌");
    }
  };

  // Edit
  const handleEdit = (m) => {
    setSelectedMarchandise(m);
    setShowModal(true);
  };

  // Close Modal
  const handleCloseForm = () => {
    setSelectedMarchandise(null);
    setShowModal(false);
    fetchMarchandises();
  };

  if (loading) return <div className="p-8 text-center">⏳ Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50 rounded-t-2xl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">📦 Liste des Marchandises</h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A]"
        />
        <select
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.nom}>{c.nom}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="all">Tous les stocks</option>
          <option value="faible">Stock faible</option>
          <option value="normal">Stock normal</option>
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto flex items-center gap-2 bg-[#43AB8A] text-white px-4 py-2 rounded-lg shadow hover:bg-[#71c3a9]"
        >
          <PlusCircle size={(16)} /> Nouvelle marchandise
        </button>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#43AB8A] text-white">
            <tr>
              <th className="p-3">Image</th>
              {["reference", "designation", "categorie", "unite", "seuil", "stock", "prix d'achat", "prix de vente"].map((col) => {
                const label = col.charAt(0).toUpperCase() + col.slice(1);
                return (
                  <th
                    key={col}
                    onClick={() => {
                      setSortColumn(col);
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="p-3 cursor-pointer"
                  >
                    {label} {sortColumn === col && (sortOrder === "asc" ? "🔼" : "🔽")}
                  </th>
                );
              })}
              <th className="p-3">Total</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {m.image ? (
                      <img src={m.image} alt={m.designation} className="h-12 w-12 object-cover rounded-lg" />
                    ) : "—"}
                  </td>
                  <td className="p-3">{m.reference}</td>
                  <td className="p-3">{m.designation}</td>
                  <td className="p-3">{m.categorieNom}</td>
                  <td className="p-3">{m.unite}</td>
                  <td className="p-3">{m.seuil}</td>
                  <td className={`p-3 font-bold ${m.stock <= m.seuil ? "text-red-500" : "text-[#43AB8A]"}`}>
                    {m.stock}
                  </td>
                  <td className="p-3">{(m.prix_achat ?? 0).toLocaleString()} {currency}</td>
                  <td className="p-3">{(m.prix_vente ?? 0).toLocaleString()} {currency}</td>
                  <td className="p-3 font-bold">{(m.total ?? 0).toLocaleString()} {currency}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(m)} className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                      <FiEdit className="text-yellow-600" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-red-100 rounded hover:bg-red-200">
                      <FiTrash2 className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>
          Page {currentPage} sur {totalPages} ({sortedData.length} marchandises)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Préc.
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-lg ${currentPage === i + 1 ? "bg-[#43AB8A] text-white" : ""}`}
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

      {/* Modal */}
      {showModal && (
        <NouvelleMarchandise
          existingData={selectedMarchandise}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ListeMarchandises;
