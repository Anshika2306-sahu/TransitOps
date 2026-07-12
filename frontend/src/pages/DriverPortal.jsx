import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const DriverPortal = () => {
  const { id } = useParams(); // vehicle_id
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState('');
  const [isSosActive, setIsSosActive] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        
        try {
          await axios.put(`http://localhost:5000/api/vehicles/${id}/location`, {
            current_lat: latitude,
            current_lng: longitude
          });
        } catch (err) {
          console.error('Failed to update location', err);
        }
      },
      (err) => {
        setError('Failed to get GPS location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [id]);

  const triggerSOS = async () => {
    try {
      await axios.post(`http://localhost:5000/api/vehicles/${id}/sos`);
      setIsSosActive(true);
      alert('SOS ALERT SENT TO DISPATCHER');
    } catch (err) {
      alert('Failed to send SOS');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2">TransitOps Driver</h1>
      <p className="text-gray-400 mb-8">Vehicle ID: {id}</p>
      
      {error && <div className="bg-red-500 text-white p-3 rounded mb-6 w-full text-center font-semibold shadow-lg">{error}</div>}
      
      <div className="bg-gray-800 p-6 rounded-lg w-full mb-8 text-center shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-2 text-gray-300">Live GPS Status</h2>
        {location.lat ? (
          <p className="text-green-400 font-mono text-lg">
            Lat: {location.lat.toFixed(6)} <br/>
            Lng: {location.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-yellow-500 animate-pulse font-semibold">Acquiring satellite lock...</p>
        )}
      </div>

      <button 
        onClick={triggerSOS}
        disabled={isSosActive}
        className={`w-full max-w-sm h-48 rounded-full text-4xl font-extrabold shadow-2xl transition-all duration-300 ${isSosActive ? 'bg-red-800 text-red-300 cursor-not-allowed border-4 border-red-900' : 'bg-red-600 hover:bg-red-500 active:scale-95 animate-pulse border-4 border-red-400 shadow-[0_0_50px_rgba(220,38,38,0.6)]'}`}
      >
        {isSosActive ? 'SOS ACTIVE' : 'EMERGENCY SOS'}
      </button>
      
      <p className="mt-8 text-gray-500 text-sm text-center px-4">Keep this screen open while driving to maintain live tracking connection with the dispatch center.</p>
    </div>
  );
};

export default DriverPortal;
