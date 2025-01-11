const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json";

// Initialize the map
const map = L.map('map', { center: [0, 0], zoom: 2 });

// Define base layers
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 19,
});

const grayscale = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
});

const outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 18 });


// Define overlay layers
const earthquakesLayer = L.layerGroup();
const tectonicPlatesLayer = L.layerGroup();

// Add base layers and overlays
const baseMaps = {
  Satellite: satellite,
  Grayscale: grayscale,
  Outdoors: outdoors,
};

const overlayMaps = {
  Earthquakes: earthquakesLayer,
  "Tectonic Plates": tectonicPlatesLayer,
};

// Add controls to map
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Add initial layers
satellite.addTo(map);
earthquakesLayer.addTo(map);

// Fetch and plot earthquake data using D3
d3.json(earthquakeUrl).then(data => {
  const earthquakes = data.features;

  earthquakes.forEach(earthquake => {
    const [lon, lat, depth] = earthquake.geometry.coordinates;
    const magnitude = earthquake.properties.mag;
    const place = earthquake.properties.place;

    L.circleMarker([lat, lon], {
      radius: magnitude * 3,
      fillColor: getColor(depth),
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .bindPopup(
        `<h3>${place}</h3>
        <p>Magnitude: ${magnitude}</p>
        <p>Depth: ${depth} km</p>`
      )
      .addTo(earthquakesLayer);
  });
}).catch(error => console.error('Error fetching earthquake data:', error));

// Fetch and plot tectonic plates data using D3
d3.json(tectonicPlatesUrl).then(data => {
  const tectonicPlates = L.geoJson(data, {
    style: {
      color: "orange",
      weight: 2,
    },
  });

  tectonicPlates.addTo(tectonicPlatesLayer);
}).catch(error => console.error('Error fetching tectonic plates data:', error));

// Function to determine marker color based on depth
function getColor(depth) {
  return depth > 90 ? '#d73027'
       : depth > 70 ? '#fc8d59'
       : depth > 50 ? '#fee08b'
       : depth > 30 ? '#d9ef8b'
       : '#91cf60';
}
