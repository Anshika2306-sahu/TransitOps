import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Accidents = () => {
  const [accidents, setAccidents] = useState([]);

  useEffect(() => {
    fetchAccidents();
    // Auto-refresh every 5 seconds for live emergencies
    const interval = setInterval(fetchAccidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAccidents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/accidents');
      setAccidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          <span className="animate-pulse">🚨</span> Emergency & Accidents Log
        </h1>
        <button onClick={fetchAccidents} className="bg-gray-100 px-4 py-2 rounded font-semibold text-gray-700 hover:bg-gray-200">
          Refresh Live Data
        </button>
      </div>

      <div className="bg-white rounded border-2 border-red-200 shadow-lg overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-red-50 border-b border-red-200">
            <tr>
              <th className="p-4 font-bold text-red-800">Timestamp</th>
              <th className="p-4 font-bold text-red-800">Vehicle</th>
              <th className="p-4 font-bold text-red-800">Driver (On Trip)</th>
              <th className="p-4 font-bold text-red-800">Last GPS Coordinates</th>
              <th className="p-4 font-bold text-red-800">Incident Details</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map(acc => (
              <tr key={acc.id} className="border-b last:border-b-0 hover:bg-red-50 transition">
                <td className="p-4 font-mono text-sm">{new Date(acc.timestamp).toLocaleString()}</td>
                <td className="p-4 font-bold text-gray-800">{acc.registration_number} <br/><span className="text-xs text-gray-500 font-normal">{acc.name_model}</span></td>
                <td className="p-4 font-semibold">{acc.driver_name || <span className="text-gray-400 italic">Idle / Unknown</span>}</td>
                <td className="p-4 font-mono text-xs text-gray-600">
                  {acc.location_lat ? (
                    <a href={`https://www.google.com/maps?q=${acc.location_lat},${acc.location_lng}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {parseFloat(acc.location_lat).toFixed(5)}, {parseFloat(acc.location_lng).toFixed(5)}
                    </a>
                  ) : 'GPS N/A'}
                </td>
                <td className="p-4 text-red-600 font-bold">{acc.description}</td>
              </tr>
            ))}
            {accidents.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-gray-500 text-xl font-semibold">
                  ✅ No accidents or emergencies reported.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Accidents;
