import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Fleet from './pages/Fleet';
import Maintenance from './pages/Maintenance';
import Accidents from './pages/Accidents';
import Analytics from './pages/Analytics';
import CurrentLocation from './pages/CurrentLocation';
import Settings from './pages/Settings';
import DriverLogin from './pages/DriverLogin';
import DriverPortal from './pages/DriverPortal';
import GlobalLayout from './components/GlobalLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Mobile App View for Driver */}
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driver/live/:id" element={<DriverPortal />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<GlobalLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="trips" element={<Trips />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="accidents" element={<Accidents />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="location" element={<CurrentLocation />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
