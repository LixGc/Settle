// Finds a street address on the map with OpenStreetMap, which is free and needs no API key.
// Returns null when it can't be found, and the place then uses its suburb's spot instead
const findAddress = async (address, suburb) => {
    if (!address) return null;
    try {
        const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=" + encodeURIComponent(`${address}, ${suburb}, NSW`);
        const response = await fetch(url, {
            // OpenStreetMap asks every app to say who is calling
            headers: { "User-Agent": "Settle/1.0 (student project)" },
        });
        const results = await response.json();
        return results.length ? { latitude: Number(results[0].lat), longitude: Number(results[0].lon) } : null;
    } catch (error) {
        console.log("Could not find the address on the map:", error.message);
        return null;
    }
};

module.exports = findAddress;