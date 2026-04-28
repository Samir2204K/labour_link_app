import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function UserLocationMap({ customerName, latitude, longitude, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView([latitude, longitude], 15);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      const userIcon = window.L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      window.L.marker([latitude, longitude], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${customerName}</b> is here.`)
        .openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, customerName]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b flex justify-between items-center bg-accent text-white">
          <h3 className="text-xl font-bold">User Location: {customerName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div ref={mapRef} className="h-[400px] w-full" />
        
        <div className="p-6 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500 font-medium">Use this map to reach the customer's location.</p>
            <button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')}
                className="bg-accent text-white px-6 py-2 rounded-xl font-bold hover:bg-accent/90 transition-all flex items-center gap-2"
            >
                Open in Google Maps
            </button>
        </div>
      </div>
    </div>
  );
}
