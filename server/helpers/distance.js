// Sydney's city centre
const city = { latitude: -33.8678, longitude: 151.21 };

// How far a suburb is from the city in a straight line, in whole km.
// Close enough over a city this size, without needing a maps service
const kmToCity = ({ latitude, longitude }) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const x = toRadians(longitude - city.longitude) * Math.cos(toRadians((latitude + city.latitude) / 2));
    const y = toRadians(latitude - city.latitude);
    return Math.round(Math.sqrt(x * x + y * y) * 6371);
};

module.exports = kmToCity;