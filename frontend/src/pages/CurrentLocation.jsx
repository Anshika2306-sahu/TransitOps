import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveMap from '../components/LiveMap';

const CurrentLocation = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get('http://localhost:5000/api/vehicles', { headers });
        setVehicles(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 3000); // Poll every 3 seconds for live SOS flashes
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    if (filter === 'All') return true;
    return v.status === filter;
  });

  const getTabStyle = (tabName) => {
    const baseStyle = "px-6 py-3 font-semibold text-sm transition border-b-2 ";
    if (filter === tabName) {
      if(tabName === 'On Trip') return baseStyle + "border-blue-600 text-blue-600";
      if(tabName === 'Available') return baseStyle + "border-green-600 text-green-600";
      if(tabName === 'In Shop') return baseStyle + "border-orange-600 text-orange-600";
      return baseStyle + "border-gray-900 text-gray-900";
    }
    return baseStyle + "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
  };

  if (loading) return <div className="p-8 text-gray-500">Loading Map Data...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Current Location Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Live GPS coordinates of the entire fleet</p>
        </div>
      </div>

      <div className="flex border-b bg-white">
        <button onClick={() => setFilter('All')} className={getTabStyle('All')}>
          All Fleet ({vehicles.length})
        </button>
        <button onClick={() => setFilter('On Trip')} className={getTabStyle('On Trip')}>
          On Trip ({vehicles.filter(v => v.status === 'On Trip').length})
        </button>
        <button onClick={() => setFilter('Available')} className={getTabStyle('Available')}>
          Available ({vehicles.filter(v => v.status === 'Available').length})
        </button>
        <button onClick={() => setFilter('In Shop')} className={getTabStyle('In Shop')}>
          Servicing ({vehicles.filter(v => v.status === 'In Shop').length})
        </button>
      </div>

      <div className="flex-1 w-full bg-gray-100 relative">
        <div className="absolute inset-0">
          <LiveMap vehicles={filteredVehicles} />
        </div>
      </div>
    </div>
  );
};

export default CurrentLocation;
