const Checkbox = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <span>{label}</span>
    </label>
  );
};

export default Checkbox;