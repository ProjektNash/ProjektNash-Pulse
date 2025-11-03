import React, { useState } from "react";
import Areas from "./pages/Areas";
import AreaAssets from "./pages/AreaAssets";

export default function Assets() {
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    <div className="p-4">
      {!selectedArea ? (
        // Main area list view
        <Areas setSelectedArea={setSelectedArea} />
      ) : (
        // Asset list for selected area
        <AreaAssets
          area={selectedArea}
          goBack={() => setSelectedArea(null)}
        />
      )}
    </div>
  );
}
