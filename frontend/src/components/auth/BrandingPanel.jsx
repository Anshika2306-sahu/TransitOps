import React from 'react';

function BrandingPanel() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-white bg-white/5 backdrop-blur-md border-r border-white/10 p-12 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/40 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
      </div>
      <h1 className="text-5xl font-extrabold bg-linear-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent mb-6 tracking-wide">TransitOps</h1>
      <p className="text-xl text-violet-200 text-center max-w-md font-medium">
        Smart Transport Operations Platform
      </p>
      <div className="mt-12 space-y-4 text-violet-300 font-medium">
        <p className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">✓</span> Role-Based Access Control
        </p>
        <p className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">✓</span> Fleet & Driver Dispatch
        </p>
        <p className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">✓</span> Maintenance & Expense Tracking
        </p>
      </div>
    </div>
  );
}

export default BrandingPanel;
