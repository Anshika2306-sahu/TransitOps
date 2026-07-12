const roles = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Financial Analyst",
];

function BrandingPanel() {
  return (
    <div className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-center px-16">
      <h1 className="text-5xl font-bold text-amber-400">
        TransitOps
      </h1>

      <p className="mt-4 text-slate-400 leading-7">
        Smart Transport Management System
      </p>

      <div className="mt-16 space-y-4">
        {roles.map((role) => (
          <div
            key={role}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700"
          >
            {role}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandingPanel;