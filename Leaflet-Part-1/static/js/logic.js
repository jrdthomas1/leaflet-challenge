const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Initialize the map
const map = L.map('map').setView([0, 0], 2);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Fetch and Plot data using D3
d3.json(earthquakeUrl).then(data => createMap(data));

// Function to create markers and add them to the map
function createMap(data) {
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
      .addTo(map);
  });
}

// Function to determine marker color based on depth
function getColor(depth) {
  return depth > 90
    ? '#d73027'
    : depth > 70
    ? '#fc8d59'
    : depth > 50
    ? '#fee08b'
    : depth > 30
    ? '#d9ef8b'
    : '#91cf60';
}

// Add a legend to the map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  const depths = [0, 30, 50, 70, 90]; // Depth ranges
  const colors = ['#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027']; // Corresponding colors

  // Add a title to the legend
  div.innerHTML = '<h4>Depth (km)</h4>';

  // Loop through depth intervals and create a color box and label for each range
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      `<i style="background:${colors[i]}; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i>` +
      `${depths[i]}${depths[i + 1] ? `–${depths[i + 1]}` : '+'}<br>`;
  }

  return div;
};

// Add the legend to the map
legend.addTo(map);

