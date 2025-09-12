import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const UtilisateurModal = ({
  isOpen,
  isEditMode,
  formData,
  roles,
  errorMessage,
  handleChange,
  handleSubmit,
  onClose,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[500px] relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-[#43AB8A]">
          {isEditMode ? "✏️ Modifier un utilisateur" : "Créer un utilisateur"}
        </h2>

        {errorMessage && (
          <p className="text-red-500 font-medium mb-3">{errorMessage}</p>
        )}

        <form
          onSubmit={(e) => handleSubmit(e, showPassword, password)}
          className="grid grid-cols-1 gap-4"
        >
          {/* Nom */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Entrez le nom"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none"
              required
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm 
              focus:ring-2 focus:ring-[#43AB8A] focus:border-[#43AB8A] focus:outline-none transition"
              required
            >
              <option value="">-- Choisir un rôle --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nom utilisateur */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Nom d’utilisateur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ex: jdupont"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none"
              required
            />
          </div>

          {/* Mot de passe (uniquement création) */}
          {!isEditMode && (
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none"
                required
              />
            </div>
          )}

          {/* Checkbox pour changement de mot de passe (édition uniquement) */}
          {isEditMode && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="changePassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="changePassword" className="text-gray-700">
                Modifier le mot de passe
              </label>
            </div>
          )}

          {/* Champ nouveau mot de passe (affiché uniquement si case cochée) */}
          {isEditMode && showPassword && (
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {/* Bouton valider */}
          <button
            type="submit"
            className="mt-4 bg-[#43AB8A] hover:bg-[#368C6F] text-white px-4 py-2 rounded-lg shadow transition"
          >
            {isEditMode ? "Mettre à jour" : "Créer l’utilisateur"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UtilisateurModal;
