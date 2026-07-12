import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Fleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ registration_number: '', name_model: '', type: 'Heavy Truck', max_load_capacity: '', acquisition_cost: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicles', form);
      fetchVehicles();
      setShowModal(false);
      setForm({ registration_number: '', name_model: '', type: 'Heavy Truck', max_load_capacity: '', acquisition_cost: '' });
    } catch (err) {
      alert('Failed to add vehicle');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Trip': return 'bg-blue-100 text-blue-800';
      case 'In Shop': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fleet Registry</h1>
        <button onClick={() => setShowModal(true)} className="bg-brand-yellow text-white px-4 py-2 rounded font-bold hover:bg-yellow-600">
          + Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Reg Number</th>
              <th className="p-4 font-semibold text-gray-600">Model</th>
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600">Capacity (kg)</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4 font-mono">{v.registration_number}</td>
                <td className="p-4 font-semibold">{v.name_model}</td>
                <td className="p-4 text-gray-600">{v.type}</td>
                <td className="p-4">{v.max_load_capacity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(v.status)}`}>
                    {v.status}
                  </span>
                  {v.is_sos_active === 1 && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs animate-pulse">SOS</span>}
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
              <input required type="number" placeholder="Acquisition Cost" className="w-full border p-2 rounded" value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} />
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
