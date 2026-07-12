import React from 'react';
import { Outlet } from 'react-router-dom';

const GlobalLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Stub */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">TransitOps</h2>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          <a href="/dashboard" className="block px-4 py-2 bg-orange-100 text-orange-600 rounded">Dashboard</a>
          <a href="/fleet" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Fleet</a>
          <a href="/trips" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Trips</a>
          <a href="/maintenance" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Maintenance</a>
          <a href="/accidents" className="block px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded mt-4 border border-red-100">🚨 Accidents</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Stub */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <input className="border rounded p-2 w-64" placeholder="Search..." />
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Admin K.</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">AK</div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="px-3 py-1 bg-red-50 text-red-600 font-semibold rounded border border-red-200 hover:bg-red-100 transition"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GlobalLayout;
