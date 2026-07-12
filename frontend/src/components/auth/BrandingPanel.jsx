import React from 'react';

function BrandingPanel() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-white bg-slate-900 border-r border-slate-800 p-12">
      <h1 className="text-5xl font-bold text-amber-500 mb-6">TransitOps</h1>
      <p className="text-xl text-slate-300 text-center max-w-md">
        Smart Transport Operations Platform
      </p>
      <div className="mt-12 space-y-4 text-slate-400">
        <p>✓ Role-Based Access Control</p>
        <p>✓ Fleet & Driver Dispatch</p>
        <p>✓ Maintenance & Expense Tracking</p>
      </div>
    </div>
  );
}

export default BrandingPanel;
