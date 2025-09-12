import React from "react";

const ExportComptable = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Export Comptable</h2>
      <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2">Exporter en PDF</button>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Exporter en Excel</button>
    </div>
  );
};

export default ExportComptable;
