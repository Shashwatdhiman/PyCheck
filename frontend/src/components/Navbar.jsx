import { useNavigate } from "react-router-dom";
import { PieChart, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3 select-none">
            <img src="/download.svg" alt="Logo" className="h-8" />
        </div>

        {/* ACTIONS */}
        <button
          onClick={logout}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
        >
          <span className="hidden sm:block">Log Out</span>
          <LogOut 
            size={18} 
            className="group-hover:translate-x-0.5 transition-transform" 
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;