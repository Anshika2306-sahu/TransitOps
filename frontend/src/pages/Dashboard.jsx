import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Active Vehicles</p>
          <p className="text-2xl font-bold mt-2">53</p>
        </div>
        <div className="bg-white p-4 rounded border-l-4 border-green-500 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Available Vehicles</p>
          <p className="text-2xl font-bold mt-2">42</p>
        </div>
        <div className="bg-white p-4 rounded border-l-4 border-orange-500 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase">Vehicles In Maintenance</p>
          <p className="text-2xl font-bold mt-2">5</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
