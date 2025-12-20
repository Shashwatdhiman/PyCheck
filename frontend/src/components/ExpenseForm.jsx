import { useState } from "react";
import api from "../api/api";
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "food", label: "Food", icon: <Utensils size={20} /> },
  { id: "travel", label: "Travel", icon: <Car size={20} /> },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag size={20} /> },
  { id: "rent", label: "Rent", icon: <Home size={20} /> },
  { id: "other", label: "Other", icon: <MoreHorizontal size={20} /> },
];

const ExpenseForm = ({ onAdd }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDay, setRecurrenceDay] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    if (!amount) return;
    setIsLoading(true);

    try {
      // 1️⃣ Create expense
      await api.post("expenses/", {
        amount,
        category,
        note,
        date: new Date().toISOString().slice(0, 10),
        is_recurring: isRecurring,
        recurrence_day: isRecurring ? recurrenceDay : null,
      });

      toast.success("Expense added");

      // 2️⃣ Fetch dashboard for alerts
      const dashRes = await api.get("dashboard/");
      const data = dashRes.data;

      // -------- CATEGORY ALERT --------
      const categoryBudget = data.category_budgets?.[category];
      if (categoryBudget) {
        const percent = categoryBudget.percentage;

        if (percent >= 100) {
          toast.error(
            `🚨 ${category.toUpperCase()} budget exceeded (${percent}%)`
          );
        } else if (percent >= 80) {
          toast(
            `⚠️ ${category.toUpperCase()} budget at ${percent}%`,
            { icon: "⚠️" }
          );
        }
      }

      // -------- OVERALL SPENDING ALERT --------
      if (data.total_spent > data.income) {
        toast.error("💸 You are overspending this month");
      }

      // 3️⃣ Reset form
      setAmount("");
      setNote("");
      setCategory("food");
      setIsRecurring(false);
      setRecurrenceDay(1);

      // 4️⃣ Refresh dashboard
      onAdd();

    } catch (error) {
      console.error("Failed to add expense", error);
      toast.error("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          New Transaction
        </h3>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-md">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      <div className="space-y-8 flex-1">

        {/* Amount */}
        <div className="relative flex items-baseline justify-center border-b border-slate-100 pb-2 focus-within:border-slate-900 transition-colors">
          <span className="text-slate-400 text-3xl font-light mr-2">₹</span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center text-5xl font-bold text-slate-900 bg-transparent placeholder:text-slate-200 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block text-center">
            Select Category
          </label>
          <div className="grid grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  type="button"
                  className={`
                    flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300
                    ${isSelected
                      ? "bg-slate-900 text-white shadow-lg scale-105"
                      : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600"}
                  `}
                >
                  <div className={`mb-2 ${isSelected ? "scale-110" : ""}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    isSelected ? "text-slate-200" : "text-slate-400"
                  }`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <input
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-sm font-medium rounded-xl px-4 py-4 focus:bg-slate-100 transition-all placeholder:text-slate-400 text-center"
          />
        </div>

        {/* Recurring */}
        <div className="space-y-4">
          <label className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Recurring monthly
              </p>
              <p className="text-xs text-slate-400">
                Automatically add this expense every month
              </p>
            </div>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 accent-slate-900"
            />
          </label>

          {isRecurring && (
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Repeat on day
              </p>
              <select
                value={recurrenceDay}
                onChange={(e) => setRecurrenceDay(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          onClick={submit}
          disabled={!amount || isLoading}
          className={`
            w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
            ${!amount
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-0.5"}
          `}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <Plus strokeWidth={3} className="w-5 h-5" />
              Add Expense
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExpenseForm;
