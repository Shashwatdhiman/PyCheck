import { useState } from "react";
import api from "../api/api";
import { Wallet, Check, Loader2 } from "lucide-react";

const IncomeForm = ({ onUpdate, income }) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!amount) return;
    setIsLoading(true);
    try {
      await api.post("income/", { amount });
      setAmount("");
      onUpdate();
    } catch (error) {
      console.error("Failed to update income", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 h-full flex flex-col justify-between">
      
      {/* 1. Header with Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
            <Wallet size={16} strokeWidth={2.5} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            Monthly Income
          </h3>
        </div>
      </div>

      {/* 2. Hero Input Section */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <label className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-2">
          Total Budget
        </label>
        
        <div className="relative flex items-baseline justify-center group">
          <span className="text-slate-300 text-3xl font-light mr-2 transition-colors group-focus-within:text-slate-400">
            ₹
          </span>
          <input
            type="number"
            placeholder={income}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center text-5xl font-bold text-slate-900 bg-transparent placeholder:text-slate-200 focus:outline-none transition-all"
          />
        </div>
        <p className="text-xs text-slate-400 text-center mt-4 font-medium">
          For {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* 3. Action Button */}
      <button
        onClick={submit}
        disabled={!amount || isLoading}
        className={`
          w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300
          ${!amount 
            ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
            : "bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" /> Updating...
          </>
        ) : (
          <>
            <Check className="w-4 h-4" strokeWidth={3} /> Set Income
          </>
        )}
      </button>
    </div>
  );
};

export default IncomeForm;