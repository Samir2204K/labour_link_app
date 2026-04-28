import React, { useEffect, useRef } from 'react';

export default function MapComponent({ userLocation, workers, onWorkerSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map if not already done
    if (!mapInstanceRef.current && mapRef.current) {
      const initialCenter = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
      const initialZoom = userLocation ? 13 : 5;

      mapInstanceRef.current = window.L.map(mapRef.current).setView(initialCenter, initialZoom);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user marker
    if (userLocation) {
      const userIcon = window.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("You are here");
      
      markersRef.current.push(userMarker);
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }

    // Add worker markers
    const workerIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    workers.filter(w => w.latitude && w.longitude).forEach(worker => {
      const marker = window.L.marker([worker.latitude, worker.longitude], { icon: workerIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family: Poppins, sans-serif;">
            <h4 style="margin: 0; font-weight: bold;">${worker.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">${worker.category}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; font-weight: bold; color: #2563eb;">${worker.distance} km away</p>
          </div>
        `);
      
      marker.on('click', () => onWorkerSelect(worker));
      markersRef.current.push(marker);
    });
  }, [userLocation, workers]);

  return (
    <div 
      ref={mapRef} 
      className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 mb-8 z-0"
    />
  );
}
