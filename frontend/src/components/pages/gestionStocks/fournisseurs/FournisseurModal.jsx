import React from "react";

const FournisseurModal = ({
  showModal,
  editMode,
  newFournisseur,
  setNewFournisseur,
  marchandises,
  handleSubmit,
  handleSelectMarchandises,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[450px] max-w-full p-6 relative animate-fade-in">
        {/* Header */}
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          {editMode ? "Modifier Fournisseur" : "Ajouter Fournisseur"}
        </h3>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newFournisseur.name}
              onChange={(e) =>
                setNewFournisseur({ ...newFournisseur, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#43AB8A] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Ex: Société X"
              required
            />
          </div>

          {/* Téléphone et Email (2 colonnes) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={newFournisseur.telephone}
                onChange={(e) =>
                  setNewFournisseur({
                    ...newFournisseur,
                    telephone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#43AB8A] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="+226 70 00 00 00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newFournisseur.email}
                onChange={(e) =>
                  setNewFournisseur({
                    ...newFournisseur,
                    email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#43AB8A] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="exemple@email.com"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={newFournisseur.adresse}
              onChange={(e) =>
                setNewFournisseur({
                  ...newFournisseur,
                  adresse: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#43AB8A] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Ex: Ouagadougou, Burkina Faso"
            />
          </div>

          {/* Sélection multiple marchandises */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Marchandises
            </label>
            <select
              multiple
              value={newFournisseur.marchandises_ids}
              onChange={handleSelectMarchandises}
              className="w-full px-3 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-[#43AB8A] focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {marchandises.map((m) => (
                <option key={m.id} value={m.id}>
                  ({m.reference}) — {m.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Maintenez <kbd>Ctrl</kbd> ou <kbd>Cmd</kbd> pour sélectionner plusieurs.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#43AB8A] hover:bg-[#599e88] text-white font-medium rounded-lg shadow transition"
            >
              {editMode ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>

        {/* Close button (icône discrète) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default FournisseurModal;
