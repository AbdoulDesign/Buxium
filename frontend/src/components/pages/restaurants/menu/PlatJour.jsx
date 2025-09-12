import React, { useState } from "react";
import { Flame } from "lucide-react";
import Plat from "../../../../assets/Plat_africain.jpeg";

const daily = [
  {
    id: 1,
    name: "Poulet braisé",
    description: "Poulet entier grillé avec épices africaines",
    price: 3500,
    image: "/img/poulet.jpg",
    category: "Viande",
    available: true,
    popular: true,
    ingredients: ["Poulet", "Ail", "Gingembre", "Piment"]
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
    ingredients: ["Riz", "Pâte d'arachide", "Viande", "Épices"]
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
    ingredients: ["Banane plantain", "Poisson", "Tomates", "Oignon"]
  },
  {
    id: 4,
    name: "Pizza locale",
    description: "Pizza garnie au poulet et légumes locaux",
    price: 4000,
    image: "/img/pizza.jpg",
    category: "Fast-food",
    available: true,
    popular: false,
    ingredients: ["Farine", "Poulet", "Oignon", "Fromage"]
  }
];

const categories = ["Tous", "Viande", "Plat local", "Spécialité", "Fast-food"];

const PlatJour = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  const [priceFilter, setPriceFilter] = useState(0);

  const filteredDishes = daily.filter(dish => {
    const matchSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "Tous" || dish.category === categoryFilter;
    const matchPrice = priceFilter === 0 || dish.price <= priceFilter;
    return matchSearch && matchCategory && matchPrice;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">📅 Plats du Jour</h2>

      {/* Filtres */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un plat..."
          className="p-2 border rounded w-full md:w-1/3 dark:bg-gray-800 dark:border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="range"
          min="0"
          max="5000"
          step="500"
          value={priceFilter}
          onChange={(e) => setPriceFilter(Number(e.target.value))}
          className="w-full md:w-1/3"
        />
        <span className="text-gray-600 dark:text-gray-300">≤ {priceFilter.toLocaleString()} FCFA</span>
      </div>

      {/* Liste des plats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <div key={dish.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img
              src={Plat}
              alt={dish.name}
              className="w-full h-44 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{dish.name}</h3>
                {dish.popular && (
                  <span className="text-red-500 text-xs flex items-center gap-1">
                    <Flame size={14} /> Populaire
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{dish.description}</p>

              <div className="flex flex-wrap gap-1 mb-2">
                {dish.ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-800 dark:text-gray-100"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-lg text-green-700 dark:text-green-400">
                  {dish.price.toLocaleString()} FCFA
                </span>

                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${dish.available
                    ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                  }`}>
                  {dish.available ? "Disponible" : "Indisponible"}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Catégorie : <span className="font-medium">{dish.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatJour;
