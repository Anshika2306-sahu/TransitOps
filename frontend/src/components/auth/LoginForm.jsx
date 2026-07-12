import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "manager@transitops.com",
    password: "",
    role: "Fleet Manager"
  });
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-8">
      <h2 className="text-3xl font-bold mb-8 text-white">Sign In</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm text-slate-300">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-amber-400 text-white"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-slate-300">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-amber-400 text-white"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-black hover:bg-amber-400 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
