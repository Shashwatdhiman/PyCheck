import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Added Link for Register
import { PieChart, User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      navigate("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-10">

        {/* 1. LOGO HEADER */}
        <div className="flex flex-col items-center text-center mb-10">
          <img src="/download.svg" alt="Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Enter your details to access your dashboard
          </p>
        </div>

        {/* 2. ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm font-medium animate-pulse">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* 3. FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all placeholder:text-slate-300"
                placeholder="Ex. johndoe"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/5 focus:bg-white transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                Log In<ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* 4. FOOTER / REGISTER LINK */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;