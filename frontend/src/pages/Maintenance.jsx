import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicle_id: '', description: '', cost: '', date: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lRes, vRes] = await Promise.all([
        axios.get('http://localhost:5000/api/maintenance'),
        axios.get('http://localhost:5000/api/vehicles')
      ]);
      setLogs(lRes.data);
      setVehicles(vRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/maintenance', form);
      fetchData();
      setForm({ vehicle_id: '', description: '', cost: '', date: '' });
    } catch (err) {
      alert('Failed to log service');
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/maintenance/${id}/close`);
      fetchData();
    } catch (err) {
      alert('Failed to close log');
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Log Form */}
      <div className="w-1/3 bg-white p-6 rounded shadow-sm border h-fit">
        <h2 className="text-xl font-bold mb-4">Log Service Record</h2>
        <form onSubmit={handleLogService} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Vehicle</label>
            <select className="w-full border p-2 rounded" required value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})}>
              <option value="">Select a vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registration_number} - {v.name_model} ({v.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Service Description</label>
            <textarea className="w-full border p-2 rounded h-24" required value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Cost</label>
              <input type="number" className="w-full border p-2 rounded" required value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input type="date" className="w-full border p-2 rounded" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-yellow text-white font-bold p-3 rounded hover:bg-yellow-600 transition">
            Submit Service Log
          </button>
        </form>
      </div>

      {/* Logs Table */}
      <div className="w-2/3 bg-white rounded border shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b bg-gray-50">Maintenance Logs</h2>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">Vehicle</th>
              <th className="p-4 font-semibold text-gray-600">Description</th>
              <th className="p-4 font-semibold text-gray-600">Cost</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4">{new Date(log.date).toLocaleDateString()}</td>
                <td className="p-4 font-mono font-semibold text-sm">{log.registration_number}</td>
                <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{log.description}</td>
                <td className="p-4">${log.cost}</td>
                <td className="p-4 text-right">
                  {log.status === 'Open' ? (
                    <button onClick={() => handleClose(log.id)} className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded text-sm hover:bg-green-200">
                      Close Log
                    </button>
                  ) : (
                    <span className="text-gray-400 font-semibold text-sm px-3 py-1">Closed</span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No logs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
