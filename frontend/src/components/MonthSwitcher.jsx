import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthSwitcher = ({ year, month, onChange }) => {
  const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 w-fit">
      <button
        onClick={prevMonth}
        className="p-1 rounded-lg hover:bg-slate-100"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="font-bold text-slate-900 tracking-tight">
        {monthName}
      </span>

      <button
        onClick={nextMonth}
        className="p-1 rounded-lg hover:bg-slate-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default MonthSwitcher;
