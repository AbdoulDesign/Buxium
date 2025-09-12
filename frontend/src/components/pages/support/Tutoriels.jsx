import React from "react";

const Tutoriels = () => {
  const videos = [
    { titre: "Configurer le POS", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { titre: "Ajouter des produits", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tutoriels Vidéo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((v, i) => (
          <div key={i} className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">{v.titre}</h3>
            <iframe width="100%" height="200" src={v.url} title={v.titre}></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutoriels;
