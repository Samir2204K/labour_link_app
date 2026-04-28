// Initialize the map centered on a default location (India)
var map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles (FREE)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var userMarker;
var workerMarkers = [];

function locateUser() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    document.getElementById('status').innerText = "Locating...";

    navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;

    document.getElementById('status').innerText = "Location found: " + lat.toFixed(4) + ", " + lng.toFixed(4);

    // Center map on user
    map.setView([lat, lng], 14);

    // Add/Update user marker
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map).bindPopup("You are here").openPopup();
    }

    // Send location to backend
    sendLocationToBackend(lat, lng);

    // Fetch nearby workers
    fetchNearbyWorkers(lat, lng);
}

function error() {
    document.getElementById('status').innerText = "Unable to retrieve your location";
}

function sendLocationToBackend(lat, lng) {
    fetch('http://localhost:8080/api/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: lat, lng: lng }),
    })
    .then(response => response.json())
    .then(data => console.log('Location saved:', data))
    .catch(error => console.error('Error saving location:', error));
}

function fetchNearbyWorkers(lat, lng) {
    fetch(`http://localhost:8080/api/workers/nearby?lat=${lat}&lng=${lng}&radius=5`)
    .then(response => response.json())
    .then(workers => {
        displayWorkers(workers);
    })
    .catch(error => {
        console.error('Error fetching workers:', error);
        document.getElementById('workers').innerText = "Error loading workers. Is the backend running?";
    });
}

function displayWorkers(workers) {
    var workersDiv = document.getElementById('workers');
    workersDiv.innerHTML = '';

    // Clear existing worker markers
    workerMarkers.forEach(marker => map.removeLayer(marker));
    workerMarkers = [];

    if (workers.length === 0) {
        workersDiv.innerHTML = 'No workers found within 5km.';
        return;
    }

    workers.forEach(worker => {
        // Add marker to map
        var marker = L.marker([worker.latitude, worker.longitude], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        marker.bindPopup(`
            <b>${worker.name}</b><br>
            Category: ${worker.category}<br>
            Rating: ${worker.rating} ⭐<br>
            Distance: ${worker.distance} km
        `);
        workerMarkers.push(marker);

        // Add to list
        var workerItem = document.createElement('div');
        workerItem.className = 'worker-item';
        workerItem.innerHTML = `
            <strong>${worker.name}</strong> (${worker.category})<br>
            Distance: ${worker.distance} km | Rating: ${worker.rating} ⭐<br>
            Experience: ${worker.exp} years | Price: ₹${worker.price}/hr
        `;
        workersDiv.appendChild(workerItem);
    });
}
