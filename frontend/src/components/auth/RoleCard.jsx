const roles = [
  {
    name: "Fleet Manager",
    description: "Fleet, Maintenance",
  },
  {
    name: "Dispatcher",
    description: "Dashboard, Trips",
  },
  {
    name: "Safety Officer",
    description: "Drivers, Compliance",
  },
  {
    name: "Financial Analyst",
    description: "Fuel & Expenses, Analytics",
  },
];

const RoleCard = ({
  selectedRole,
  setSelectedRole,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">
        Select Role
      </p>

      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.name}
            type="button"
            onClick={() => setSelectedRole(role.name)}
            className={`rounded-lg border p-3 text-left transition ${
              selectedRole === role.name
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <p className="font-medium text-sm text-gray-800">
              {role.name}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {role.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleCard;