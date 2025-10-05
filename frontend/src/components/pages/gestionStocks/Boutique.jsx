import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { PlusCircle, Store } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../Api";
import BoutiqueEditModal from "./BoutiqueEditModal";

const Boutique = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    adresse: "",
    telephone: "",
    activite: "",
    logo: null,
    is_active: true,
  });

  // 🔹 Charger les boutiques
  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts/boutiques/");
      setBoutiques(res.data || []);
    } catch (err) {
      console.error("Erreur chargement boutiques:", err);
      toast.error("❌ Erreur lors du chargement des boutiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoutiques();
  }, []);

  // 🔹 Supprimer une boutique
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette boutique ?")) return;
    try {
      await api.delete(`/accounts/boutiques/${id}/`);
      setBoutiques((prev) => prev.filter((b) => b.id !== id));
      toast.success("✅ Boutique supprimée !");
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de la suppression !");
    }
  };

  // 🔹 Ouvrir modal pour édition
  const openModal = (boutique) => {
    setSelectedBoutique(boutique || null);
    if (boutique) {
      setFormData({
        name: boutique.name || "",
        email: boutique.user.email || "",
        adresse: boutique.adresse || "",
        telephone: boutique.telephone || "",
        activite: boutique.activite,
        logo: null,
        is_active: boutique.is_active,
      });
      setModalOpen(true);
    }
  };

  // 🔹 Soumettre formulaire modification
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedBoutique) return;

  const dataToSend = new FormData();
  dataToSend.append("name", formData.name);
  dataToSend.append("email", formData.email || "");
  dataToSend.append("adresse", formData.adresse || "");
  dataToSend.append("telephone", formData.telephone || "");
  dataToSend.append("is_active", formData.is_active);

  if (formData.logo) {
    dataToSend.append("logo", formData.logo);
  }

  // 🔹 Ajout de l'activité (ID)
  if (formData.activite) {
    dataToSend.append("activite", formData.activite); // formData.activite est déjà l'id
  }

  try {
    await api.put(`/accounts/boutiques/${selectedBoutique.id}/`, dataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("✅ Boutique mise à jour !");
    setModalOpen(false);
    fetchBoutiques();
  } catch (err) {
    console.error(err);
    toast.error("❌ Erreur lors de la mise à jour !");
  }
};

  // 🔹 Filtrage
  const filtered = boutiques.filter(
    (b) =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-2 text-gray-800">
          <Store size={28} className="text-[#43AB8A]" /> Liste des Boutiques
        </h1>
      </div>

      {/* 🔍 Recherche */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom, email ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg shadow-sm w-full md:w-96 focus:ring focus:ring-[#43AB8A]"
        />
      </div>

      {/* 🖥️ Tableau */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">⏳ Chargement...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-[#43AB8A] text-white">
              <tr>
                <th className="p-3">Logo</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Adresse</th>
                <th className="p-3">Activité</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-center">
                      {b.logo ? (
                        <img
                          src={b.logo}
                          alt={b.name}
                          className="h-12 w-12 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                          <Store size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-bold">{b.name}</td>
                    <td className="p-3">{b.user?.email || "—"}</td>
                    <td className="p-3">{b.telephone || "—"}</td>
                    <td className="p-3">{b.adresse || "—"}</td>
                    <td className="p-3">{b.activite_label || "-"}</td>
                    <td className="p-3 text-center">
                      {b.is_active ? (
                        <span className="text-green-600 flex items-center justify-center gap-1 font-medium">
                          <FiCheckCircle /> Actif
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center justify-center gap-1 font-medium">
                          <FiXCircle /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <button
                        onClick={() => openModal(b)}
                        className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                      >
                        <FiEdit className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 bg-red-100 rounded hover:bg-red-200"
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    Aucune boutique trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🪟 Modal édition */}
      {selectedBoutique && (
        <BoutiqueEditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default Boutique;
