import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fleet = () => {
  const [data, setData] = useState({ vehicles: [], drivers: [], trips: [] });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ registration_number: '', name_model: '', type: 'Heavy Truck', max_load_capacity: '', acquisition_cost: '' });

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [vehRes, drvRes, tripRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicles', { headers }),
        axios.get('http://localhost:5000/api/drivers', { headers }),
        axios.get('http://localhost:5000/api/trips', { headers })
      ]);
      setData({ vehicles: vehRes.data, drivers: drvRes.data, trips: tripRes.data });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:5000/api/vehicles', form, { headers });
      fetchData();
      setShowModal(false);
      setForm({ registration_number: '', name_model: '', type: 'Heavy Truck', max_load_capacity: '', acquisition_cost: '' });
    } catch (err) {
      alert('Failed to add vehicle');
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleDispatch = async (vehicleId, driverId) => {
    if (!driverId || isProcessing) return;
    setIsProcessing(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.post('http://localhost:5000/api/trips/dispatch', {
        vehicle_id: vehicleId,
        driver_id: driverId,
        source: 'Mumbai, MH', 
        destination: 'Delhi, DL', 
        cargo_weight: 10000,
        planned_distance: 1400
      }, { headers });
      await fetchData();
    } catch (err) {
      alert('Failed to dispatch trip');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (tripId, newStatus) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      await axios.put(`http://localhost:5000/api/trips/${tripId}/status`, { status: newStatus }, { headers });
      await fetchData();
    } catch (err) {
      alert('Failed to update status');
      console.error('Failed to update status', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Trip': return 'bg-blue-600 text-white';
      case 'Dispatched': return 'bg-blue-600 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Draft': return 'bg-gray-500 text-white';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Shop': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fleet Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Assign drivers and manage dispatch statuses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-brand-yellow text-white px-4 py-2 rounded font-bold hover:bg-yellow-600">
          + Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Vehicle</th>
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Model</th>
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Driver Assignment</th>
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Trip Status</th>
              <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">Demo</th>
            </tr>
          </thead>
          <tbody>
            {data.vehicles.map(v => {
              // Find active trip for this vehicle
              const activeTrip = data.trips.find(t => t.vehicle_id === v.id && t.status !== 'Completed');
              
              return (
                <tr key={v.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-gray-800">{v.registration_number}</td>
                  <td className="p-4 font-semibold text-gray-600">{v.name_model}</td>
                  <td className="p-4">
                    {activeTrip ? (
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {activeTrip.driver_name}
                      </span>
                    ) : (
                      <select 
                        className="border rounded px-3 py-1 bg-white text-sm outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-48"
                        onChange={(e) => handleDispatch(v.id, e.target.value)}
                        value=""
                        disabled={v.status !== 'Available' || isProcessing}
                      >
                        <option value="" disabled>{v.status === 'Available' ? 'Assign Driver...' : 'Unavailable'}</option>
                        {data.drivers.filter(d => d.status === 'Available').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="p-4">
                    {activeTrip ? (
                      <select 
                        value={activeTrip.status}
                        onChange={(e) => handleStatusChange(activeTrip.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer outline-none ${getStatusColor(activeTrip.status)}`}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', textAlign: 'center' }}
                        disabled={isProcessing}
                      >
                        <option className="bg-white text-gray-900" value="Draft">Draft</option>
                        <option className="bg-white text-gray-900" value="Dispatched">Dispatched</option>
                        <option className="bg-white text-gray-900" value="On Trip">On Trip</option>
                        <option className="bg-white text-gray-900" value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(v.status)}`}>
                        {v.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 border-b">
                    <button 
                      onClick={() => {
                        window.open(`http://localhost:5173/driver-login`, '_blank');
                      }}
                      className="text-xs font-bold bg-violet-600 text-white px-4 py-2 rounded-xl shadow-md shadow-violet-300/40 hover:bg-violet-500 hover:-translate-y-0.5 transition-all duration-200"
                      title="Open Demo Link"
                    >
                      Link
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input required placeholder="Reg Number (e.g. MH-01-AB-1234)" className="w-full border p-2 rounded uppercase" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value.toUpperCase()})} />
              <input required placeholder="Name & Model" className="w-full border p-2 rounded" value={form.name_model} onChange={e => setForm({...form, name_model: e.target.value})} />
              <select className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>Heavy Truck</option>
                <option>Light Commercial</option>
                <option>Van</option>
              </select>
              <input required type="number" placeholder="Max Load Capacity (kg)" className="w-full border p-2 rounded" value={form.max_load_capacity} onChange={e => setForm({...form, max_load_capacity: e.target.value})} />
              <input required type="number" placeholder="Acquisition Cost (₹)" className="w-full border p-2 rounded" value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} />
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-yellow text-white rounded font-bold hover:bg-yellow-600">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fleet;
