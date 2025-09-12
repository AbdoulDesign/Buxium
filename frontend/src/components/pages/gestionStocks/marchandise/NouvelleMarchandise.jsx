import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";

const API_BASE = "http://localhost:8000/api/gestion-stock";

const NouvelleMarchandise = ({ existingData, onClose }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const entreprise_id = userData?.id;
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    designation: existingData?.designation || "",
    categorie: existingData?.categorie?.id || "",
    unite: existingData?.unite || "",
    seuil: existingData?.seuil || "",
    stock: existingData?.stock || "",
    prix: existingData?.prix || "",
    prix_achat: existingData?.prix_achat || "",
    prix_vente: existingData?.prix_vente || "",
    image: null,
    is_active: true,
    entreprise: entreprise_id,
  });

  const [imagePreview, setImagePreview] = useState(existingData?.image || null);
  const [loading, setLoading] = useState(false);

  const unites = ["Pièce","Sachet","Sac","Carton","Caisse","Boîte","Bouteille","Bidon","Rouleau","Lot","Paquet","Tonne"];

  useEffect(() => {
    axios.get(`${API_BASE}/categories/`).then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "")
          data.append(key, formData[key]);
      });

      if (existingData) {
        await axios.put(`${API_BASE}/marchandises/${existingData.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE}/marchandises/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onClose();
    } catch (err) {
      alert("❌ Erreur lors de l’enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <FiX size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
          {existingData ? "Modifier la marchandise" : "Nouvelle marchandise"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Nom de marchandise"
            required
            className="border p-2 rounded"
          />
          <select
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          >
            <option value="">Choisir la categorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          <select
            name="unite"
            value={formData.unite}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          >
            <option value="">Choisir une unité</option>
            {unites.map((u, i) => (
              <option key={i} value={u}>{u}</option>
            ))}
          </select>
          <input
            type="number"
            name="seuil"
            value={formData.seuil}
            onChange={handleChange}
            placeholder="Seuil d'alerte"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Quantité en stock"
            className="border p-2 rounded"
          />
          <input
            type="number"
            step="0.01"
            name="prix_achat"
            value={formData.prix_achat}
            onChange={handleChange}
            placeholder="Prix d'achat"
            className="border p-2 rounded"
          />
          <input
            type="number"
            step="0.01"
            name="prix_vente"
            value={formData.prix_vente}
            onChange={handleChange}
            placeholder="Prix de vente"
            className="border p-2 rounded"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="h-24 object-cover col-span-2 rounded" />
          )}
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-[#43AB8A] hover:bg-[#71c8ad] text-white py-2 rounded-lg"
          >
            {loading ? "⏳ Enregistrement..." : (existingData ? "Modifier" : "Ajouter")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NouvelleMarchandise;
