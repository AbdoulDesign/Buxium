import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const initialDishes = [
  {
    id: 1,
    name: "Poulet braisé",
    description: "Poulet entier grillé avec épices africaines",
    price: 3500,
    image: "/img/poulet.jpg",
    category: "Viande",
    available: true,
    popular: true,
    ingredients: ["Poulet", "Ail", "Gingembre", "Piment"],
    inMenu: true
  },
  {
    id: 2,
    name: "Riz sauce arachide",
    description: "Riz blanc servi avec sauce arachide et viande",
    price: 2000,
    image: "/img/riz.jpg",
    category: "Plat local",
    available: true,
    popular: false,
    ingredients: ["Riz", "Pâte d'arachide", "Viande", "Épices"],
    inMenu: false
  },
  {
    id: 3,
    name: "Alloco + poisson",
    description: "Banane plantain frit + poisson braisé",
    price: 2500,
    image: "/img/alloco.jpg",
    category: "Spécialité",
    available: false,
    popular: true,
    ingredients: ["Banane plantain", "Poisson", "Tomates", "Oignon"],
    inMenu: true
  }
];

const Plats = () => {
  const [dishes, setDishes] = useState(initialDishes);

  const toggleMenuDay = (id) => {
    setDishes(dishes.map(dish => dish.id === id ? { ...dish, inMenu: !dish.inMenu } : dish));
  };

  const deleteDish = (id) => {
    const confirm = window.confirm("Supprimer ce plat ?");
    if (confirm) {
      setDishes(dishes.filter(d => d.id !== id));
    }
  };

  return (
    <div className="p-6 overflow-x-auto max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📃 Tous les Plats</h2>

      <table className="min-w-full bg-white dark:bg-gray-900 border rounded shadow">
        <thead className="bg-gray-100 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-300">
          <tr>
            <th className="p-2">Image</th>
            <th className="p-2">Nom</th>
            <th className="p-2">Description</th>
            <th className="p-2">Prix</th>
            <th className="p-2">Catégorie</th>
            <th className="p-2">Populaire</th>
            <th className="p-2">Disponible</th>
            <th className="p-2">Ingrédients</th>
            <th className="p-2">Menu du jour</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700 dark:text-gray-200">
          {dishes.map((dish) => (
            <tr key={dish.id} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <img src={dish.image} alt={dish.name} className="h-14 w-14 rounded object-cover" />
              </td>
              <td className="p-2 font-semibold">{dish.name}</td>
              <td className="p-2 text-sm">{dish.description}</td>
              <td className="p-2 text-green-600 font-bold">{dish.price.toLocaleString()} FCFA</td>
              <td className="p-2">{dish.category}</td>
              <td className="p-2">
                {dish.popular ? (
                  <span className="text-red-600 font-medium">🔥 Oui</span>
                ) : (
                  "Non"
                )}
              </td>
              <td className="p-2">
                {dish.available ? (
                  <span className="text-green-600">Oui</span>
                ) : (
                  <span className="text-red-600">Non</span>
                )}
              </td>
              <td className="p-2">
                <ul className="list-disc list-inside text-xs">
                  {dish.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </td>
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={dish.inMenu}
                  onChange={() => toggleMenuDay(dish.id)}
                  className="h-4 w-4"
                />
              </td>
              <td className="p-2 flex gap-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <Pencil size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => deleteDish(dish.id)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Plats;
