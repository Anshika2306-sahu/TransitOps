import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import axios from 'axios';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers using L.Icon
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LiveMap = ({ vehicles }) => {
  const getMarkerIcon = (status, isSosActive) => {
    if (isSosActive) {
      return L.divIcon({
        className: 'custom-sos-marker',
        html: `<div style="background-color: red; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px red; animation: pulse 1s infinite;">🚨</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    }

    switch(status) {
      case 'Available': return greenIcon;
      case 'On Trip': return blueIcon;
      default: return orangeIcon;
    }
  };
  // Center of India roughly
  const center = [20.5937, 78.9629];
  
  const mapVehicles = vehicles.filter(v => v.current_lat && v.current_lng);

  const handleSOS = async (vehicle) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:5000/api/accidents', {
        vehicle_id: vehicle.id,
        location_lat: vehicle.current_lat,
        location_lng: vehicle.current_lng
      }, { headers });
      alert(`SOS Alert sent for ${vehicle.registration_number}! Check the Accidents dashboard.`);
    } catch (err) {
      console.error(err);
      alert('Failed to send SOS');
    }
  };

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
      <MapContainer center={center} zoom={5} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapVehicles.map(v => (
          <Marker key={v.id} position={[v.current_lat, v.current_lng]} icon={getMarkerIcon(v.status, v.is_sos_active)}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-gray-800">{v.registration_number}</p>
                <p className="text-gray-600">{v.name_model}</p>
                <p className="mt-1 font-semibold" style={{ color: v.status === 'Available' ? 'green' : v.status === 'On Trip' ? 'blue' : 'orange'}}>
                  {v.status}
                </p>
                {v.is_sos_active && <p className="text-red-600 font-bold mt-2 animate-pulse">⚠️ EMERGENCY SOS ACTIVE</p>}
                <button 
                  onClick={() => handleSOS(v)}
                  className="mt-3 w-full bg-red-600 text-white font-bold py-1 px-2 rounded hover:bg-red-700"
                >
                  🚨 Simulate SOS Alert
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
