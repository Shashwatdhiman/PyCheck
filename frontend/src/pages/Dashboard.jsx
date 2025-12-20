import { useEffect, useState } from "react";
import api from "../api/api";
import { TrendingUp, TrendingDown, Wallet, ArrowRight, PiggyBank } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import IncomeForm from "../components/IncomeForm";
import CategoryPieChart from "../components/CategoryPieChart";
import BudgetProgress from "../components/BudgetProgress";
import BudgetForm from "../components/BudgetForm";
import BudgetWarning from "../components/BudgetWarning";
import ExpenseWarning from "../components/ExpenseWarning";
import MonthSwitcher from "../components/MonthSwitcher";
import InsightCards from "../components/InsightCards";


const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);


  const fetchAll = async () => {
    setIsLoading(true);

    const today = new Date();
    const isCurrentMonth =
      year === today.getFullYear() &&
      month === today.getMonth() + 1;

    try {
      if (isCurrentMonth) {
        await api.post("expenses/generate-recurring/");
      }

      const [dash, exp, bud, ins] = await Promise.all([
        api.get(`dashboard/?year=${year}&month=${month}`),
        api.get(`expenses/?year=${year}&month=${month}`),
        api.get(`budgets/?year=${year}&month=${month}`),
        api.get(`insights/?year=${year}&month=${month}`)
      ]);

      setDashboard(dash.data);
      setExpenses(exp.data);
      setBudgets(bud.data);
      setInsights(ins.data);
    } catch (error) {
      console.error("Dashboard fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAll();
  }, [year, month]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-page-bg">
      <Navbar />
      {dashboard.monthly_balance < 0 && (
        <div className="bg-amber-50 max-w-6xl mx-auto border border-amber-200 text-amber-800 text-sm rounded-2xl p-4">
          You spent more than your income this month.  
          ₹{Math.abs(dashboard.monthly_balance)} was deducted from your savings.
        </div>
      )}


      <BudgetWarning summary={dashboard?.budget_summary} />
      <ExpenseWarning income={dashboard?.income} spent={dashboard?.total_spent} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <MonthSwitcher
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
        {dashboard && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              label="Income"
              value={dashboard.income}
              icon={<Wallet size={20} className="text-emerald-600" />}
            />

            <StatCard
              label="Spent"
              value={dashboard.total_spent}
              icon={<TrendingDown size={20} className="text-rose-600" />}
            />

            <StatCard
              label="Monthly Balance"
              value={dashboard.monthly_balance}
              icon={<TrendingUp size={20} />}
              accent={dashboard.monthly_balance >= 0 ? "emerald" : "rose"}
            />

            <StatCard
              label="Savings"
              value={dashboard.savings_balance}
              icon={<PiggyBank size={20} />}
              accent={dashboard.savings_balance >= 0 ? "indigo" : "rose"}
            />
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24 z-10 h-fit">
            <div className="h-auto">
              <IncomeForm onUpdate={fetchAll} income={dashboard?.income} />
            </div>

            <div className="h-auto">
              <ExpenseForm onAdd={fetchAll} />
            </div>
          </div>


          <div className="lg:col-span-7 space-y-8">
            <InsightCards insights={insights} />

            <div>
              <h3 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                Analytics
              </h3>
              <CategoryPieChart breakdown={dashboard?.category_breakdown} />
            </div>
            <div>
              <h3 className="text-slate-900 font-bold text-lg mb-4">
                Category Budgets
              </h3>

              <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 p-6 space-y-6">

                <BudgetForm onSave={fetchAll} />

                <div className="border-t border-slate-100 pt-6 space-y-5">
                  {budgets.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No budgets set yet.
                    </p>
                  )}

                  {budgets.map((budget) => (
                    <BudgetProgress
                      key={budget.id}
                      id={budget.id}
                      category={budget.category}
                      budget={budget.amount}
                      spent={dashboard?.category_breakdown?.[budget.category] || 0}
                      onUpdate={fetchAll}
                    />
                  ))}
                </div>
              </div>
            </div>


            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-900 font-bold text-lg">
                  Recent Transactions
                </h3>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                <ExpenseList expenses={expenses} onDelete={fetchAll} onUpdate={fetchAll} />
              </div>
            </div>

          </div>
        </section>
      </main>
      <style>{`
        .chatbot-page-bg {
          background-color: #f7f7ff;
          background-image: radial-gradient(#d1d1d1 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, value, icon, accent = "slate" }) => {
  const isNegative = Number(value) < 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-slate-50">
          {icon}
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p
        className={`text-2xl font-bold font-mono ${
          isNegative ? "text-rose-600" : "text-slate-900"
        }`}
      >
        ₹{Math.abs(value)?.toLocaleString()}
      </p>

      {isNegative && (
        <p className="text-xs text-rose-500 mt-1">
          Deficit covered by savings
        </p>
      )}
    </div>
  );
};


export default Dashboard;