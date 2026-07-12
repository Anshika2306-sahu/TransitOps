import { useState } from "react";
import Input from "../ui/Input";

const PasswordField = ({
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="Enter your password"
        error={error}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-10 text-sm text-gray-500 hover:text-gray-700"
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default PasswordField;