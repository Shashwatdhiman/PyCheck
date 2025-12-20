import { AlertOctagon } from "lucide-react";

const ExpenseWarning = ({ income, spent }) => {
  if (!income || spent <= income) return null;

  const overBy = spent - income;

  return (
    <div className="flex justify-center w-full px-4 mt-4">
    <div
      className={`w-full max-w-5xl rounded-2xl border px-5 py-4 flex items-start gap-3
        bg-rose-50
        border-rose-200
        text-rose-800
      `}
    >
      <AlertOctagon size={20} className="mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-bold">You are overspending this month</p>
        <p className="mt-1">
          Your expenses exceed your income by{" "}
          <span className="font-semibold">₹{overBy.toLocaleString()}</span>.
        </p>
      </div>
    </div>
  </div>
);
};

export default ExpenseWarning;
