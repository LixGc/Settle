// Finds a place on the map with OpenStreetMap, which is free and needs no API key
const search = async (query) => {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=" + encodeURIComponent(query);
    const response = await fetch(url, {
        // OpenStreetMap asks every app to say who is calling
        headers: { "User-Agent": "Settle/1.0 (student project)" },
    });
    const results = await response.json();
    return results.length ? { latitude: Number(results[0].lat), longitude: Number(results[0].lon) } : null;
};

// Tries the street address first, then just the suburb, so the place at least gets the right area.
// If neither can be found, the place is saved without a map
const getCoordinates = async (address, location) => {
    const notFound = { latitude: null, longitude: null };
    if (!location) return notFound;
    try {
        if (address) {
            const found = await search(`${address}, ${location}, NSW`);
            if (found) return found;
            // OpenStreetMap allows one search a second
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return (await search(`${location}, NSW`)) || notFound;
    } catch (error) {
        console.log("Could not find the place on the map:", error.message);
        return notFound;
    }
};

module.exports = getCoordinates;