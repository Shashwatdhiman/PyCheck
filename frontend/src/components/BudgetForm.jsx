import { useState } from "react";
import api from "../api/api";

const BudgetForm = ({ onSave }) => {
  const [category, setCategory] = useState("food");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!amount) return;

    setLoading(true);
    try {
      await api.post("budgets/", {
        category,
        amount,
      });
      setAmount("");
      onSave(); // refresh dashboard + budgets
    } catch (err) {
      console.error("Failed to save budget", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-slate-900 font-bold text-lg">
        Set Category Budget
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="food">Food</option>
          <option value="travel">Travel</option>
          <option value="shopping">Shopping</option>
          <option value="rent">Rent</option>
          <option value="other">Other</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Budget"}
      </button>
    </div>
  );
};

export default BudgetForm;
