mapboxgl.accessToken = mapToken;

// Get coordinates from listing's geometry
const coordinates = listing.geometry.coordinates;

// Initialize map with proper error handling
try {
    const map = new mapboxgl.Map({
        container: 'map',
        style: "mapbox://styles/mapbox/streets-v12",
        center: coordinates,
        zoom: 9
    });

    // Add marker after map loads
    map.on('load', () => {
        new mapboxgl.Marker({ color: '#FF0000' })
            .setLngLat(coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                    <h4>${listing.title}</h4>
                    <p>${listing.location}</p>
                `)
            )
            .addTo(map);
    });

    // Add error handling
    map.on('error', (e) => {
        console.error("Map error:", e);
    });

} catch (error) {
    console.error("Map initialization error:", error);
}