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
    <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(109,94,245,0.2)] p-10">
      <h2 className="text-3xl font-extrabold mb-8 text-white tracking-wide">Sign In</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-xs font-bold text-violet-300 uppercase tracking-wider">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-4 py-4 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 text-white placeholder:text-white/30 transition-all"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-xs font-bold text-violet-300 uppercase tracking-wider">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-4 py-4 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 text-white placeholder:text-white/30 transition-all"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-linear-to-r from-violet-600 to-purple-500 py-4 font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all duration-300 mt-4"
        >
          Access Dashboard
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
