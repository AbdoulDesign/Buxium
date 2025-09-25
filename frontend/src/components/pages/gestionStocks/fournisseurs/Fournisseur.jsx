import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, UserCircle2 } from "lucide-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import FournisseurModal from "./FournisseurModal";
import api from "../../../Api";

const Fournisseur = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [marchandises, setMarchandises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [filterNom, setFilterNom] = useState("");
  const [filterAdresse, setFilterAdresse] = useState("");
  const [boutiqueId, setBoutiqueId] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [newFournisseur, setNewFournisseur] = useState({
    name: "",
    telephone: "",
    adresse: "",
    email: "",
    marchandises_ids: [],
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Charger fournisseurs
  const fetchFournisseurs = async () => {
    try {
      const res = await api.get("/gestion_stock/fournisseurs/");
      setFournisseurs(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement fournisseurs :", err);
    }
  };

  // Charger marchandises
  const fetchMarchandises = async () => {
    try {
      const res = await api.get("/gestion_stock/marchandises/");
      setMarchandises(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement marchandises :", err);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
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

  // Filtrage
  const adresses = useMemo(
    () => Array.from(new Set(fournisseurs.map((f) => f.adresse).filter(Boolean))),
    [fournisseurs]
  );

  const filteredFournisseurs = useMemo(
    () =>
      fournisseurs.filter(
        (f) =>
          (!filterNom || f.name.toLowerCase().includes(filterNom.toLowerCase())) &&
          (!filterAdresse || f.adresse === filterAdresse)
      ),
    [fournisseurs, filterNom, filterAdresse]
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredFournisseurs.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFournisseurs.slice(start, start + itemsPerPage);
  }, [filteredFournisseurs, currentPage, itemsPerPage]);

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newFournisseur,
        boutique: boutiqueId,
      };

      if (editMode && currentId) {
        await api.put(`/gestion_stock/fournisseurs/${currentId}/`, payload);
      } else {
        await api.post("/gestion_stock/fournisseurs/", payload);
      }

      fetchFournisseurs();
      handleCloseModal();
    } catch (err) {
      console.error("Erreur :", err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!checkSubscription()) return;
    if (!window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
    try {
      await api.delete(`/gestion_stock/fournisseurs/${id}/`);
      fetchFournisseurs();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleEdit = (f) => {
    if (!checkSubscription()) return;
    setEditMode(true);
    setCurrentId(f.id);
    setNewFournisseur({
      name: f.name,
      telephone: f.telephone,
      adresse: f.adresse,
      email: f.email,
      marchandises_ids: f.marchandises.map((m) => m.id),
      boutique: boutiqueId,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    if (!checkSubscription()) return;
    setShowModal(true);
    setEditMode(false);
    setCurrentId(null);
  };


  const handleSelectMarchandises = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
    setNewFournisseur({ ...newFournisseur, marchandises_ids: selected });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setNewFournisseur({
      name: "",
      telephone: "",
      adresse: "",
      email: "",
      marchandises_ids: [],
    });
  };

  return (
    <div className="relative p-6 bg-gray-50 rounded-t-2xl min-h-screen">
      <Toaster position="top-center" autoClose={3000} />
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <UserCircle2 className="text-[#43AB8A]" /> Liste des fournisseurs
        </h2>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={filterNom}
            onChange={(e) => setFilterNom(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A] flex-1 min-w-[150px]"
          />
          <select
            value={filterAdresse}
            onChange={(e) => setFilterAdresse(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A] flex-1 min-w-[150px]"
          >
            <option value="">Toutes les adresses</option>
            {adresses.map((addr, i) => (
              <option key={i} value={addr}>
                {addr}
              </option>
            ))}
          </select>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 bg-[#43AB8A] hover:bg-[#589f88] text-white px-5 py-2 rounded-lg shadow-md transition w-full md:w-auto"
          >
            <PlusCircle size={18} /> Ajouter
          </button>
        </div>
      </div>

      {/* Vue tableau (desktop) */}
      <div className="hidden md:block overflow-x-auto shadow-lg rounded-xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#43AB8A] text-white text-sm">
              <th className="p-3">Référence</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">Adresse</th>
              <th className="p-3">Email</th>
              <th className="p-3">Marchandises</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((f) => (
              <tr
                key={f.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <td className="p-3 font-semibold">{f.reference}</td>
                <td className="p-3 font-semibold">{f.name}</td>
                <td className="p-3">{f.telephone}</td>
                <td className="p-3">{f.adresse}</td>
                <td className="p-3">{f.email}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {f.marchandises.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-1 text-xs rounded-full bg-green-100 text-[#43AB8A] border"
                        title={`${m.name} (${m.reference})`}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(f)}
                    className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                  >
                    <FiEdit size={16} className="text-yellow-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-2 bg-red-100 rounded hover:bg-red-200"
                  >
                    <FiTrash2 size={16} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500 italic">
                  Aucun fournisseur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vue cartes (mobile) */}
      <div className="md:hidden space-y-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl shadow-sm bg-white space-y-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Nom: {f.name}</h3>
                <span className="text-xs text-gray-500">Reference: {f.reference}</span>
              </div>
              <p className="text-sm text-gray-600">Téléphone: {f.telephone}</p>
              <p className="text-sm text-gray-600">Adresse: {f.adresse}</p>
              <p className="text-sm text-gray-600">email: {f.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                Marchandises:
                {f.marchandises.map((m) => (
                  <span
                    key={m.id}
                    className="px-2 py-1 text-xs rounded-full bg-green-100 text-[#43AB8A] border"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 justify-end mt-3">
                <button
                  onClick={() => handleEdit(f)}
                  className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  <FiEdit size={16} className="text-yellow-600" />
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 bg-red-100 rounded hover:bg-red-200"
                >
                  <FiTrash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 italic py-6">
            Aucun fournisseur trouvé
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600 flex-wrap gap-2">
        <span>
          Page {currentPage} sur {totalPages} ({filteredFournisseurs.length} fournisseurs)
        </span>
        <div className="flex gap-2 flex-wrap">
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

      {/* Modal */}
      <FournisseurModal
        showModal={showModal}
        editMode={editMode}
        newFournisseur={newFournisseur}
        setNewFournisseur={setNewFournisseur}
        marchandises={marchandises}
        handleSubmit={handleSubmit}
        handleSelectMarchandises={handleSelectMarchandises}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Fournisseur;
