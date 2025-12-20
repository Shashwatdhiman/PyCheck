import { useState, Fragment } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { Dialog, Transition, Menu } from "@headlessui/react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

// --- HELPERS ---
const getStatusConfig = (percent) => {
  if (percent >= 100) return { color: "bg-rose-500", text: "bg-rose-50 text-rose-600", label: "Over Budget", icon: AlertCircle };
  if (percent >= 80) return { color: "bg-amber-500", text: "bg-amber-50 text-amber-600", label: "Near Limit", icon: AlertTriangle };
  return { color: "bg-emerald-500", text: "bg-emerald-50 text-emerald-600", label: "On Track", icon: CheckCircle2 };
};

const BudgetProgress = ({ id, category, spent, budget, onUpdate }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const percentage = budget ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const status = getStatusConfig(percentage);
  const StatusIcon = status.icon;

  return (
    <>
      <div className="group p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* HEADER ROW */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 capitalize mb-1">
              {category}
            </h4>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${status.text}`}>
              <StatusIcon size={12} strokeWidth={3} />
              {status.label}
            </div>
          </div>

          {/* MENU (Same as ExpenseList) */}
          <Menu as="div" className="relative">
            <Menu.Button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={20} />
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white shadow-xl border border-slate-100 focus:outline-none z-20 overflow-hidden">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className={`${
                          active ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                        } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                      >
                        <Pencil size={16} /> Edit Budget
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setIsDeleteOpen(true)}
                        className={`${
                          active ? 'bg-rose-50 text-rose-600' : 'text-rose-500'
                        } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 ease-out ${status.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* FOOTER NUMBERS */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spent</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹{spent.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Limit</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹{Number(budget).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <EditBudgetModal 
        isOpen={isEditOpen} 
        closeModal={() => setIsEditOpen(false)} 
        currentAmount={budget}
        id={id}
        onSuccess={onUpdate}
      />

      <DeleteBudgetModal 
        isOpen={isDeleteOpen} 
        closeModal={() => setIsDeleteOpen(false)} 
        id={id}
        category={category}
        onSuccess={onUpdate}
      />
    </>
  );
};

// --- EDIT MODAL ---
const EditBudgetModal = ({ isOpen, closeModal, currentAmount, id, onSuccess }) => {
  const [amount, setAmount] = useState(currentAmount);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`budgets/${id}/`, { amount });
      toast.success("Budget updated");
      if (onSuccess) onSuccess();
      closeModal();
    } catch {
      toast.error("Failed to update budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-lg font-bold text-slate-900">Edit Limit</Dialog.Title>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">New Budget Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-light text-xl">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </button>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- DELETE MODAL ---
const DeleteBudgetModal = ({ isOpen, closeModal, id, category, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`budgets/${id}/`);
      toast.success("Budget removed");
      if (onSuccess) onSuccess();
      closeModal();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle size={24} />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-900 mb-2">Remove Budget?</Dialog.Title>
              <p className="text-sm text-slate-500 mb-6">
                You are about to remove the budget limit for <span className="font-bold text-slate-800 capitalize">{category}</span>.
              </p>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm">Cancel</button>
                <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600">
                  {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : "Remove"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BudgetProgress;