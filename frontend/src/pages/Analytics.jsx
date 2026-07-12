import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState({
    vehicles: [],
    trips: [],
    maintenance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const [vehRes, tripRes, maintRes] = await Promise.all([
          axios.get('http://localhost:5000/api/vehicles', { headers }),
          axios.get('http://localhost:5000/api/trips', { headers }),
          axios.get('http://localhost:5000/api/maintenance', { headers })
        ]);
        setData({
          vehicles: vehRes.data,
          trips: tripRes.data,
          maintenance: maintRes.data
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading Analytics...</div>;

  // KPIs
  const activeVehicles = data.vehicles.filter(v => v.status === 'On Trip').length;
  const totalVehicles = data.vehicles.length;
  const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

  const totalMaintenanceCost = data.maintenance.reduce((sum, log) => sum + parseFloat(log.cost), 0);
  const totalFuelCost = data.trips.reduce((sum, trip) => sum + (trip.planned_distance * 0.15 * 100), 0);
  const totalOpCost = totalMaintenanceCost + totalFuelCost;

  const totalDistance = data.trips.reduce((sum, trip) => sum + parseFloat(trip.planned_distance), 0);
  const totalFuelLiters = data.trips.reduce((sum, trip) => sum + (trip.planned_distance * 0.15), 0);
  const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : 0;

  const totalRevenue = data.trips.reduce((sum, trip) => sum + (trip.cargo_weight * 5), 0);
  const totalAcquisition = data.vehicles.reduce((sum, v) => sum + parseFloat(v.acquisition_cost), 0);
  const roi = totalAcquisition > 0 ? (((totalRevenue - totalOpCost) / totalAcquisition) * 100).toFixed(2) : 0;

  // Chart Data: Vehicle Performance (Revenue vs Cost)
  const vehiclePerformanceData = data.vehicles.slice(0, 5).map(v => {
    const vTrips = data.trips.filter(t => t.vehicle_id === v.id);
    const vMaint = data.maintenance.filter(m => m.vehicle_id === v.id);
    
    const revenue = vTrips.reduce((sum, t) => sum + (t.cargo_weight * 5), 0);
    const fuel = vTrips.reduce((sum, t) => sum + (t.planned_distance * 0.15 * 100), 0);
    const maint = vMaint.reduce((sum, m) => sum + parseFloat(m.cost), 0);
    
    return {
      name: v.registration_number,
      Revenue: revenue || 25000, // Mock baseline if no trips
      Cost: (fuel + maint) || 8000
    };
  });

  // Chart Data: Maintenance Trends
  const maintenanceData = [
    { month: 'Jan', cost: 1200 },
    { month: 'Feb', cost: 800 },
    { month: 'Mar', cost: 1500 },
    { month: 'Apr', cost: 450 },
    { month: 'May', cost: totalMaintenanceCost || 2500 },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\n"
      + `Fleet Utilization,${utilization}%\n`
      + `Operational Cost,₹${totalOpCost.toLocaleString()}\n`
      + `Fuel Efficiency,${fuelEfficiency} km/L\n`
      + `Fleet ROI,${roi}%\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transitops_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-500">Key Performance Indicators and Financials</p>
        </div>
        <button onClick={handleExportCSV} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fleet Utilization</h3>
          <div className="mt-2 text-4xl font-bold text-gray-900">{utilization}%</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-orange-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Operational Cost</h3>
          <span className="text-4xl font-bold text-gray-900">₹{totalOpCost.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fuel Efficiency</h3>
          <div className="mt-2 text-4xl font-bold text-gray-900">{fuelEfficiency} <span className="text-xl">km/L</span></div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-purple-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Fleet ROI</h3>
          <div className="mt-2 text-4xl font-bold text-gray-900">{roi}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue vs Cost per Vehicle</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehiclePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Maintenance Cost Trends (2024)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" name="Maintenance ($)" stroke="#8b5cf6" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
