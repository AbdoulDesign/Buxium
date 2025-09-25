import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { PlusCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import NouvelleMarchandise from "./NouvelleMarchandise";
import api from "../../../Api";

const ListeMarchandises = () => {
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
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMarchandise, setSelectedMarchandise] = useState(null);

  // Récupération des marchandises
  const fetchMarchandises = async () => {
    try {
      const [catRes, marchRes] = await Promise.all([
        api.get("/gestion_stock/categories/"),
        api.get("/gestion_stock/marchandises/"),
      ]);

      const categories = catRes.data;
      setCategories(categories);

      const data = marchRes.data.map((m) => {
        const cat = categories.find((c) => c.id === m.categorie);
        return { ...m, categorieNom: cat ? cat.label : "—" };
      });

      setMarchandises(data);
    } catch (err) {
      console.error(err);
      setError("❌ Erreur lors du chargement des marchandises");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
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

  useEffect(() => {
    api
      .get("/accounts/currency/", { withCredentials: true })
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
        m.categorieNom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((m) =>
      categorieFilter === "all" ? true : m.categorieNom === categorieFilter
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
      ? sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
      : sortOrder === "asc"
        ? valA - valB
        : valB - valA;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const currentData = sortedData.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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
  // Suppression
  const handleDelete = async (id) => {
    if (!checkSubscription()) return;
    if (!window.confirm("Voulez-vous vraiment supprimer ?")) return;

    try {
      await api.delete(`/gestion_stock/marchandises/${id}/`);
      setMarchandises(marchandises.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur suppression");
    }
  };

  // Edition
  const handleEdit = (m) => {
    if (!checkSubscription()) return;
    setSelectedMarchandise(m);
    setShowModal(true);
  };

  // Ajout
  const handleAdd = () => {
    if (!checkSubscription()) return;
    setShowModal(true);
  };

  // Fermeture du modal
  const handleCloseForm = () => {
    setSelectedMarchandise(null);
    setShowModal(false);
    fetchMarchandises();
  };

  if (loading) return <div className="p-8 text-center">⏳ Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 rounded-t-2xl">
      <Toaster position="top-center" autoClose={3000} />
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
        📦 Liste des Marchandises
      </h1>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A] flex-1"
        />
        <select
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.label}>
              {c.label}
            </option>
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
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-[#43AB8A] text-white px-4 py-2 rounded-lg shadow hover:bg-[#71c3a9]"
        >
          <PlusCircle size={16} /> Nouvelle marchandise
        </button>
      </div>

      {/* Tableau (desktop) */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#43AB8A] text-white">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Référence</th>
              <th className="p-3">Désignation</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Unité</th>
              <th className="p-3">Seuil</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Prix d'achat</th>
              <th className="p-3">Prix de vente</th>
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
                      <img
                        src={m.image}
                        alt={m.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">{m.reference}</td>
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.categorieNom}</td>
                  <td className="p-3">{m.unite}</td>
                  <td className="p-3">{m.seuil}</td>
                  <td
                    className={`p-3 font-bold ${m.stock <= m.seuil ? "text-red-500" : "text-[#43AB8A]"
                      }`}
                  >
                    {m.stock}
                  </td>
                  <td className="p-3">
                    {(m.prix_achat ?? 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-3">
                    {(m.prix_vente ?? 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-3 font-bold">
                    {(m.total ?? 0).toLocaleString()} {currency}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                    >
                      <FiEdit className="text-yellow-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-2 bg-red-100 rounded hover:bg-red-200"
                    >
                      <FiTrash2 className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="11"
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vue cartes (mobile) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {currentData.length > 0 ? (
          currentData.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow p-4 flex gap-4 items-start"
            >
              <div className="w-16 h-16 flex-shrink-0">
                {m.image ? (
                  <img
                    src={m.image}
                    alt={m.name}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                    —
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800">{m.name}</h2>
                <p className="text-sm text-gray-500">{m.categorieNom}</p>
                <p
                  className={`text-sm font-semibold ${m.stock <= m.seuil ? "text-red-500" : "text-[#43AB8A]"
                    }`}
                >
                  Stock: {m.stock}
                </p>
                <p className="text-sm">
                  Vente: {(m.prix_vente ?? 0).toLocaleString()} {currency}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(m)}
                  className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  <FiEdit className="text-yellow-600" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-2 bg-red-100 rounded hover:bg-red-200"
                >
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">Aucune marchandise trouvée.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-gray-600 gap-3">
        <span>
          Page {currentPage} sur {totalPages} ({sortedData.length} marchandises)
        </span>
        <div className="flex flex-wrap gap-2">
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

      {/* Modal */}
      {showModal && (
        <NouvelleMarchandise
          existingData={selectedMarchandise}
          onClose={handleCloseForm}
          boutique_id={boutiqueId}
        />
      )}
    </div>
  );
};

export default ListeMarchandises;
