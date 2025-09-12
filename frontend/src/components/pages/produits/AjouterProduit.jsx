import React, { useState } from "react";

const AjouterProduit = () => {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajouter un Produit</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">Nom du produit</label>
          <input type="text" className="w-full border rounded p-2" placeholder="Nom" />
        </div>
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">Prix</label>
          <input type="number" className="w-full border rounded p-2" placeholder="Prix en FCFA" />
        </div>
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">Image</label>
          <input type="file" onChange={handleImageChange} className="w-full border p-2" />
          {image && <img src={image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default AjouterProduit;
