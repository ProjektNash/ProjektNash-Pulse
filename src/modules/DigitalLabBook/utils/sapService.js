import { placeholderSapItems } from "../data/placeholderSapItems";

// ---------------------------------------------
// SAP SERVICE LAYER – PLACEHOLDER VERSION
// Replace with DaleGroup API once endpoint arrives
// ---------------------------------------------

export async function fetchSapRawMaterials() {
  try {
    // TODO: Replace this with real SAP API endpoint
    // Example:
    //
    // const res = await fetch(`${API_BASE}/sap/items`);
    // if (!res.ok) throw new Error("Failed to fetch SAP items");
    // return await res.json();
    //
    // ----------------------------------------------

    // TEMPORARY: return placeholder items
    return placeholderSapItems;

  } catch (err) {
    console.error("❌ Error fetching SAP items:", err);
    return [];
  }
}
