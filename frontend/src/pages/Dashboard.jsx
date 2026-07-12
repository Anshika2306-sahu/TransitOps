import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, CircleCheckBig, Wrench, Route, Map, Users, Percent } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState({ vehicles: [], trips: [], drivers: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [vehRes, tripRes, drvRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicles', { headers }),
        axios.get('http://localhost:5000/api/trips', { headers }),
        axios.get('http://localhost:5000/api/drivers', { headers })
      ]);
      setData({ vehicles: vehRes.data, trips: tripRes.data, drivers: drvRes.data });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-gray-500 font-semibold">Loading Dashboard...</div>;

  // KPIs
  const activeVehicles = data.vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = data.vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = data.vehicles.filter(v => v.status === 'In Shop').length;
  const retiredVehicles = data.vehicles.filter(v => v.status === 'Retired').length;
  const totalVehicles = data.vehicles.length;

  const activeTrips = data.trips.filter(t => t.status === 'On Trip' || t.status === 'Dispatched').length;
  const pendingTrips = data.trips.filter(t => t.status === 'Draft' || t.status === 'Pending').length;
  const driversOnDuty = data.drivers.filter(d => d.status === 'On Trip').length;
  const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  // Progress bar widths
  const availPct = totalVehicles ? (availableVehicles / totalVehicles) * 100 : 0;
  const onTripPct = totalVehicles ? (activeVehicles / totalVehicles) * 100 : 0;
  const inShopPct = totalVehicles ? (maintenanceVehicles / totalVehicles) * 100 : 0;
  const retiredPct = totalVehicles ? (retiredVehicles / totalVehicles) * 100 : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Trip': return 'bg-blue-600 text-white';
      case 'Dispatched': return 'bg-blue-600 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Draft': return 'bg-gray-500 text-white';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Shop': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-400 text-white';
    }
  };

  const availableTrucks = data.vehicles.filter(v => v.status === 'Available');

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      
      {/* Background Glows matching her design but adjusted for layout */}
      <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] bg-violet-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto pb-10">
        <h1 className="text-4xl font-extrabold bg-linear-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent mb-8">
          Fleet Dashboard
        </h1>

        {/* Top Filters (UI Mock) */}
        <div className="flex gap-4 mb-8">
          <div className="flex flex-col">
            <label className="text-xs text-violet-500 uppercase font-bold mb-1 tracking-wider">Filters</label>
            <select className="border border-white/60 rounded-xl px-4 py-2 w-48 bg-white/45 backdrop-blur-md text-[#2D245A] shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all font-medium">
              <option>Vehicle Type: All</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <select className="border border-white/60 rounded-xl px-4 py-2 w-48 bg-white/45 backdrop-blur-md text-[#2D245A] shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition-all font-medium">
              <option>Status: All</option>
            </select>
          </div>
        </div>

        {/* 7 KPI Row matching her glassmorphism */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-10">
          
          {/* Active Vehicles */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-300/40 mb-4">
              <Truck className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Active Vehicles</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{activeVehicles}</p>
          </div>

          {/* Available Vehicles */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-300/40 mb-4">
              <CircleCheckBig className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Available Vehicles</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{availableVehicles}</p>
          </div>

          {/* Maintenance */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-300/40 mb-4">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">In Maintenance</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{maintenanceVehicles}</p>
          </div>

          {/* Active Trips */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-300/40 mb-4">
              <Route className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Active Trips</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{activeTrips}</p>
          </div>

          {/* Pending Trips */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-300/40 mb-4">
              <Map className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Pending Trips</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{pendingTrips}</p>
          </div>

          {/* Drivers On Duty */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-300/40 mb-4">
              <Users className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Drivers On Duty</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{driversOnDuty}</p>
          </div>

          {/* Fleet Utilization */}
          <div className="rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] hover:shadow-[0_12px_40px_rgba(109,94,245,0.20)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-300/40 mb-4">
              <Percent className="text-white w-6 h-6" />
            </div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-500">Utilization</p>
            <p className="text-3xl font-extrabold text-[#2D245A] mt-2">{fleetUtilization}%</p>
          </div>

        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Left Column: Tables */}
          <div className="flex-grow flex flex-col gap-8 xl:w-2/3">
            
            {/* Available Trucks Table */}
            <div>
              <h2 className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-4">Available Trucks</h2>
              <div className="rounded-3xl bg-white/45 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/40 sticky top-0 bg-white/40 backdrop-blur-md z-10">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Reg Number</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Model</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Capacity (kg)</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableTrucks.slice(0, 10).map((v) => (
                      <tr key={v.id} className="border-b border-white/20 last:border-b-0 hover:bg-white/30 transition-all">
                        <td className="p-4 font-mono font-bold text-[#2D245A]">{v.registration_number}</td>
                        <td className="p-4 font-medium text-gray-700">{v.name_model}</td>
                        <td className="p-4 font-medium text-gray-700">{v.max_load_capacity.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {availableTrucks.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-violet-500 font-semibold">No trucks available right now.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Trips Table (Read Only) */}
            <div>
              <h2 className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-4">Recent Trips</h2>
              <div className="rounded-3xl bg-white/45 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/40 bg-white/40 backdrop-blur-md">
                    <tr>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Trip</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Vehicle</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Driver</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">Status</th>
                      <th className="p-4 text-xs font-semibold text-violet-700 uppercase">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.trips.slice(0, 5).map((t) => (
                      <tr key={t.id} className="border-b border-white/20 last:border-b-0 hover:bg-white/30 transition-all">
                        <td className="p-4 font-bold text-[#2D245A]">TR{String(t.id).padStart(3, '0')}</td>
                        <td className="p-4 font-medium text-gray-700">{t.registration_number}</td>
                        <td className="p-4 font-medium text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                          {t.driver_name}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-600 text-sm">
                          {t.status === 'Completed' ? '—' : (t.status === 'Draft' ? 'Awaiting vehicle' : `${Math.floor(Math.random() * 2) + 1}h ${Math.floor(Math.random() * 50) + 10}m`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Vehicle Status Progress Bars */}
          <div className="w-full xl:w-1/3">
            <h2 className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-4">Vehicle Status</h2>
            <div className="rounded-3xl bg-white/45 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(109,94,245,0.12)] p-6 flex flex-col gap-6">
              
              <div className="flex items-center">
                <span className="w-24 text-sm font-bold text-violet-700">Available</span>
                <div className="flex-grow h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${availPct}%` }}></div>
                </div>
                <span className="w-12 text-right text-sm font-extrabold text-[#2D245A]">{availableVehicles}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-24 text-sm font-bold text-violet-700">On Trip</span>
                <div className="flex-grow h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-linear-to-r from-blue-400 to-indigo-500 transition-all duration-500" style={{ width: `${onTripPct}%` }}></div>
                </div>
                <span className="w-12 text-right text-sm font-extrabold text-[#2D245A]">{activeVehicles}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-24 text-sm font-bold text-violet-700">In Shop</span>
                <div className="flex-grow h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-linear-to-r from-orange-400 to-red-500 transition-all duration-500" style={{ width: `${inShopPct}%` }}></div>
                </div>
                <span className="w-12 text-right text-sm font-extrabold text-[#2D245A]">{maintenanceVehicles}</span>
              </div>
              
              <div className="flex items-center">
                <span className="w-24 text-sm font-bold text-violet-700">Retired</span>
                <div className="flex-grow h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-linear-to-r from-gray-400 to-gray-600 transition-all duration-500" style={{ width: `${retiredPct}%` }}></div>
                </div>
                <span className="w-12 text-right text-sm font-extrabold text-[#2D245A]">{retiredVehicles}</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
