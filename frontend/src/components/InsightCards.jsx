import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

const ICONS = {
  danger: <AlertTriangle className="text-rose-600" size={18} />,
  warning: <TrendingUp className="text-amber-500" size={18} />,
  positive: <CheckCircle className="text-emerald-600" size={18} />
};

const InsightCards = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="grid gap-4">
      {insights.map((insight, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
        >
          {ICONS[insight.severity]}
          <p className="text-sm text-slate-800 font-medium">
            {insight.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default InsightCards;
