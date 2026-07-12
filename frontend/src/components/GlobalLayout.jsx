import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const GlobalLayout = () => {
  const navigate = useNavigate();

  const getNavClass = (isActive) => 
    isActive
      ? "block px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-lg text-white font-semibold border border-white/20 shadow-md transition-all duration-300 hover:bg-white/30"
      : "block px-4 py-3 rounded-2xl text-violet-100 hover:bg-white/10 hover:text-white transition-all duration-300";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-linear-to-b from-[#2D1B69] via-[#4A36A8] to-[#6D5EF5] flex flex-col shadow-2xl">

        <div className="p-6 border-b border-white/20">
          <h2 className="text-3xl font-extrabold text-white tracking-wide">
            TransitOps
          </h2>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">

          <NavLink to="/dashboard" className={({isActive}) => getNavClass(isActive)}>
            Dashboard
          </NavLink>

          <NavLink to="/fleet" className={({isActive}) => getNavClass(isActive)}>
            Fleet
          </NavLink>

          <NavLink to="/trips" className={({isActive}) => getNavClass(isActive)}>
            Trips
          </NavLink>

          <NavLink to="/maintenance" className={({isActive}) => getNavClass(isActive)}>
            Maintenance
          </NavLink>

          <NavLink to="/location" className={({isActive}) => getNavClass(isActive)}>
            Location
          </NavLink>

          <NavLink to="/analytics" className={({isActive}) => getNavClass(isActive)}>
            Analytics
          </NavLink>

          <NavLink to="/settings" className={({isActive}) => getNavClass(isActive)}>
            Settings
          </NavLink>

          <NavLink to="/accidents" className={({isActive}) => 
            isActive 
              ? "block px-4 py-3 mt-6 rounded-2xl bg-red-500/40 border border-red-300 text-white font-bold shadow-lg transition-all duration-300"
              : "block px-4 py-3 mt-6 rounded-2xl bg-red-500/20 border border-red-300/30 text-red-100 font-semibold hover:bg-red-500/30 transition-all duration-300"
          }>
            Accidents
          </NavLink>

        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="h-16 bg-linear-to-r from-[#5B46C5] via-[#6D5EF5] to-[#7C6BF7] flex items-center justify-between px-6 shadow-lg border-b border-violet-300/20">

          <input
            className="w-64 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 text-white placeholder:text-violet-100 outline-none focus:ring-2 focus:ring-violet-300 transition-all"
            placeholder="Search..."
          />

          <div className="flex items-center gap-4">

            <span className="font-semibold text-white">
              Admin K.
            </span>

            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center font-bold shadow-md">
              AK
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Log Out
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#F6F3FF] p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default GlobalLayout;
