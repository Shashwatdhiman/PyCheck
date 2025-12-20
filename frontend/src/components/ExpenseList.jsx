import { useState, Fragment } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { Dialog, Transition, Menu } from "@headlessui/react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  MoreHorizontal,
  Trash2,
  Calendar,
  Loader2,
  Pencil,
  X,
  AlertTriangle
} from "lucide-react";

// --- HELPERS ---
const getCategoryIcon = (category) => {
  const props = { size: 18, strokeWidth: 2.5 };
  switch (category?.toLowerCase()) {
    case "food": return <Utensils {...props} />;
    case "travel": return <Car {...props} />;
    case "shopping": return <ShoppingBag {...props} />;
    case "rent": return <Home {...props} />;
    default: return <MoreHorizontal {...props} />;
  }
};

const ExpenseList = ({ expenses, onDelete, onUpdate }) => {
  // State for managing which modal is open and for which expense
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // --- ACTIONS ---
  const openDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  // --- EMPTY STATE ---
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
          <Calendar className="text-slate-300" size={40} />
        </div>
        <h3 className="text-slate-900 font-bold text-base uppercase tracking-widest">
          No Transactions
        </h3>
        <p className="text-slate-400 text-sm mt-2 max-w-[240px] leading-relaxed">
          Your financial journey starts here. Add your first expense above.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 1. THE LIST */}
      <div className="divide-y divide-slate-100">
        {expenses.map((expense) => {
          const dateObj = new Date(expense.date);
          const day = dateObj.toLocaleDateString("en-IN", { day: "numeric" });
          const month = dateObj.toLocaleDateString("en-IN", { month: "short" });

          return (
            <div
              key={expense.id}
              className="group flex items-center justify-between p-5 hover:bg-slate-50 transition-colors duration-200"
            >
              {/* LEFT: Icon & Details */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {getCategoryIcon(expense.category)}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900 capitalize leading-tight">
                    {expense.note || expense.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                    <span>{day} {month}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{expense.category}</span>
                  </span>
                </div>
              </div>

              {/* RIGHT: Amount & Menu */}
              <div className="flex items-center gap-4">
                <span className="text-base font-bold font-mono text-slate-900 tracking-tight">
                  -₹{Number(expense.amount).toLocaleString()}
                </span>

                {/* DROPDOWN MENU */}
                <Menu as="div" className="relative">
                  <Menu.Button className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
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
                              onClick={() => openEditModal(expense)}
                              className={`${
                                active ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                              } group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                            >
                              <Pencil size={16} /> Edit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => openDeleteModal(expense)}
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
            </div>
          );
        })}
      </div>

      {/* 2. EDIT MODAL */}
      <EditModal 
        isOpen={editModalOpen} 
        closeModal={() => setEditModalOpen(false)} 
        expense={selectedExpense} 
        onSuccess={onUpdate}
      />

      {/* 3. DELETE MODAL */}
      <DeleteModal 
        isOpen={deleteModalOpen} 
        closeModal={() => setDeleteModalOpen(false)} 
        expense={selectedExpense} 
        onSuccess={onDelete}
      />
    </>
  );
};

// --- SUB-COMPONENT: EDIT MODAL ---
const EditModal = ({ isOpen, closeModal, expense, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  const onOpen = () => {
    if (expense) {
      setAmount(expense.amount);
      setNote(expense.note || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`expenses/${expense.id}/update/`, { amount, note });
      toast.success("Updated successfully");
      if (onSuccess) onSuccess();
      closeModal();
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment} afterEnter={onOpen}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-slate-900">
                    Edit Transaction
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-light text-xl">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xl font-bold text-slate-900 focus:ring-2 focus:ring-slate-900/5 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Note</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-slate-900/5 transition-all"
                      placeholder="What was this for?"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- SUB-COMPONENT: DELETE MODAL ---
const DeleteModal = ({ isOpen, closeModal, expense, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`expenses/${expense.id}/`);
      toast.success("Expense deleted");
      if (onSuccess) onSuccess();
      closeModal();
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={24} />
                  </div>
                  
                  <Dialog.Title as="h3" className="text-lg font-bold text-slate-900">
                    Delete Expense?
                  </Dialog.Title>
                  
                  <div className="mt-2 mb-6">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to remove <span className="font-bold text-slate-800">{expense?.note || expense?.category}</span>? This cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition-colors flex justify-center items-center gap-2"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Delete"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ExpenseList;