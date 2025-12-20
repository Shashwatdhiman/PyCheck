import { AlertTriangle } from "lucide-react";

const BudgetWarning = ({ summary }) => {
  if (!summary || !summary.is_over_budgeted) return null;

  const overBy = Math.abs(summary.difference);

  // Severity logic
  const severity =
    overBy > summary.income * 0.2 ? "danger" : "warning";

  const styles = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    danger: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
    },
  };

  return (
    <div className="flex justify-center w-full px-4 mt-4">
      <div
        className={`w-full max-w-5xl rounded-2xl border px-5 py-4 flex items-start gap-3
          ${styles[severity].bg}
          ${styles[severity].border}
          ${styles[severity].text}
        `}
      >
      <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />

      <div className="text-sm">
        <p className="font-bold">
          Budgets exceed your income
        </p>
        <p className="mt-1">
          You have planned{" "}
          <span className="font-semibold">
            ₹{overBy.toLocaleString()}
          </span>{" "}
          more than your monthly income.
        </p>
      </div>
    </div>
    </div>
  );
};

export default BudgetWarning;
