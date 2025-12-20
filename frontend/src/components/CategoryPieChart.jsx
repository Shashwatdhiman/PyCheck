import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  food: "#10b981",
  travel: "#6366f1",
  shopping: "#f43f5e",
  rent: "#f59e0b",
  other: "#94a3b8",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur rounded-lg border border-slate-700 shadow-2xl p-3 z-50">
        <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">
          {data.name}
        </p>
        <p className="text-white text-base font-mono font-bold">
          ₹{data.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const CategoryPieChart = ({ breakdown }) => {
  const { data, totalSpent } = useMemo(() => {
    if (!breakdown) return { data: [], totalSpent: 0 };
    
    const transformed = Object.entries(breakdown).map(([category, amount]) => ({
      name: category,
      value: Number(amount),
      color: COLORS[category.toLowerCase()] || COLORS.other,
    }));
    
    transformed.sort((a, b) => b.value - a.value);
    const total = transformed.reduce((acc, curr) => acc + curr.value, 0);
    
    return { data: transformed, totalSpent: total };
  }, [breakdown]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <span className="text-3xl mb-2">🤷‍♂️</span>
        <p className="text-slate-500 font-medium text-sm">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="relative z-0 bg-white p-5 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 overflow-hidden">
      <div className="relative h-64 w-full sm:w-64 flex-shrink-0 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%" 
              paddingAngle={5}
              cornerRadius={6}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            Total
          </span>
          <span className="text-slate-900 text-xl font-bold font-mono mt-1">
            ₹{totalSpent.toLocaleString(undefined, { notation: "compact" })} 
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wide">Breakdown</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            {data.length} CATS
          </span>
        </div>

        <div className="space-y-3">
          {data.map((item) => {
            const percentage = ((item.value / totalSpent) * 100).toFixed(1);
            
            return (
              <div 
                key={item.name} 
                className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium text-xs capitalize truncate">
                    {item.name}
                  </span>
                </div>
                
                <div className="text-right shrink-0 ml-4">
                  <p className="text-slate-900 font-bold text-xs font-mono">₹{item.value}</p>
                  <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden ml-auto">
                    <div 
                        className="h-full rounded-full opacity-80" 
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryPieChart;