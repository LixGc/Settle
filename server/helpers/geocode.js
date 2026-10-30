// Finds a suburb on the map with OpenStreetMap, which is free and needs no API key.
// If the suburb can't be found, the place is saved without a map
const getCoordinates = async (location) => {
    const notFound = { latitude: null, longitude: null };
    if (!location) return notFound;
    try {
        const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=" + encodeURIComponent(location + ", NSW");
        const response = await fetch(url, {
            // OpenStreetMap asks every app to say who is calling
            headers: { "User-Agent": "Settle/1.0 (student project)" },
        });
        const results = await response.json();
        if (!results.length) return notFound;
        return { latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
    } catch (error) {
        console.log("Could not find the suburb on the map:", error.message);
        return notFound;
    }
};

module.exports = getCoordinates;