import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DriverLogin = () => {
  const [license, setLicense] = useState('DL-DEMO-123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/drivers/login', { license_number: license });
      const vehicleId = res.data.vehicle_id;
      navigate(`/driver/live/${vehicleId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid License Number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#1A0B2E] via-[#2D1B69] to-[#1A0B2E] flex flex-col items-center justify-center p-6 text-white font-sans">
      
      {/* Background Glows */}
      <div className="absolute -top-32 -left-20 w-[30rem] h-[30rem] bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(109,94,245,0.2)] w-full max-w-sm border border-white/20">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-violet-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">Driver Portal</h1>
          <p className="text-violet-200 text-sm mt-2 font-medium">Enter your License Number to access your live manifest.</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-center text-sm font-semibold">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">License Number</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. DL-002"
              className="w-full bg-white/5 border border-white/20 p-4 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 uppercase transition-all" 
              value={license} 
              onChange={e => setLicense(e.target.value.toUpperCase())} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-4 px-4 rounded-xl text-white transition-all duration-300 shadow-lg ${loading ? 'bg-violet-800/50 cursor-not-allowed' : 'bg-linear-to-r from-violet-600 to-purple-500 shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5'}`}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default DriverLogin;
