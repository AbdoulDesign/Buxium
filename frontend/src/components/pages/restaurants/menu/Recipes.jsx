import React from "react";
import { Salad, Soup } from "lucide-react";

const recipes = [
  {
    id: 1,
    dish: "Poulet DG",
    ingredients: ["Poulet", "Banane plantain", "Carotte", "Oignon"],
    icon: <Salad size={24} />,
  },
  {
    id: 2,
    dish: "Spaghetti bolognaise",
    ingredients: ["Spaghetti", "Viande hachée", "Tomate", "Ail"],
    icon: <Soup size={24} />,
  },
];

const Recipes = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">🍽️ Recettes</h2>

    <div className="grid gap-6">
      {recipes.map((rec) => (
        <div
          key={rec.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition p-5 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-2 gap-3">
            <div className="text-green-500 dark:text-green-400">{rec.icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white">{rec.dish}</h3>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Ingrédients :</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 text-sm pl-2">
            {rec.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export default Recipes;
