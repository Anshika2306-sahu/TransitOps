import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, vRes] = await Promise.all([
          axios.get('http://localhost:5000/api/trips'),
          axios.get('http://localhost:5000/api/vehicles')
        ]);
        setTrips(tRes.data);
        setVehicles(vRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    setError('');
    
    const vehicle = vehicles.find(v => v.id === parseInt(form.vehicle_id));
    if (vehicle && parseFloat(form.cargo_weight) > vehicle.max_load_capacity) {
      setError(`Capacity exceeded! Max allowed: ${vehicle.max_load_capacity} kg`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/trips/dispatch', form);
      const res = await axios.get('http://localhost:5000/api/trips');
      setTrips(res.data);
      setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight: '', planned_distance: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Dispatch failed');
    }
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="w-1/3 bg-white p-6 rounded shadow-sm border h-fit">
        <h2 className="text-xl font-bold mb-4">Dispatch New Trip</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleDispatch} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Source</label>
            <input className="w-full border p-2 rounded" required value={form.source} onChange={e => setForm({...form, source: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Destination</label>
            <input className="w-full border p-2 rounded" required value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Vehicle (Available Only)</label>
            <select className="w-full border p-2 rounded" required value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})}>
              <option value="">Select a vehicle...</option>
              {vehicles.filter(v => v.status === 'Available').map(v => (
                <option key={v.id} value={v.id}>{v.registration_number} - {v.name_model} (Max: {v.max_load_capacity}kg)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Driver</label>
            <select className="w-full border p-2 rounded" required value={form.driver_id} onChange={e => setForm({...form, driver_id: e.target.value})}>
              <option value="">Select a driver...</option>
              <option value="1">Admin Manager (Fallback)</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Cargo Weight (kg)</label>
              <input type="number" className="w-full border p-2 rounded" required value={form.cargo_weight} onChange={e => setForm({...form, cargo_weight: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Distance (km)</label>
              <input type="number" className="w-full border p-2 rounded" required value={form.planned_distance} onChange={e => setForm({...form, planned_distance: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-yellow text-white font-bold p-3 rounded hover:bg-yellow-600 transition">
            Dispatch Trip
          </button>
        </form>
      </div>

      <div className="w-2/3 bg-gray-100 p-6 rounded border overflow-auto">
        <h2 className="text-xl font-bold mb-4">Live Dispatch Board</h2>
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className={`p-4 rounded border-l-4 shadow-sm bg-white ${trip.status === 'Dispatched' ? 'border-blue-500' : 'border-gray-300'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{trip.source} → {trip.destination}</p>
                  <p className="text-sm text-gray-600">Vehicle: {trip.registration_number} | Driver: {trip.driver_name || 'Admin Manager'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${trip.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
          {trips.length === 0 && <p className="text-gray-500">No trips found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Trips;
