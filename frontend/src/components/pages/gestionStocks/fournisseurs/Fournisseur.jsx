import React, { useEffect, useState } from "react";
import axios from "axios";
import FournisseurModal from "./FournisseurModal";
import { PlusCircle, UserCircle2 } from "lucide-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const API_BASE = "http://localhost:8000/api/gestion-stock";

const Fournisseur = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [fournisseurs, setFournisseurs] = useState([]);
  const [marchandises, setMarchandises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [filterNom, setFilterNom] = useState("");
  const [filterAdresse, setFilterAdresse] = useState("");
  const [newFournisseur, setNewFournisseur] = useState({
    nom: "",
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
      const res = await axios.get(`${API_BASE}/fournisseurs/?entreprise=${entreprise_id}`);
      setFournisseurs(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement fournisseurs :", err);
    }
  };

  // Charger marchandises
  const fetchMarchandises = async () => {
    try {
      const res = await axios.get(`${API_BASE}/marchandises/?entreprise=${entreprise_id}`);
      setMarchandises(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement marchandises :", err);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
    fetchMarchandises();
  }, []);

  // Filtrage
  const adresses = [...new Set(fournisseurs.map((f) => f.adresse))];
  const filteredFournisseurs = fournisseurs.filter(
    (f) =>
      (filterNom === "" ||
        f.nom.toLowerCase().includes(filterNom.toLowerCase())) &&
      (filterAdresse === "" || f.adresse === filterAdresse)
  );

  // Pagination
  const totalPages = Math.ceil(filteredFournisseurs.length / itemsPerPage);
  const paginatedData = filteredFournisseurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentId) {
        await axios.put(`${API_BASE}/fournisseurs/${currentId}/`, newFournisseur);
      } else {
        await axios.post(`${API_BASE}/fournisseurs/`, newFournisseur);
      }
      fetchFournisseurs();
      handleCloseModal();
    } catch (err) {
      console.error("Erreur :", err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
    try {
      await axios.delete(`${API_BASE}/fournisseurs/${id}/`);
      fetchFournisseurs();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleEdit = (f) => {
    setEditMode(true);
    setCurrentId(f.id);
    setNewFournisseur({
      nom: f.nom,
      telephone: f.telephone,
      adresse: f.adresse,
      email: f.email,
      marchandises_ids: f.marchandises.map((m) => m.id),
    });
    setShowModal(true);
  };

  const handleSelectMarchandises = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) =>
      parseInt(opt.value)
    );
    setNewFournisseur({ ...newFournisseur, marchandises_ids: selected });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentId(null);
    setNewFournisseur({
      nom: "",
      telephone: "",
      adresse: "",
      email: "",
      marchandises_ids: [],
    });
  };

  return (
    <div className="relative p-6 bg-gray-50 rounded-t-2xl min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <UserCircle2 className="text-[#43AB8A]" /> Liste des fournisseurs
        </h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={filterNom}
            onChange={(e) => setFilterNom(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A]"
          />
          <select
            value={filterAdresse}
            onChange={(e) => setFilterAdresse(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring focus:ring-[#43AB8A]"
          >
            <option value="">Toutes les adresses</option>
            {adresses.map((addr, i) => (
              <option key={i} value={addr}>
                {addr}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowModal(true);
              setEditMode(false);
              setCurrentId(null);
            }}
            className="flex items-center gap-2 bg-[#43AB8A] hover:bg-[#589f88] text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <PlusCircle size={18} /> Ajouter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-xl">
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
                <td className="p-3 font-semibold">{f.nom}</td>
                <td className="p-3">{f.telephone}</td>
                <td className="p-3">{f.adresse}</td>
                <td className="p-3">{f.email}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {f.marchandises.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-1 text-xs rounded-full bg-green-100 text-[#43AB8A] border"
                        title={`${m.designation} (${m.reference})`}
                      >
                        {m.designation}
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
                <td
                  colSpan="7"
                  className="p-6 text-center text-gray-500 italic"
                >
                  Aucun fournisseur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>
          Page {currentPage} sur {totalPages} ({filteredFournisseurs.length} fournisseurs)
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
