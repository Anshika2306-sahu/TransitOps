import clsx from "clsx";

function Input({
  icon,
  label,
  error,
  className,
  ...props
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div
        className={clsx(
          "flex items-center rounded-xl border border-slate-700 bg-slate-800 px-4",
          error && "border-red-500"
        )}
      >
        <span className="mr-3 text-slate-400">
          {icon}
        </span>

        <input
          {...props}
          className={clsx(
            "w-full bg-transparent py-3 text-white outline-none",
            className
          )}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;