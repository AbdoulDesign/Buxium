import React from "react";

const ImportExport = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Import / Export Produits</h2>
      <div className="flex gap-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Importer (Excel / CSV)
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Exporter la liste
        </button>
      </div>
    </div>
  );
};

export default ImportExport;
