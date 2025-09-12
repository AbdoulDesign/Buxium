import React from "react";

const Promotions = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Promotions Personnalisées</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Nom du client" className="w-full border p-2 rounded" />
        <textarea placeholder="Message promo (SMS/WhatsApp)" className="w-full border p-2 rounded"></textarea>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Envoyer Promotion</button>
      </form>
    </div>
  );
};

export default Promotions;
