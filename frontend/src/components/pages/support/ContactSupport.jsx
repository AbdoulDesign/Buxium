import React from "react";

const ContactSupport = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Contact Support</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Votre nom" className="w-full border p-2 rounded" />
        <input type="email" placeholder="Votre email" className="w-full border p-2 rounded" />
        <textarea placeholder="Votre message" className="w-full border p-2 rounded"></textarea>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Envoyer</button>
      </form>
    </div>
  );
};

export default ContactSupport;
