import React, { useState } from "react";

export default function Fleet() {
  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");

  const metrics = [
    { title: "Active Vehicle", value: "10", color: "border-l-blue-500" },
    { title: "Available Vehicle", value: "13", color: "border-l-green-500" },
    { title: "In Maintenance", value: "7", color: "border-l-orange-500" },
    { title: "Active Driver", value: "19", color: "border-l-indigo-500" },
    { title: "Pending Trip", value: "6", color: "border-l-cyan-500" },
    { title: "Driver Vacancy", value: "11", color: "border-l-purple-500" },
    { title: "Fleet Utilization", value: "33%", color: "border-l-emerald-500" },
  ];

  const [tableData, setTableData] = useState([
    { id: "MH-01-AX-1001", model: "Mahendra Altroz", capacity: "1420 KG", status: "Available" },
    { id: "DL-03-BY-2002", model: "Tata Ace", capacity: "1150 KG", status: "Available" },
    { id: "MH-02-CZ-3003", model: "Eicher Pro", capacity: "1950 KG", status: "Available" },
    { id: "MH-04-DE-4004", model: "Tata Signa", capacity: "1350 KG", status: "Available" },
  ]);

  const statusProgress = [
    { name: "Available", count: 13, max: 20, color: "bg-green-500" },
    { name: "On Trip", count: 10, max: 20, color: "bg-blue-500" },
    { name: "In Shop", count: 7, max: 20, color: "bg-orange-500" },
    { name: "Retired", count: 4, max: 20, color: "bg-gray-400" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 text-gray-700">
      
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex gap-4 flex-wrap items-center">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Vehicle Type</label>
            <select 
              value={vehicleType} 
              onChange={(e) => setVehicleType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none min-w-[150px] text-gray-600"
            >
              <option value="All">Vehicle Type: All</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none min-w-[150px] text-gray-600"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Region</label>
            <select 
              value={region} 
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-sm focus:outline-none min-w-[150px] text-gray-600"
            >
              <option value="All">Region: All</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {metrics.map((item, idx) => (
          <div key={idx} className={`bg-white rounded-lg border-l-4 ${item.color} shadow-sm p-4 flex flex-col justify-between`}>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{item.title}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Trucks</h3>
          </div>
          
          <div className="overflow-x-auto border border-gray-100 rounded-lg max-h-[350px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] tracking-wider border-b sticky top-0">
                <tr>
                  <th className="py-3 px-4">Truck Number</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Capacity/Load</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-800">{row.id}</td>
                    <td className="py-3 px-4">{row.model}</td>
                    <td className="py-3 px-4 text-gray-400">{row.capacity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded-md font-medium inline-block">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Vehicle Status</h3>
          
          <div className="space-y-5">
            {statusProgress.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-600 w-20">{item.name}</span>
                
                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full`} 
                    style={{ width: `${(item.count / item.max) * 100}%` }}
                  ></div>
                </div>
                
                <span className="text-sm font-bold text-gray-700 w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-6 bg-white rounded-xl border shadow-sm p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Failure Logs</h3>
        <div className="mt-4 p-8 text-center text-sm text-gray-400 border border-dashed rounded-lg bg-gray-50">
          No failures logs reported today.
        </div>
      </div>

    </div>
  );
}