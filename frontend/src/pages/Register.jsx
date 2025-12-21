import { useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("register/", { username, password });
      navigate("/login");
    } catch (err) {
      setError("Username already exists or invalid input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-2xl font-bold text-center mb-2">
          Create account
        </h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Start tracking your money smarter
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-xl bg-slate-50"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-slate-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 text-white flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-slate-900">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
