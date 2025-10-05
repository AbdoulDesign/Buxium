import React from "react";
import { X } from "lucide-react";

const BoutiqueEditModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          ✏️ Modifier la Boutique
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* 🔹 Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la boutique
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
              required
            />
          </div>

          {/* 🔹 Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
            />
          </div>

          {/* 🔹 Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
            />
          </div>

          {/* 🔹 Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows="2"
              className="w-full border rounded-lg p-2 focus:ring focus:ring-[#43AB8A]"
            ></textarea>
          </div>

          {/* 🔹 Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (optionnel)
            </label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
            {formData.logo && typeof formData.logo === "string" && (
              <img
                src={formData.logo}
                alt="Logo actuel"
                className="mt-2 h-16 w-16 object-cover rounded-lg"
              />
            )}
          </div>

          {/* 🔹 Statut */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-[#43AB8A]"
            />
            <span>Boutique active</span>
          </label>

          {/* 🔹 Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#43AB8A] text-white rounded-lg hover:bg-[#64aa94]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoutiqueEditModal;
